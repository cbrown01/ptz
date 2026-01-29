# Focus Areas Example

A category-based task management system with weekly focus, traffic-light priorities, and WIP limits.

## Overview

This approach organizes tasks into **focus areas** (categories), which are ranked by position to determine priority level.

### Key Features

- **Weekly Focus** - One focus area designated as the primary area of effort each week
- **Traffic Light Priorities** - Color-coded priority levels based on position
- **WIP Limits** - Maximum in-progress tasks to prevent overcommitment
- **Stale Task Detection** - Warns about tasks stuck in the same status too long

## Priority System

| Position | Color  | Meaning                                   |
| -------- | ------ | ----------------------------------------- |
| #1       | Gold   | Weekly main focus (special case of green) |
| #2-3     | Green  | Go - active priorities                    |
| #4-5     | Yellow | Caution - important but secondary         |
| #6+      | Red    | Stop - defer until higher priorities clear|

## Data Schema

```yaml
weekly_focus:
  area: "Focus Area Name"
  week_of: 2026-01-26  # Monday of the focus week

focus_areas:
  - slug: focus-area-name
    name: "Focus Area Name"
    tasks:
      - slug: task-name-abc1234
        name: "Task name"
        notes: "Optional notes"
        due: 2026-01-28           # Optional
        status: pending           # pending | in_progress | done | blocked
        status_since: 2026-01-26

time_off:  # Optional
  - start: 2026-02-14
    end: 2026-02-16
    description: "Vacation"
```

## Integrity Rules

1. **Maximum 3 in-progress tasks** across all focus areas
2. **No in-progress tasks in red areas** (positions 6+)
3. Tasks automatically revert to pending if rules are violated

## Commands

| Command                              | Description                    |
| ------------------------------------ | ------------------------------ |
| `show`                               | Display priority dashboard     |
| `add-focus <name>`                   | Add new focus area             |
| `remove-focus <name>`                | Remove focus area              |
| `reorder-focus <name> -p <n>`        | Move focus area to position    |
| `add-task <focus> <task>`            | Add task to focus area         |
| `update-task <focus> <task> [opts]`  | Update task properties         |
| `remove-task <focus> <task>`         | Remove task                    |
| `set-weekly-focus <name>`            | Set weekly focus (moves to #1) |
| `check`                              | Run integrity check            |

## Files

- `priorities.yaml` - Example data (sanitized)
- `ptz.ts` - Full TypeScript implementation *(coming soon)*

## When to Use This Approach

This system works well if you:

- Have multiple areas of responsibility (work, personal, projects)
- Want visual priority indicators
- Need help limiting work-in-progress
- Prefer category-based organization over tags or flat lists
