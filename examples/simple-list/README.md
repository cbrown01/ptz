# Simple List Example

A minimal flat task list with just status and due dates.

## Overview

The simplest possible task management approach - a flat list of tasks with basic properties.

### Key Features

- **No categories or grouping** - Just a straightforward list
- **Basic statuses** - todo, in_progress, done
- **Optional due dates** - Track deadlines when needed
- **Quick and simple** - Minimal overhead

## Data Schema

```yaml
tasks:
  - id: task-abc1234
    name: "Task description"
    status: todo          # todo | in_progress | done
    due: 2026-02-01       # Optional
    notes: "Optional notes"
    created: 2026-01-26
```

## Commands

| Command                    | Description            |
| -------------------------- | ---------------------- |
| `show`                     | Display task list      |
| `add <name> [--due DATE]`  | Add a new task         |
| `done <id>`                | Mark task as done      |
| `start <id>`               | Mark task as in_progress |
| `update <id> [options]`    | Update task properties |
| `remove <id>`              | Remove a task          |
| `list [--status STATUS]`   | List tasks (filtered)  |

## Files

- `tasks.yaml` - Example data
- `ptz.ts` - Full TypeScript implementation
- `PERSONAL.md.example` - Example skill extension (copy to `.cursor/skills/task-management/PERSONAL.md`)

## When to Use This Approach

This system works well if you:

- Want minimal setup and overhead
- Have a small number of tasks
- Don't need complex categorization
- Prefer simplicity over features
