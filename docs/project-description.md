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

## Research Tasks
- Determine how to extract session ID from Claude Code
- Define WebSocket event protocol based on JSONL content