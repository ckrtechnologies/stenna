# Stenna — Project Agent Guidelines (`AGENTS.md`)

## Mandatory User Approval Before Code Edits

1. **Explicit Sign-Off Gate**:
   - The agent MUST NEVER edit, modify, or create any codebase or configuration files without first presenting the proposed changes (with line-by-line diffs or clear before/after previews) to the user.
   - The agent MUST explicitly ask for approval and WAIT for the user to confirm (e.g. "approved", "proceed", "yes") before invoking any file editing or writing tools.

2. **No Silent Changes**:
   - Every file modification must be isolated, transparent, and explained before execution.
   - If multiple files are involved, list each file and its intended changes clearly in advance.

3. **Reversibility**:
   - Always state what can be tested after a change and how the user can revert if desired.

