# Project: claude-gui

A TypeScript Node.js CLI tool that wraps Claude Code and exposes a WebSocket interface, enabling custom user interfaces to interact with Claude Code sessions.

## Features
- Spawns Claude Code process with passed arguments
- Watches session JSONL files for real-time updates
- WebSocket server for bidirectional communication
- Built-in minimal web UI with chat interface
- Multiple concurrent client connections
- Auto-opens browser on startup

## Architecture
- CLI tool that spawns `claude` subprocess
- Monitors `.claude/projects/${cwd}/${sessionId}.jsonl` for outputs
- WebSocket server streams JSONL events to connected clients
- Receives keyboard inputs via WebSocket and pipes to Claude stdin
- Serves static web UI built with Lit Elements and Tailwind CSS

## Commands
- **Clean**: `npm run clean` - Remove dist folder
- **Build**: `npm run build` - Bundle with esbuild
- **Check**: `npm run check` - Run lint + format + typecheck
- **Test**: `npm run test` - Run e2e tests with vitest

## Structure
```
src/
  index.ts       # CLI entry point
  server.ts      # HTTP + WebSocket server
  watcher.ts     # JSONL file watcher
  claude.ts      # Claude process management
  tests/         # Integration and general tests
web/
  index.html     # Web UI entry
  app.ts         # Lit application
  components/    # Lit components
dist/
  claude-gui.js  # Bundled CLI
  web/           # Bundled web assets
```

## Usage
```bash
claude-gui [--no-gui] [--port PORT] -- [claude-args]
```

## Testing

Tests are written using Vitest. Test file placement:
- **Module-specific tests**: Place next to the module being tested (e.g., `src/index.test.ts` for `src/index.ts`)
- **Integration/general tests**: Place in `src/tests/` directory

Example:
```bash
npm test                    # Run all tests
npm test src/index.test.ts  # Run specific test
```

## Research

- **Session ID Extraction & E2E Architecture Blueprint** ([docs/todos/done/2025-07-12-00-27-14-research-session-id-extraction.md](../todos/done/2025-07-12-00-27-14-research-session-id-extraction.md)): Comprehensive research that evolved into a complete E2E test demonstrating:
  - PTY-based Claude process management with node-pty
  - Trust prompt detection and automatic response (without --dangerously-skip-permissions)
  - Ready state detection for interactive input
  - Programmatic message sending with proper key sequences (\r for Enter)
  - Session file discovery and JSONL parsing
  - Verification of both user messages and assistant responses
  - Full blueprint for claude-gui's WebSocket wrapper architecture
  
  The test at `src/tests/session-detection.test.ts` serves as a working example of all core components needed.
