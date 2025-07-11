import { describe, it, expect, afterEach } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

describe('session detection', () => {
    const TEST_MESSAGE = 'hello from session detection test';
    const TEST_DIR = '/tmp/claude-gui-test';
    let claudeProcess: ChildProcess | null = null;

    afterEach(() => {
        // Clean up Claude process if still running
        if (claudeProcess && !claudeProcess.killed) {
            claudeProcess.kill();
        }
    });

    it('should detect Claude session ID from JSONL file', async () => {
        // Create test directory
        await fs.mkdir(TEST_DIR, { recursive: true });

        // Convert CWD to Claude projects path format
        const claudePath = TEST_DIR.replace(/\//g, '-');
        const projectsDir = join(homedir(), '.claude', 'projects', claudePath);

        // Spawn Claude with a test message
        claudeProcess = spawn('claude', [TEST_MESSAGE], {
            cwd: TEST_DIR,
            stdio: 'pipe',
        });

        // Wait for Claude to start and create session file
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Find the newest JSONL file
        const files = await fs.readdir(projectsDir).catch(() => []);
        const jsonlFiles = files.filter((f) => f.endsWith('.jsonl'));

        expect(jsonlFiles.length).toBeGreaterThan(0);

        // Get the newest file by creation time
        const fileStats = await Promise.all(
            jsonlFiles.map(async (file) => {
                const stats = await fs.stat(join(projectsDir, file));
                return { file, birthtime: stats.birthtime };
            }),
        );

        fileStats.sort((a, b) => b.birthtime.getTime() - a.birthtime.getTime());
        const newestFile = fileStats[0].file;
        const sessionId = newestFile.replace('.jsonl', '');

        expect(sessionId).toMatch(/^[a-f0-9-]{36}$/); // UUID format

        // Wait for user message to appear in JSONL
        const jsonlPath = join(projectsDir, newestFile);
        let foundUserMessage = false;

        for (let i = 0; i < 30; i++) {
            try {
                const content = await fs.readFile(jsonlPath, 'utf8');
                const lines = content.trim().split('\n').filter(Boolean);

                for (const line of lines) {
                    const entry = JSON.parse(line);
                    if (entry.type === 'user' && entry.message?.includes(TEST_MESSAGE)) {
                        foundUserMessage = true;
                        break;
                    }
                }

                if (foundUserMessage) break;
            } catch {
                // File might not exist yet or be incomplete
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        expect(foundUserMessage).toBe(true);
    }, 60000); // 60 second timeout for this test
});
