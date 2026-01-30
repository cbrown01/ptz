#!/usr/bin/env npx tsx
/**
 * PTZ - Focus Areas Implementation
 *
 * A category-based task management system with weekly focus,
 * traffic-light priorities, and WIP limits.
 *
 * Usage: npx tsx ptz.ts <command> [options]
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

// =============================================================================
// CONFIGURATION
// =============================================================================

const DATA_FILE = path.join(import.meta.dirname, "priorities.yaml");
const MAX_IN_PROGRESS = 3;
const RED_ZONE_START = 6; // Position 6+ is red zone (no in-progress allowed)

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type Status = "pending" | "in_progress" | "done" | "blocked";

interface Task {
  slug: string;
  name: string;
  status: Status;
  status_since: string;
  due?: string;
  notes?: string;
}

interface FocusArea {
  slug: string;
  name: string;
  tasks: Task[];
}

interface WeeklyFocus {
  area: string;
  week_of: string;
}

interface TimeOff {
  start: string;
  end: string;
  description: string;
}

interface Data {
  weekly_focus?: WeeklyFocus;
  focus_areas: FocusArea[];
  time_off?: TimeOff[];
}

// =============================================================================
// PRIORITY COLORS
// =============================================================================

type PriorityColor = "gold" | "green" | "yellow" | "red";

function getPriorityColor(position: number, isWeeklyFocus: boolean): PriorityColor {
  if (isWeeklyFocus) return "gold";
  if (position <= 3) return "green";
  if (position <= 5) return "yellow";
  return "red";
}

function colorCode(color: PriorityColor): string {
  switch (color) {
    case "gold":
      return "\x1b[33m\x1b[1m"; // Bold yellow
    case "green":
      return "\x1b[32m";
    case "yellow":
      return "\x1b[33m";
    case "red":
      return "\x1b[31m";
  }
}

const RESET = "\x1b[0m";

// =============================================================================
// DATA OPERATIONS
// =============================================================================

function loadData(): Data {
  if (!fs.existsSync(DATA_FILE)) {
    return { focus_areas: [] };
  }
  const content = fs.readFileSync(DATA_FILE, "utf-8");
  // Use JSON_SCHEMA to prevent auto-parsing of dates
  return yaml.load(content, { schema: yaml.JSON_SCHEMA }) as Data;
}

function saveData(data: Data): void {
  const content = yaml.dump(data, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });
  fs.writeFileSync(DATA_FILE, content, "utf-8");
}

function generateSlug(name: string): string {
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

function getMonday(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function findFocusArea(data: Data, identifier: string): FocusArea | undefined {
  return data.focus_areas.find(
    (fa) =>
      fa.slug === identifier ||
      fa.name.toLowerCase() === identifier.toLowerCase()
  );
}

function findTask(area: FocusArea, identifier: string): Task | undefined {
  return area.tasks.find(
    (t) =>
      t.slug === identifier || t.name.toLowerCase() === identifier.toLowerCase()
  );
}

function getFocusAreaPosition(data: Data, areaName: string): number {
  const index = data.focus_areas.findIndex(
    (fa) => fa.name.toLowerCase() === areaName.toLowerCase()
  );
  return index === -1 ? -1 : index + 1;
}

// =============================================================================
// INTEGRITY CHECKS
// =============================================================================

interface Issue {
  level: "error" | "warn";
  message: string;
}

function checkIntegrity(data: Data): Issue[] {
  const issues: Issue[] = [];
  const todayStr = today();

  // Count in-progress tasks
  let inProgressCount = 0;
  const inProgressTasks: { area: string; task: string; position: number }[] = [];

  for (let i = 0; i < data.focus_areas.length; i++) {
    const area = data.focus_areas[i];
    const position = i + 1;

    for (const task of area.tasks) {
      if (task.status === "in_progress") {
        inProgressCount++;
        inProgressTasks.push({ area: area.name, task: task.name, position });
      }
    }
  }

  // Check WIP limit
  if (inProgressCount > MAX_IN_PROGRESS) {
    issues.push({
      level: "error",
      message: `WIP limit exceeded: ${inProgressCount} in-progress tasks (max ${MAX_IN_PROGRESS})`,
    });
  }

  // Check for in-progress in red zone
  for (const t of inProgressTasks) {
    if (t.position >= RED_ZONE_START) {
      issues.push({
        level: "error",
        message: `In-progress task in red zone: "${t.task}" in ${t.area} (position ${t.position})`,
      });
    }
  }

  // Check for overdue tasks
  for (const area of data.focus_areas) {
    for (const task of area.tasks) {
      if (task.due && task.due < todayStr && task.status !== "done") {
        issues.push({
          level: "warn",
          message: `Overdue: "${task.name}" in ${area.name} (due: ${task.due})`,
        });
      }
    }
  }

  // Check for stale tasks (same status for > 14 days)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const staleDate = fourteenDaysAgo.toISOString().split("T")[0];

  for (const area of data.focus_areas) {
    for (const task of area.tasks) {
      if (
        task.status !== "done" &&
        task.status_since &&
        task.status_since < staleDate
      ) {
        issues.push({
          level: "warn",
          message: `Stale: "${task.name}" in ${area.name} (${task.status} since ${task.status_since})`,
        });
      }
    }
  }

  return issues;
}

// =============================================================================
// COMMANDS
// =============================================================================

function show(): void {
  const data = loadData();
  const todayStr = today();
  const issues = checkIntegrity(data);

  console.log("\n=== PTZ Focus Areas ===\n");

  // Weekly focus
  if (data.weekly_focus) {
    console.log(`Weekly Focus: ${data.weekly_focus.area} (week of ${data.weekly_focus.week_of})\n`);
  }

  if (data.focus_areas.length === 0) {
    console.log("No focus areas yet. Add one with: npx tsx ptz.ts add-focus <name>");
    return;
  }

  // Show each focus area with traffic light
  for (let i = 0; i < data.focus_areas.length; i++) {
    const area = data.focus_areas[i];
    const position = i + 1;
    const isWeeklyFocus = data.weekly_focus?.area === area.name;
    const color = getPriorityColor(position, isWeeklyFocus);
    const colorStr = colorCode(color);

    const activeTasks = area.tasks.filter((t) => t.status !== "done");
    const inProgress = area.tasks.filter((t) => t.status === "in_progress");
    const pending = area.tasks.filter((t) => t.status === "pending");
    const blocked = area.tasks.filter((t) => t.status === "blocked");

    const focusMarker = isWeeklyFocus ? " ★" : "";
    console.log(
      `${colorStr}#${position} ${area.name}${focusMarker}${RESET} (${activeTasks.length} active)`
    );

    // Show in-progress first
    for (const task of inProgress) {
      const dueStr = task.due ? ` [due: ${task.due}]` : "";
      const overdue = task.due && task.due < todayStr ? " OVERDUE" : "";
      console.log(`  ▶ ${task.name}${dueStr}${overdue}`);
    }

    // Then blocked
    for (const task of blocked) {
      console.log(`  ⊘ ${task.name} (blocked)`);
    }

    // Then pending (limit to 3 for readability)
    const pendingToShow = pending.slice(0, 3);
    for (const task of pendingToShow) {
      const dueStr = task.due ? ` [due: ${task.due}]` : "";
      const overdue = task.due && task.due < todayStr ? " OVERDUE" : "";
      console.log(`  ○ ${task.name}${dueStr}${overdue}`);
    }
    if (pending.length > 3) {
      console.log(`  ... and ${pending.length - 3} more pending`);
    }

    console.log();
  }

  // Summary
  const totalInProgress = data.focus_areas.reduce(
    (sum, a) => sum + a.tasks.filter((t) => t.status === "in_progress").length,
    0
  );
  const totalPending = data.focus_areas.reduce(
    (sum, a) => sum + a.tasks.filter((t) => t.status === "pending").length,
    0
  );
  const totalDone = data.focus_areas.reduce(
    (sum, a) => sum + a.tasks.filter((t) => t.status === "done").length,
    0
  );

  console.log(
    `Summary: ${totalInProgress}/${MAX_IN_PROGRESS} in progress, ${totalPending} pending, ${totalDone} done`
  );

  // Show issues
  if (issues.length > 0) {
    console.log("\nIssues:");
    for (const issue of issues) {
      const prefix = issue.level === "error" ? "[ERROR]" : "[WARN]";
      console.log(`  ${prefix} ${issue.message}`);
    }
  }

  // Time off
  if (data.time_off && data.time_off.length > 0) {
    const upcoming = data.time_off.filter((t) => t.end >= todayStr);
    if (upcoming.length > 0) {
      console.log("\nUpcoming time off:");
      for (const t of upcoming) {
        console.log(`  ${t.start} to ${t.end}: ${t.description}`);
      }
    }
  }
}

function addFocus(name: string): void {
  const data = loadData();

  if (findFocusArea(data, name)) {
    console.error(`Focus area already exists: ${name}`);
    process.exit(1);
  }

  const newArea: FocusArea = {
    slug: generateSlug(name),
    name,
    tasks: [],
  };

  data.focus_areas.push(newArea);
  saveData(data);

  console.log(`Added focus area: ${name} (position ${data.focus_areas.length})`);
}

function removeFocus(identifier: string): void {
  const data = loadData();
  const index = data.focus_areas.findIndex(
    (fa) =>
      fa.slug === identifier ||
      fa.name.toLowerCase() === identifier.toLowerCase()
  );

  if (index === -1) {
    console.error(`Focus area not found: ${identifier}`);
    process.exit(1);
  }

  const removed = data.focus_areas.splice(index, 1)[0];

  // Clear weekly focus if it was the removed area
  if (data.weekly_focus?.area === removed.name) {
    delete data.weekly_focus;
  }

  saveData(data);
  console.log(`Removed focus area: ${removed.name}`);
}

function reorderFocus(identifier: string, newPosition: number): void {
  const data = loadData();
  const index = data.focus_areas.findIndex(
    (fa) =>
      fa.slug === identifier ||
      fa.name.toLowerCase() === identifier.toLowerCase()
  );

  if (index === -1) {
    console.error(`Focus area not found: ${identifier}`);
    process.exit(1);
  }

  if (newPosition < 1 || newPosition > data.focus_areas.length) {
    console.error(`Invalid position: ${newPosition} (must be 1-${data.focus_areas.length})`);
    process.exit(1);
  }

  const [area] = data.focus_areas.splice(index, 1);
  data.focus_areas.splice(newPosition - 1, 0, area);
  saveData(data);

  console.log(`Moved ${area.name} to position ${newPosition}`);
}

function setWeeklyFocus(identifier: string): void {
  const data = loadData();
  const area = findFocusArea(data, identifier);

  if (!area) {
    console.error(`Focus area not found: ${identifier}`);
    process.exit(1);
  }

  // Move to position 1
  const index = data.focus_areas.indexOf(area);
  if (index > 0) {
    data.focus_areas.splice(index, 1);
    data.focus_areas.unshift(area);
  }

  data.weekly_focus = {
    area: area.name,
    week_of: getMonday(),
  };

  saveData(data);
  console.log(`Set weekly focus: ${area.name}`);
}

function addTask(
  areaIdentifier: string,
  taskName: string,
  options: { due?: string; notes?: string; status?: Status }
): void {
  const data = loadData();
  const area = findFocusArea(data, areaIdentifier);

  if (!area) {
    console.error(`Focus area not found: ${areaIdentifier}`);
    process.exit(1);
  }

  const status = options.status ?? "pending";
  const position = getFocusAreaPosition(data, area.name);

  // Check if trying to add in_progress in red zone
  if (status === "in_progress" && position >= RED_ZONE_START) {
    console.error(
      `Cannot add in-progress task to red zone (position ${position}). Move the focus area up first.`
    );
    process.exit(1);
  }

  // Check WIP limit if adding as in_progress
  if (status === "in_progress") {
    const currentInProgress = data.focus_areas.reduce(
      (sum, a) => sum + a.tasks.filter((t) => t.status === "in_progress").length,
      0
    );
    if (currentInProgress >= MAX_IN_PROGRESS) {
      console.error(
        `WIP limit reached (${MAX_IN_PROGRESS}). Complete or pause a task first.`
      );
      process.exit(1);
    }
  }

  const newTask: Task = {
    slug: generateSlug(taskName),
    name: taskName,
    status,
    status_since: today(),
  };

  if (options.due) newTask.due = options.due;
  if (options.notes) newTask.notes = options.notes;

  area.tasks.push(newTask);
  saveData(data);

  console.log(`Added task "${taskName}" to ${area.name}`);
}

function updateTask(
  areaIdentifier: string,
  taskIdentifier: string,
  updates: { status?: Status; due?: string; notes?: string; name?: string }
): void {
  const data = loadData();
  const area = findFocusArea(data, areaIdentifier);

  if (!area) {
    console.error(`Focus area not found: ${areaIdentifier}`);
    process.exit(1);
  }

  const task = findTask(area, taskIdentifier);

  if (!task) {
    console.error(`Task not found: ${taskIdentifier}`);
    process.exit(1);
  }

  const position = getFocusAreaPosition(data, area.name);

  // Check constraints for status changes
  if (updates.status && updates.status !== task.status) {
    // Check red zone
    if (updates.status === "in_progress" && position >= RED_ZONE_START) {
      console.error(
        `Cannot set in-progress in red zone (position ${position}). Move the focus area up first.`
      );
      process.exit(1);
    }

    // Check WIP limit
    if (updates.status === "in_progress") {
      const currentInProgress = data.focus_areas.reduce(
        (sum, a) => sum + a.tasks.filter((t) => t.status === "in_progress").length,
        0
      );
      if (currentInProgress >= MAX_IN_PROGRESS) {
        console.error(
          `WIP limit reached (${MAX_IN_PROGRESS}). Complete or pause a task first.`
        );
        process.exit(1);
      }
    }

    task.status = updates.status;
    task.status_since = today();
  }

  if (updates.name) task.name = updates.name;
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

function removeTask(areaIdentifier: string, taskIdentifier: string): void {
  const data = loadData();
  const area = findFocusArea(data, areaIdentifier);

  if (!area) {
    console.error(`Focus area not found: ${areaIdentifier}`);
    process.exit(1);
  }

  const index = area.tasks.findIndex(
    (t) =>
      t.slug === taskIdentifier ||
      t.name.toLowerCase() === taskIdentifier.toLowerCase()
  );

  if (index === -1) {
    console.error(`Task not found: ${taskIdentifier}`);
    process.exit(1);
  }

  const removed = area.tasks.splice(index, 1)[0];
  saveData(data);
  console.log(`Removed: ${removed.name}`);
}

function check(): void {
  const data = loadData();
  const issues = checkIntegrity(data);

  console.log("\n=== Integrity Check ===\n");

  if (issues.length === 0) {
    console.log("All checks passed!");
    return;
  }

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warn");

  for (const issue of errors) {
    console.log(`[ERROR] ${issue.message}`);
  }
  for (const issue of warnings) {
    console.log(`[WARN] ${issue.message}`);
  }

  console.log(`\nFound ${errors.length} error(s), ${warnings.length} warning(s)`);

  if (errors.length > 0) {
    process.exit(1);
  }
}

// =============================================================================
// CLI PARSER
// =============================================================================

function printHelp(): void {
  console.log(`
PTZ - Focus Areas

Usage: npx tsx ptz.ts <command> [options]

Commands:
  show                                   Display priority dashboard
  add-focus <name>                       Add new focus area
  remove-focus <name>                    Remove focus area
  reorder-focus <name> -p <position>     Move focus area to position
  set-weekly-focus <name>                Set weekly focus (moves to #1)
  add-task <focus> <task> [options]      Add task to focus area
  update-task <focus> <task> [options]   Update task properties
  remove-task <focus> <task>             Remove task
  check                                  Run integrity check
  help                                   Show this help message

Options for add-task/update-task:
  --status <s>    pending | in_progress | done | blocked
  --due <date>    Due date (YYYY-MM-DD)
  --notes <text>  Notes or context

Examples:
  npx tsx ptz.ts add-focus "Side Projects"
  npx tsx ptz.ts set-weekly-focus "Project Alpha"
  npx tsx ptz.ts add-task "Project Alpha" "Review PR" --due 2026-02-01
  npx tsx ptz.ts update-task "Learning" "Complete course" --status done
  npx tsx ptz.ts reorder-focus "Learning" -p 2
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

    case "add-focus": {
      const name = args[1];
      if (!name) {
        console.error("Usage: ptz add-focus <name>");
        process.exit(1);
      }
      addFocus(name);
      break;
    }

    case "remove-focus": {
      const name = args[1];
      if (!name) {
        console.error("Usage: ptz remove-focus <name>");
        process.exit(1);
      }
      removeFocus(name);
      break;
    }

    case "reorder-focus": {
      const name = args[1];
      const position = parseInt(getArg(args, "-p") ?? "", 10);
      if (!name || isNaN(position)) {
        console.error("Usage: ptz reorder-focus <name> -p <position>");
        process.exit(1);
      }
      reorderFocus(name, position);
      break;
    }

    case "set-weekly-focus": {
      const name = args[1];
      if (!name) {
        console.error("Usage: ptz set-weekly-focus <name>");
        process.exit(1);
      }
      setWeeklyFocus(name);
      break;
    }

    case "add-task": {
      const areaName = args[1];
      const taskName = args[2];
      if (!areaName || !taskName) {
        console.error("Usage: ptz add-task <focus> <task> [--status S] [--due D] [--notes N]");
        process.exit(1);
      }
      addTask(areaName, taskName, {
        status: getArg(args, "--status") as Status | undefined,
        due: getArg(args, "--due"),
        notes: getArg(args, "--notes"),
      });
      break;
    }

    case "update-task": {
      const areaName = args[1];
      const taskName = args[2];
      if (!areaName || !taskName) {
        console.error("Usage: ptz update-task <focus> <task> [--status S] [--due D] [--notes N]");
        process.exit(1);
      }
      updateTask(areaName, taskName, {
        status: getArg(args, "--status") as Status | undefined,
        due: getArg(args, "--due"),
        notes: getArg(args, "--notes"),
        name: getArg(args, "--name"),
      });
      break;
    }

    case "remove-task": {
      const areaName = args[1];
      const taskName = args[2];
      if (!areaName || !taskName) {
        console.error("Usage: ptz remove-task <focus> <task>");
        process.exit(1);
      }
      removeTask(areaName, taskName);
      break;
    }

    case "check":
      check();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

// Run the CLI
parseArgs();
