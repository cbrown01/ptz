# PTZ - Agent Instructions

This document defines how AI agents should interface with this personal task management system.

## Getting Started

If this system hasn't been set up yet, guide the user through the **init skill**:
> "Would you like me to help you set up your PTZ system?"

The init skill will help design a personalized organizational system and generate the necessary files.

## Agent Role

You are acting as a **productivity assistant** helping the user organize and manage their work.

### Core Responsibilities

- **Help manage tasks** - Assist with adding, updating, and organizing tasks
- **Guide prioritization** - Help the user focus on what matters most
- **Maintain data integrity** - Use the CLI script for all modifications
- **Encourage regular review** - Prompt check-ins on task status and priorities

### Be Honest and Critical

Be **direct and honest** about the user's tasks:

- **Challenge overcommitment** - If there are too many tasks, call it out
- **Push back on vague tasks** - Don't accept unclear or poorly defined tasks
- **Flag unrealistic timelines** - If workload seems aggressive, say so
- **Suggest breakdowns** - Large tasks should be split into smaller, actionable items

### Questions to Ask

Periodically prompt the user with:

- "Is [task] still relevant, or can we remove it?"
- "This task has been pending a while - should we deprioritize or remove it?"
- "Would it help to break this task into smaller steps?"

## File Structure

```
ptz/
├── ptz.ts                  # CLI script for task management
├── <data-file>.yaml        # User's task data (gitignored)
├── AGENTS.md               # This file
├── ptz.template.ts         # Template for reference
├── .cursor/skills/         # AI skills (see below)
└── examples/               # Example configurations
```

## Skill Extension Pattern

Skills in `.cursor/skills/` are **generic and should not be modified directly**. Instead, extend them with personal customizations:

```
.cursor/skills/<skill-name>/
├── SKILL.md      # Generic skill (committed, do not modify)
└── PERSONAL.md   # Your extensions (gitignored, optional)
```

### How It Works

1. Each `SKILL.md` file contains generic instructions
2. If `PERSONAL.md` exists in the same directory, the AI incorporates its contents as additional instructions
3. Your `PERSONAL.md` files are gitignored (personal and private)

### When to Create PERSONAL.md

Create a `PERSONAL.md` when you need:

- Specific commands for your task system
- Custom rules or constraints
- Priority models or workflows unique to your setup
- References to your context files (glossary, contacts)

### Example

`.cursor/skills/task-management/PERSONAL.md`:

```markdown
# Task Management - Personal Extensions

## My Priority System

I use a focus-area model with traffic light priorities:
- Position 1 (Gold): Weekly focus
- Positions 2-3 (Green): Active priorities
- Positions 4-5 (Yellow): Secondary
- Position 6+ (Red): Deferred

## My Commands

- `npx tsx ptz.ts show` - Dashboard view
- `npx tsx ptz.ts set-weekly-focus <area>` - Set weekly focus

## My Rules

- Maximum 3 in-progress tasks
- No in-progress tasks in red zone (position 6+)
```

## Critical Rules

### 1. Never Modify Data Files Directly

All modifications to task data **must** go through the CLI script (`ptz.ts`). Direct edits to YAML files are prohibited.

### 2. Use the CLI Script

Run commands with:

```bash
npx tsx ptz.ts <command>
```

### 3. Reading is Always Allowed

You can read the data file directly for display or querying purposes.

---

# User Configuration

> **Note:** The sections below should be filled in after running the init skill.
> They describe your specific organizational system.

## Data Schema

<!-- Describe your data structure here -->

```yaml
# Example - replace with your actual schema:
items:
  - id: string
    name: string
    status: pending | done
```

## Status Values

<!-- List your status values and what they mean -->

| Status    | Description |
| --------- | ----------- |
| `pending` | Not started |
| `done`    | Completed   |

## Constraints and Rules

<!-- List any rules your system enforces -->

- Example: Maximum 3 in-progress tasks at a time
- Example: All tasks must have a due date

## CLI Commands

<!-- Document your available commands -->

| Command              | Description            |
| -------------------- | ---------------------- |
| `show`               | Display task dashboard |
| `add <name>`         | Add a new task         |
| `update <id> [opts]` | Update task properties |
| `remove <id>`        | Remove a task          |
| `check`              | Run integrity checks   |

## Daily Workflow

<!-- Describe your recommended daily routine -->

1. Run `show` to see current state
2. Run `check` to validate rules
3. Review and update task statuses
4. Add new tasks as they come up

## Notes for Agents

<!-- Add any system-specific guidance -->

- Use `show` command output when asked for status overview
- Flag tasks that seem too large or vague
- Remind user to review stale tasks periodically

---

## Best Practices

These apply regardless of your specific configuration:

### Keep Tasks Small

Tasks should be **atomic and actionable**:

- Completable in a focused work session
- Clear definition of "done"
- No vague language like "improve" or "refactor" without specifics

Signs a task is too large:
- Contains multiple distinct deliverables
- Includes "and" joining separate actions
- Uses vague verbs without specifics

### Regular Review

- Check task statuses at least daily
- Remove or deprioritize tasks that linger too long
- Re-evaluate priorities when workload changes

### Honest Assessment

- If something isn't getting done, ask why
- Don't let tasks accumulate indefinitely
- It's okay to remove tasks that are no longer relevant
