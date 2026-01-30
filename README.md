# ptz

A flexible productivity framework that helps you design and maintain your own task management system with AI assistance.

## What is PTZ?

PTZ is not a prescriptive task management tool. Instead, it's a framework that:

- **Guides you** through designing your own organizational system
- **Provides structure** with a customizable script template
- **Offers suggestions** based on productivity best practices
- **Stays out of your way** once you're set up

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Cursor](https://cursor.com/) editor with AI features

### Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Open the project in Cursor
4. Run the **init** skill by asking the AI:
   > "Help me set up my PTZ system"

The AI will guide you through:
- How you want to organize tasks (categories, projects, tags, or flat list)
- What properties each task should have (status, due dates, priority, notes)
- What statuses make sense for your workflow
- Any constraints or rules you want to enforce

## Project Structure

```
ptz/
├── ptz.template.ts       # Stub script - customize for your system
├── ptz.ts                # Your customized script (generated, gitignored)
├── *.yaml                # Your task data (gitignored)
├── package.json          # Dependencies
├── AGENTS.md             # AI agent instructions
├── .cursor/
│   ├── commands/         # Custom Cursor commands
│   │   └── ptz-show.md   # Quick dashboard command
│   └── skills/
│       ├── init/         # Guided setup wizard
│       ├── task-management/    # Core task operations
│       ├── work-breakdown/     # Decompose large projects
│       ├── contact-management/ # Optional: track people
│       ├── glossary-management/# Optional: track terminology
│       └── google-calendar-reader/ # Optional: calendar integration
└── examples/
    ├── focus-areas/      # Category-based with weekly focus
    └── simple-list/      # Minimal flat task list
```

## What Gets Committed

PTZ separates framework code (shared) from personal data (private):

| File | Committed? | Description |
|------|:----------:|-------------|
| `ptz.template.ts` | Yes | Template script for reference |
| `ptz.ts` | No | Your customized CLI script |
| `*.yaml` (root) | No | Your task/priority data |
| `AGENTS.md` | Yes | Agent instructions (Part 2 is template) |
| `.cursor/skills/*/SKILL.md` | Yes | Generic skill definitions |
| `.cursor/skills/*/PERSONAL.md` | No | Your skill extensions |
| `examples/` | Yes | Example configurations |

This means you can:
- Pull framework updates without losing your data
- Keep your tasks and customizations private
- Share improvements back to the framework

## Best Practices

These are suggestions, not requirements:

- **Use a structured file format** - YAML is recommended for readability
- **Keep tasks small and actionable** - If a task feels too big, break it down
- **Have at least one organizational dimension** - Categories, tags, or projects help prioritize
- **Track task status** - At minimum: pending and done
- **Consider WIP limits** - Limit in-progress tasks to avoid overcommitment
- **Include a dashboard command** - A quick `show` command helps daily review

## Examples

Check the `examples/` directory for different organizational approaches:

- **focus-areas/** - Category-based system with a weekly focus area, traffic-light priorities, and WIP limits
- **simple-list/** - Minimal flat task list with just status and due dates

## Extending Skills

PTZ includes several AI skills in `.cursor/skills/`. These skills are **generic and should not be modified directly**. Instead, extend them with a `PERSONAL.md` file:

```
.cursor/skills/task-management/
├── SKILL.md      # Generic (do not modify)
└── PERSONAL.md   # Your extensions (create this)
```

### Creating a PERSONAL.md

Add a `PERSONAL.md` file to any skill directory to customize it for your system:

```markdown
# Task Management - Personal Extensions

## My Commands

- `npx tsx ptz.ts show` - Dashboard with traffic light priorities
- `npx tsx ptz.ts set-weekly-focus <area>` - Set this week's focus

## My Rules

- Maximum 3 in-progress tasks at a time
- Only top 5 focus areas can have in-progress tasks
```

Your `PERSONAL.md` files are gitignored, keeping your customizations private while the generic skills stay shareable.

## Custom Commands

PTZ includes custom Cursor commands in `.cursor/commands/` for common workflows. These provide quick keyboard shortcuts to AI-assisted features.

### Available Commands

| Command | Description |
| ------- | ----------- |
| `ptz-show` | Display your current task status and priorities dashboard |

### Using Custom Commands

1. Open the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type the command name (e.g., "ptz-show")
3. The AI will execute the command and show results

### Creating Your Own Commands

This is a great pattern to adopt for frequently-used workflows. To add a custom command:

1. Create a new `.md` file in `.cursor/commands/`
2. Name it descriptively (e.g., `ptz-add-task.md`, `ptz-weekly-review.md`)
3. Add a title and description of what the command should do

Example command file:

```markdown
# Ptz Weekly Review

Run my weekly review process:
1. Show all tasks completed this week
2. Review overdue tasks and ask if they should be removed or rescheduled
3. Suggest priorities for next week based on due dates
```

**Good candidates for custom commands:**

- Dashboard views (`ptz-show`)
- Review workflows (`ptz-weekly-review`, `ptz-daily-standup`)
- Batch operations (`ptz-cleanup-done`, `ptz-archive-old`)
- Reports (`ptz-overdue`, `ptz-by-area`)

## Using PTZ

**The AI is your interface.** Just talk to it:

- "Show me my tasks"
- "Add a task: Review the quarterly report"
- "Mark the PR review as done"
- "What's overdue?"

The AI runs the CLI commands behind the scenes and responds conversationally.

You can also run commands directly if you prefer:

```bash
npx tsx ptz.ts show
npx tsx ptz.ts add "My task"
npx tsx ptz.ts update <id> --status done
```

## License

MIT
