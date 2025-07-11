import { describe, it, expect, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import * as pty from 'node-pty';

describe('session detection', () => {
    const TEST_MESSAGE = 'hello from session detection test';
    const TEST_DIR = join(process.cwd(), 'temp', 'claude-gui-test');
    let ptyProcess: pty.IPty | null = null;

    afterEach(async () => {
        // Clean up PTY process if still running
        if (ptyProcess) {
            ptyProcess.kill();
            // Give it time to clean up
            await new Promise((resolve) => setTimeout(resolve, 1000));
            ptyProcess = null;
        }
    });

    it('should detect Claude session ID from JSONL file', async () => {
        // Create test directory
        await fs.mkdir(TEST_DIR, { recursive: true });

        // Convert CWD to Claude projects path format
        const claudePath = TEST_DIR.replace(/\//g, '-');
        const projectsDir = join(homedir(), '.claude', 'projects', claudePath);

        // Record timestamp before spawning Claude
        const testStartTime = new Date();
        console.log('Test started at:', testStartTime);

        // Spawn Claude in a PTY with trust bypass
        ptyProcess = pty.spawn('claude', [TEST_MESSAGE, '--dangerously-skip-permissions'], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: TEST_DIR,
            env: process.env as { [key: string]: string },
        });

        // Log PTY output for debugging and auto-respond to prompts
        let trustSent = false;
        ptyProcess.onData((data) => {
            console.log('PTY output:', data);

            // If Claude asks about trusting files, automatically answer yes
            if (!trustSent && data.includes('Do you trust the files in this folder?')) {
                console.log('Sending trust confirmation...');
                trustSent = true;
                setTimeout(() => {
                    ptyProcess?.write('\r'); // Press enter to select "Yes, proceed"
                }, 500);
            }
        });

        ptyProcess.onExit(({ exitCode, signal }) => {
            console.log('Claude exited with code:', exitCode, 'signal:', signal);
        });

        // Wait for Claude to start and create session file
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Find the newest JSONL file
        console.log('Looking for files in:', projectsDir);

        // Try multiple times as Claude might take time to create the file
        let jsonlFiles: string[] = [];
        for (let attempt = 0; attempt < 5; attempt++) {
            const files = await fs.readdir(projectsDir).catch((err) => {
                console.error(`Attempt ${attempt + 1} - Failed to read directory:`, err.code);
                return [];
            });
            console.log(`Attempt ${attempt + 1} - Files found:`, files);
            jsonlFiles = files.filter((f) => f.endsWith('.jsonl'));

            if (jsonlFiles.length > 0) break;

            // Wait before next attempt
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        expect(jsonlFiles.length).toBeGreaterThan(0);

        // Get files created after test start time
        const fileStats = await Promise.all(
            jsonlFiles.map(async (file) => {
                const stats = await fs.stat(join(projectsDir, file));
                return { file, birthtime: stats.birthtime };
            }),
        );

        // Filter files created after test start
        const newFiles = fileStats.filter((f) => f.birthtime >= testStartTime);
        console.log(
            'Files created after test start:',
            newFiles.map((f) => f.file),
        );

        expect(newFiles.length).toBeGreaterThan(0);

        // Sort by creation time (newest first)
        newFiles.sort((a, b) => b.birthtime.getTime() - a.birthtime.getTime());
        const newestFile = newFiles[0].file;
        const sessionId = newestFile.replace('.jsonl', '');

        console.log('Found session file:', newestFile);
        console.log('File creation time:', newFiles[0].birthtime);

        expect(sessionId).toMatch(/^[a-f0-9-]{36}$/); // UUID format

        // Wait for user message to appear in JSONL
        const jsonlPath = join(projectsDir, newestFile);
        let foundUserMessage = false;
        console.log('Reading JSONL file:', jsonlPath);

        for (let i = 0; i < 30; i++) {
            try {
                const content = await fs.readFile(jsonlPath, 'utf8');
                const lines = content.trim().split('\n').filter(Boolean);
                console.log(`Attempt ${i + 1} - Found ${lines.length} lines in JSONL`);

                for (const line of lines) {
                    try {
                        const entry = JSON.parse(line);
                        if (entry.type === 'user') {
                            console.log('Found user entry with content:', entry.message?.content);
                            if (entry.message?.content === TEST_MESSAGE) {
                                console.log('✓ Found matching user message!');
                                foundUserMessage = true;
                                break;
                            }
                        }
                    } catch (e) {
                        console.error('Failed to parse line:', e);
                    }
                }

                if (foundUserMessage) break;
            } catch (err) {
                console.error('Failed to read JSONL file:', err);
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        expect(foundUserMessage).toBe(true);
    }, 60000); // 60 second timeout for this test
});
