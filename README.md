# PTZ - Personal Task Zen

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
├── package.json          # Dependencies
├── AGENTS.md             # AI agent instructions (customize after init)
├── .cursor/
│   └── skills/
│       └── init/         # Init skill for guided setup
└── examples/
    ├── focus-areas/      # Example: Category-based with weekly focus
    └── simple-list/      # Example: Minimal flat task list
```

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
