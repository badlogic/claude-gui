# Research: Determine how to extract session ID from Claude Code

**Status:** Completed
**Created:** 2025-07-12T00:27:14
**Agent PID:** 13406

## Original Todo
- Research: Determine how to extract session ID from Claude Code
    - Investigate Claude Code output patterns
    - Check .claude/projects/ directory structure
    - Find reliable method to identify current session

## Description
Research how to reliably extract the session ID when Claude Code starts. This evolved into creating a complete E2E test that demonstrates the full architecture needed for claude-gui.

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

## E2E Test as Architecture Blueprint

The test in `src/tests/session-detection.test.ts` serves as a complete E2E blueprint for claude-gui architecture:

### What the test demonstrates:

1. **PTY Process Management**
   - Spawns Claude in a PTY using node-pty
   - Provides proper terminal emulation for interactive mode

2. **Trust Prompt Handling**
   - Detects "Do you trust the files in this folder?" prompt
   - Automatically responds by sending Enter key

3. **Ready State Detection**
   - Monitors PTY output for prompt indicators
   - Detects when Claude is ready for input ("> " or "for shortcuts")

4. **Interactive Message Sending**
   - Sends messages programmatically to Claude's stdin
   - Uses proper Enter key sequence (\r) for submission

5. **Session File Discovery**
   - Converts CWD to Claude's project directory format
   - Monitors for new JSONL files
   - Filters by creation time to find current session

6. **JSONL Content Validation**
   - Reads and parses JSONL entries
   - Verifies user messages are recorded correctly

### Key Implementation Details:
- Use `\r` (carriage return) for Enter key in PTY
- Wait for Claude to be ready before sending messages
- Handle asynchronous file creation with retry logic
- Parse JSONL with proper error handling

This test effectively demonstrates all the components needed to build claude-gui's WebSocket wrapper.

Run with: `npm test src/tests/session-detection.test.ts`

✅ Test is passing!