#!/usr/bin/env npx tsx
/**
 * PTZ - Simple List Implementation
 *
 * A minimal flat task list with basic status tracking.
 *
 * Usage: npx tsx ptz.ts <command> [options]
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

// =============================================================================
// CONFIGURATION
// =============================================================================

const DATA_FILE = path.join(import.meta.dirname, "tasks.yaml");

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type Status = "todo" | "in_progress" | "done";

interface Task {
  id: string;
  name: string;
  status: Status;
  due?: string;
  notes?: string;
  created: string;
}

interface Data {
  tasks: Task[];
}

// =============================================================================
// DATA OPERATIONS
// =============================================================================

function loadData(): Data {
  if (!fs.existsSync(DATA_FILE)) {
    return { tasks: [] };
  }
  const content = fs.readFileSync(DATA_FILE, "utf-8");
  return yaml.load(content) as Data;
}

function saveData(data: Data): void {
  const content = yaml.dump(data, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
  fs.writeFileSync(DATA_FILE, content, "utf-8");
}

function generateId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 13);
  const hash = Math.random().toString(36).slice(2, 9);
  return `${slug}-${hash}`;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function findTask(data: Data, identifier: string): Task | undefined {
  return data.tasks.find((t) => t.id === identifier || t.name === identifier);
}

// =============================================================================
// COMMANDS
// =============================================================================

function add(name: string, options: { due?: string; notes?: string }): void {
  const data = loadData();

  const task: Task = {
    id: generateId(name),
    name,
    status: "todo",
    created: today(),
  };

  if (options.due) task.due = options.due;
  if (options.notes) task.notes = options.notes;

  data.tasks.push(task);
  saveData(data);

  console.log(`Added: ${task.name} (${task.id})`);
}

function update(
  identifier: string,
  updates: { status?: Status; due?: string; notes?: string }
): void {
  const data = loadData();
  const task = findTask(data, identifier);

  if (!task) {
    console.error(`Task not found: ${identifier}`);
    process.exit(1);
  }

  if (updates.status) task.status = updates.status;
  if (updates.due !== undefined) {
    if (updates.due === "") {
      delete task.due;
    } else {
      task.due = updates.due;
    }
  }
  if (updates.notes !== undefined) {
    if (updates.notes === "") {
      delete task.notes;
    } else {
      task.notes = updates.notes;
    }
  }

  saveData(data);
  console.log(`Updated: ${task.name}`);
}

function done(identifier: string): void {
  update(identifier, { status: "done" });
}

function start(identifier: string): void {
  update(identifier, { status: "in_progress" });
}

function remove(identifier: string): void {
  const data = loadData();
  const index = data.tasks.findIndex(
    (t) => t.id === identifier || t.name === identifier
  );

  if (index === -1) {
    console.error(`Task not found: ${identifier}`);
    process.exit(1);
  }

  const removed = data.tasks.splice(index, 1)[0];
  saveData(data);
  console.log(`Removed: ${removed.name}`);
}

function list(filter?: { status?: Status }): void {
  const data = loadData();
  let tasks = data.tasks;

  if (filter?.status) {
    tasks = tasks.filter((t) => t.status === filter.status);
  }

  if (tasks.length === 0) {
    console.log("No tasks found.");
    return;
  }

  for (const task of tasks) {
    const dueStr = task.due ? ` (due: ${task.due})` : "";
    console.log(`[${task.status}] ${task.name}${dueStr}`);
    console.log(`         id: ${task.id}`);
    if (task.notes) {
      console.log(`         notes: ${task.notes}`);
    }
  }
}

function show(): void {
  const data = loadData();

  console.log("\n=== PTZ Simple List ===\n");

  if (data.tasks.length === 0) {
    console.log("No tasks yet. Add one with: npx tsx ptz.ts add <name>");
    return;
  }

  // Group by status
  const inProgress = data.tasks.filter((t) => t.status === "in_progress");
  const todo = data.tasks.filter((t) => t.status === "todo");
  const done = data.tasks.filter((t) => t.status === "done");

  // Check for overdue
  const todayStr = today();
  const overdue = data.tasks.filter(
    (t) => t.due && t.due < todayStr && t.status !== "done"
  );

  if (overdue.length > 0) {
    console.log("OVERDUE:");
    for (const task of overdue) {
      console.log(`  - ${task.name} (due: ${task.due})`);
    }
    console.log();
  }

  if (inProgress.length > 0) {
    console.log(`IN PROGRESS (${inProgress.length}):`);
    for (const task of inProgress) {
      const dueStr = task.due ? ` [due: ${task.due}]` : "";
      console.log(`  - ${task.name}${dueStr}`);
    }
    console.log();
  }

  if (todo.length > 0) {
    console.log(`TODO (${todo.length}):`);
    for (const task of todo) {
      const dueStr = task.due ? ` [due: ${task.due}]` : "";
      console.log(`  - ${task.name}${dueStr}`);
    }
    console.log();
  }

  console.log(
    `Summary: ${inProgress.length} in progress, ${todo.length} todo, ${done.length} done`
  );
}

// =============================================================================
// CLI PARSER
// =============================================================================

function printHelp(): void {
  console.log(`
PTZ - Simple List

Usage: npx tsx ptz.ts <command> [options]

Commands:
  show                      Display task dashboard
  add <name> [--due DATE]   Add a new task
  done <id>                 Mark task as done
  start <id>                Mark task as in_progress
  update <id> [options]     Update task properties
  remove <id>               Remove a task
  list [--status STATUS]    List tasks (optionally filtered)
  help                      Show this help message

Examples:
  npx tsx ptz.ts add "Review PR" --due 2026-02-01
  npx tsx ptz.ts start review-pr-a1b2c3d
  npx tsx ptz.ts done review-pr-a1b2c3d
  npx tsx ptz.ts show
`);
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

function parseArgs(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "help" || command === "--help") {
    printHelp();
    return;
  }

  switch (command) {
    case "show":
      show();
      break;

    case "add": {
      const name = args[1];
      if (!name) {
        console.error("Usage: ptz add <name> [--due DATE] [--notes TEXT]");
        process.exit(1);
      }
      add(name, {
        due: getArg(args, "--due"),
        notes: getArg(args, "--notes"),
      });
      break;
    }

    case "done": {
      const id = args[1];
      if (!id) {
        console.error("Usage: ptz done <id>");
        process.exit(1);
      }
      done(id);
      break;
    }

    case "start": {
      const id = args[1];
      if (!id) {
        console.error("Usage: ptz start <id>");
        process.exit(1);
      }
      start(id);
      break;
    }

    case "update": {
      const id = args[1];
      if (!id) {
        console.error("Usage: ptz update <id> [--status S] [--due D] [--notes N]");
        process.exit(1);
      }
      update(id, {
        status: getArg(args, "--status") as Status | undefined,
        due: getArg(args, "--due"),
        notes: getArg(args, "--notes"),
      });
      break;
    }

    case "remove": {
      const id = args[1];
      if (!id) {
        console.error("Usage: ptz remove <id>");
        process.exit(1);
      }
      remove(id);
      break;
    }

    case "list": {
      const status = getArg(args, "--status") as Status | undefined;
      list(status ? { status } : undefined);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

// Run the CLI
parseArgs();
