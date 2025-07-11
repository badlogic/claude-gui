# Research: Determine how to extract session ID from Claude Code

**Status:** Refining
**Created:** 2025-07-12T00:27:14
**Agent PID:** 13406

## Original Todo
- Research: Determine how to extract session ID from Claude Code
    - Investigate Claude Code output patterns
    - Check .claude/projects/ directory structure
    - Find reliable method to identify current session

## Description
Research how to reliably extract the session ID when Claude Code starts.

## Research Findings

### Session Storage
- Claude stores session data in `~/.claude/projects/{cwd-with-dashes}/`
- CWD path is converted: `/Users/badlogic/workspaces/claude-gui` → `-Users-badlogic-workspaces-claude-gui`
- Each session creates a JSONL file named `{session-id}.jsonl`

### Reliable Method to Get Session ID
1. When claude-gui starts, we know the CWD
2. Convert CWD to the .claude/projects format (replace `/` with `-`)
3. List all `.jsonl` files in that directory
4. Pick the file with the newest creation time (using file stats birthtime)
5. Extract session ID from the filename

### Why This Works
- Claude creates the JSONL file when the session starts
- Using creation time (birthtime) ensures we get the session that just started
- The filename itself contains the session ID
- It's highly unlikely multiple Claude sessions would start in the same CWD simultaneously

### Edge Cases
- Multiple sessions in same directory: Pick newest
- No sessions yet: Wait and retry
- Old sessions from previous runs: That's why we pick most recent

## Implementation Plan
- [x] Document the reliable approach for extracting session ID
- [x] Note that we'll need file watching to detect new sessions
- [x] Create test script to verify session detection (src/tests/session-detection.test.ts)
- [x] User test: Verify this approach works with real Claude sessions

## Notes
Added test script at src/tests/session-detection.test.ts to verify the approach works correctly.

## Test
The test spawns a Claude process with a test message and verifies:
1. A new JSONL file is created in the expected directory
2. The session ID matches UUID format
3. The user message appears in the JSONL file

The test uses node-pty to provide a PTY for Claude and --dangerously-skip-permissions to bypass trust prompts.

Run with: `npm test src/tests/session-detection.test.ts`

✅ Test is passing!