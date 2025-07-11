# Create a minimal typescript nodejs project "claude-gui"

**Status:** Refining
**Created:** 2025-07-12T00:01:02
**Agent PID:** 13406

## Original Todo
- Create a minimal typescript nodejs project "claude-gui"
    - Biome for linting/formatting
    - tsc --noEmit for type checking
    - Husky for precommit hook invoking both biome and tsc --noEmit
    - esbuild for bundling (dist/index.js)
    - command claude-gui
    - vitest for testing
    - minimal package.json, minimal number of scripts:
        - clean (delete dist, crossplatform plz Windows)
        - build (esbuild bundling)
        - check (lint + format + typecheck)
        - test (vitest run)

## Description
Create a complete TypeScript Node.js CLI project structure for "claude-gui" with modern tooling including Biome for linting/formatting, TypeScript for type checking, esbuild for bundling, vitest for testing, and Husky for pre-commit hooks. The bundled output should be an executable CLI tool with proper shebang and permissions.

## Implementation Plan
- [ ] Create package.json with all dependencies and scripts (package.json)
- [ ] Create TypeScript configuration (tsconfig.json)
- [ ] Create Biome configuration for linting/formatting (biome.json)
- [ ] Create Vitest configuration for testing (vitest.config.ts)
- [ ] Create .gitignore file (.gitignore)
- [ ] Create source directory structure (src/)
- [ ] Create CLI entry point with shebang (src/index.ts:1-5)
- [ ] Create web directory structure (web/)
- [ ] Initialize git hooks with Husky (.husky/)
- [ ] Configure pre-commit hook (.husky/pre-commit)
- [ ] Configure esbuild to add shebang to output (package.json build script)
- [ ] Add post-build chmod +x for executable permissions (package.json postbuild script)
- [ ] Create cross-platform clean script (package.json scripts)
- [ ] Automated test: Run npm install
- [ ] Automated test: Run npm run check
- [ ] Automated test: Run npm run build
- [ ] Automated test: Verify dist/claude-gui.js exists and is executable
- [ ] User test: Run npm install and verify dependencies
- [ ] User test: Run npm run check and verify Biome works
- [ ] User test: Run npm run build and verify bundle created
- [ ] User test: Run ./dist/claude-gui.js and verify it executes