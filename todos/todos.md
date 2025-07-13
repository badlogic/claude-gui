- Add ClaudeSession class, spawns Claude in a pty and then uses the principles found in src/tests/session-detection.test.ts to communicate with the Claude process and receive every line in the corresponding jsonl file, and any new lines coming in as we write input the process. Need to come up with a nice API so that this is easy to use.


- Add minimal web ui as per docs/project-description.md