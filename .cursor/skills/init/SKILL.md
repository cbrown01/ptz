# PTZ Init Skill

Guide users through designing their personal task management system.

## When to Use

Activate this skill when the user:
- Says "help me set up my PTZ system"
- Asks about initializing or setting up their tasks
- Is new to the project and needs guidance
- Wants to redesign their organizational system

## Prerequisites

Before starting, verify:
1. `ptz.template.ts` exists in the project root
2. `package.json` exists with required dependencies
3. No existing `ptz.ts` file (or confirm user wants to replace it)

## Init Process

Guide the user through these decisions conversationally. Don't overwhelm them - ask one section at a time and provide sensible defaults.

### Step 1: Organization Style

Ask: "How do you want to organize your tasks?"

Options to present:
- **Flat list** - Simple list of tasks, no grouping (good for getting started)
- **Categories/Focus areas** - Group tasks into named buckets (e.g., "Work", "Personal", "Side Project")
- **Tags** - Label tasks with multiple tags for flexible filtering
- **Projects** - Hierarchical structure with projects containing tasks

Default suggestion: Categories/Focus areas - provides structure without complexity.

### Step 2: Task Properties

Ask: "What information do you want to track for each task?"

Core properties (always included):
- `id` - Auto-generated identifier
- `name` - Task description

Optional properties to offer:
- **Status** (strongly recommended) - Track progress (e.g., pending, in_progress, done)
- **Due date** - When the task should be completed
- **Priority** - Importance level (high/medium/low or numbered)
- **Notes** - Additional context or links
- **Tags** - Labels for filtering (if not using tags as primary organization)
- **Created date** - When the task was added
- **Completed date** - When the task was finished

Default suggestion: Status + Due date + Notes

### Step 3: Status Values

If they chose to include status, ask: "What statuses do you want?"

Common patterns:
- **Simple**: `todo`, `done`
- **Standard**: `pending`, `in_progress`, `done`
- **Extended**: `pending`, `in_progress`, `blocked`, `done`, `cancelled`

Default suggestion: Standard (pending, in_progress, done)

### Step 4: Constraints and Rules

Ask: "Do you want any rules to keep yourself on track?"

Options to offer:
- **WIP limit** - Maximum number of in-progress tasks (e.g., max 3)
- **Required fields** - Enforce certain properties (e.g., all tasks need due dates)
- **Status restrictions** - Only allow in_progress in certain categories
- **Stale task warnings** - Flag tasks stuck in same status too long

Default suggestion: WIP limit of 3 in-progress tasks

### Step 5: Commands

Ask: "What commands do you need? (You can add more later)"

Standard commands (usually included):
- `show` - Display dashboard
- `add` - Create new task
- `update` - Modify task properties
- `remove` - Delete a task
- `check` - Run integrity validation

Additional commands to offer:
- `list` - List tasks with filtering
- `done` - Quick mark-as-done shortcut
- `start` - Quick mark-as-in-progress shortcut
- `archive` - Move completed tasks to archive

### Step 6: Optional Features

Ask: "Would you like any of these optional features?"

- **Contacts tracking** - Keep notes about people you work with
- **Glossary** - Track acronyms, project names, and terminology
- **Calendar integration** - View Google Calendar events alongside tasks

These are entirely optional and can be added later. For each one they want:

**Contacts**: Create `contacts.yaml` with the schema from the contact-management skill.

**Glossary**: Create `glossary.yaml` with the schema from the glossary-management skill.

**Calendar**: Note that setup requires Google Cloud credentials. Point them to the google-calendar-reader skill for setup instructions.

## Generation Phase

After gathering requirements, generate:

### 1. Custom `ptz.ts`

Copy `ptz.template.ts` to `ptz.ts` and customize:
- Update the `Item` interface with chosen properties
- Update the `Data` interface for chosen organization style
- Fill in the `addItem`, `updateItem`, `listItems` functions
- Customize `show()` display for their structure
- Add constraint checks to `check()`
- Add/remove CLI commands as needed

### 2. Empty Data File

Create an empty data file matching their schema (e.g., `tasks.yaml`):

```yaml
# PTZ - Your personal task data
# Created: <date>
items: []
```

Or for category-based:

```yaml
# PTZ - Your personal task data
# Created: <date>
categories:
  - name: Inbox
    tasks: []
```

### 3. Updated AGENTS.md

Update `AGENTS.md` with:
- Their chosen schema description
- Their constraints and rules
- Reference to their data file
- Their CLI commands

## Best Practices to Mention

During the conversation, naturally weave in these suggestions:

1. **Keep tasks small** - If a task feels overwhelming, break it down
2. **Review regularly** - Use the `show` command daily to stay oriented
3. **Don't over-engineer** - Start simple, add complexity only when needed
4. **WIP limits help** - Limiting in-progress work reduces context switching
5. **Capture quickly** - Add tasks immediately, refine later

## Example Conversation Flow

```
User: Help me set up my PTZ system

AI: Let's design your personal task system! First, how do you want to organize tasks?
    - Flat list (simplest)
    - Categories (group related tasks)
    - Tags (flexible labeling)
    - Projects (hierarchical)

User: Categories sounds good

AI: Great choice! What categories would you like to start with? You can always add more later.

User: Work, Personal, and Learning

AI: Perfect. Now, what info do you want for each task?
    I'd suggest at minimum: name, status, and due date.
    You could also add: priority, notes, tags, created date.

User: Status, due date, and notes

AI: What statuses work for your workflow?
    - Simple: todo, done
    - Standard: pending, in_progress, done
    - Extended: pending, in_progress, blocked, done, cancelled

User: Standard is fine

AI: Last question - any rules to keep yourself on track?
    - WIP limit (max in-progress tasks)
    - Stale task warnings

User: Yeah, max 3 in progress

AI: Got it! Let me generate your system...
    [Creates ptz.ts, tasks.yaml, updates AGENTS.md]

    Done! Your system is ready. Just tell me what you want to do:
    - "Show me my tasks"
    - "Add a task: Review the PR"
    - "Mark [task] as done"

    I'll handle the commands for you.
```

## After Init

Remind the user:
1. Their data file is gitignored (personal and private)
2. They can modify `ptz.ts` anytime to add features
3. The `check` command validates their rules
4. Examples in `examples/` show alternative approaches

## UX Model

**The AI is the primary interface.** Users talk to the AI in natural language, and the AI runs the CLI commands behind the scenes.

Examples of user interactions:
- "Add a task to buy groceries"
- "What's on my list?"
- "Mark the PR review as done"
- "Show me what's overdue"

The AI translates these into CLI commands (`npx tsx ptz.ts add "Buy groceries"`, etc.) and presents the results conversationally.

Users *can* run commands directly if they prefer, but this is not the primary experience.

## Personal Extensions

If `./PERSONAL.md` exists in this skill's directory, incorporate its contents as additional instructions specific to your init workflow.

**Do not modify this SKILL.md file directly.** Create a `PERSONAL.md` file for your customizations instead.
