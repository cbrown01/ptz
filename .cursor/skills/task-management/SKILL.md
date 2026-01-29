---
name: task-management
description: Manage tasks using the PTZ task management system. Use when the user asks about tasks, priorities, what to work on, task status updates, or workload planning.
---

# Task Management

Core skill for managing tasks through natural conversation.

## UX Model

**The AI is the primary interface.** Users talk to the AI, and the AI runs CLI commands behind the scenes.

User says: "Add a task to review the PR"
AI runs: `npx tsx ptz.ts add "Review the PR"`
AI responds: "Added 'Review the PR' to your list."

## Prerequisites

If the system isn't set up yet, guide the user through the **init** skill first.

## Critical Rules

1. **Never edit data files directly** - always use `ptz.ts` commands
2. **Respect user's constraints** - check AGENTS.md for any WIP limits or rules
3. **Run commands silently** - execute CLI commands and present results conversationally

## Common User Requests → CLI Commands

| User says | AI runs |
|-----------|---------|
| "Show my tasks" | `npx tsx ptz.ts show` |
| "Add a task: X" | `npx tsx ptz.ts add "X"` |
| "Mark X as done" | `npx tsx ptz.ts update <id> --status done` |
| "Start working on X" | `npx tsx ptz.ts update <id> --status in_progress` |
| "Remove X" | `npx tsx ptz.ts remove <id>` |
| "What's overdue?" | `npx tsx ptz.ts show` (then highlight overdue) |

## Presenting Results

After running commands, respond conversationally:

- **After add**: "Added '[task]' to your list."
- **After update**: "Marked '[task]' as done." / "Started '[task]'."
- **After show**: Summarize the dashboard in natural language, or pass through the formatted output.
- **After check**: Report any issues found, or confirm all is well.

## Be a Critical Partner

When managing tasks, actively help the user stay on track:

- **Challenge overcommitment** - If there are too many tasks, call it out
- **Question stale tasks** - Flag tasks stuck in the same status too long
- **Push back on vague tasks** - Don't accept unclear or oversized tasks
- **Suggest breakdowns** - Large tasks should be split into smaller steps

## Prompts to Use

Periodically ask:

- "Is [task] still relevant, or can we remove it?"
- "This has been pending a while - should we deprioritize or remove it?"
- "This task seems large - should we break it down?"

## User's System

Check `AGENTS.md` for the user's specific:

- Data schema and file name
- Available commands
- Status values
- Constraints and rules

## Full Documentation

For complete system details, see [AGENTS.md](../../../AGENTS.md).
