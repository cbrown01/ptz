#!/usr/bin/env npx tsx
/**
 * PTZ - Personal Task Zen
 *
 * This is a template script with stubbed-out functions. Customize it to fit
 * your personal organizational system. The init skill will help you design
 * your schema and fill in these functions.
 *
 * Usage: npx tsx ptz.ts <command> [options]
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

// =============================================================================
// CONFIGURATION
// Customize these values for your system
// =============================================================================

/** Path to your data file */
const DATA_FILE = path.join(import.meta.dirname, "tasks.yaml");

// =============================================================================
// TYPE DEFINITIONS
// Define your data schema here. Examples:
//
// interface Item {
//   id: string;
//   name: string;
//   status: "pending" | "in_progress" | "done";
//   due?: string;        // YYYY-MM-DD
//   notes?: string;
//   tags?: string[];
//   category?: string;
// }
//
// interface Data {
//   items: Item[];
//   // Add any top-level fields your system needs
// }
// =============================================================================

interface Item {
  id: string;
  name: string;
  status: string;
  // TODO: Add your custom fields here
}

interface Data {
  items: Item[];
  // TODO: Add your top-level schema fields here
}

interface ItemOptions {
  status?: string;
  // TODO: Add your custom option fields here
}

interface FilterOptions {
  status?: string;
  // TODO: Add your custom filter fields here
}

// =============================================================================
// DATA OPERATIONS
// These functions handle reading and writing your data file
// =============================================================================

/**
 * Load data from the YAML file.
 * Creates an empty structure if the file doesn't exist.
 */
function loadData(): Data {
  if (!fs.existsSync(DATA_FILE)) {
    return { items: [] };
  }
  const content = fs.readFileSync(DATA_FILE, "utf-8");
  return yaml.load(content) as Data;
}

/**
 * Save data to the YAML file.
 */
function saveData(data: Data): void {
  const content = yaml.dump(data, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
  fs.writeFileSync(DATA_FILE, content, "utf-8");
}

/**
 * Generate a unique ID for a new item.
 * Customize this to match your preferred ID format.
 */
function generateId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 13);
  const hash = Math.random().toString(36).slice(2, 9);
  return `${slug}-${hash}`;
}

// =============================================================================
// CRUD OPERATIONS
// Implement these functions to manage your items
// =============================================================================

/**
 * Add a new item.
 *
 * TODO: Customize for your schema
 * - Add required fields
 * - Validate input
 * - Apply any constraints (e.g., WIP limits)
 */
function addItem(name: string, options: ItemOptions = {}): void {
  const data = loadData();

  const newItem: Item = {
    id: generateId(name),
    name,
    status: options.status ?? "pending",
    // TODO: Add your custom fields
  };

  data.items.push(newItem);
  saveData(data);

  console.log(`Added: ${newItem.name} (${newItem.id})`);
}

/**
 * Update an existing item.
 *
 * TODO: Customize for your schema
 * - Handle your specific update fields
 * - Validate state transitions
 * - Enforce constraints
 */
function updateItem(identifier: string, updates: Partial<Item>): void {
  const data = loadData();

  const item = data.items.find(
    (i) => i.id === identifier || i.name === identifier
  );

  if (!item) {
    console.error(`Item not found: ${identifier}`);
    process.exit(1);
  }

  Object.assign(item, updates);
  saveData(data);

  console.log(`Updated: ${item.name}`);
}

/**
 * Remove an item.
 */
function removeItem(identifier: string): void {
  const data = loadData();

  const index = data.items.findIndex(
    (i) => i.id === identifier || i.name === identifier
  );

  if (index === -1) {
    console.error(`Item not found: ${identifier}`);
    process.exit(1);
  }

  const removed = data.items.splice(index, 1)[0];
  saveData(data);

  console.log(`Removed: ${removed.name}`);
}

/**
 * List items, optionally filtered.
 *
 * TODO: Customize filtering logic for your schema
 */
function listItems(filter: FilterOptions = {}): Item[] {
  const data = loadData();

  let items = data.items;

  if (filter.status) {
    items = items.filter((i) => i.status === filter.status);
  }

  // TODO: Add your custom filters

  return items;
}

// =============================================================================
// DISPLAY COMMANDS
// =============================================================================

/**
 * Display your task dashboard.
 *
 * TODO: Customize the display format for your system
 * - Show summary statistics
 * - Group by category/tag/status
 * - Highlight important items (due soon, in progress, etc.)
 */
function show(): void {
  const data = loadData();

  console.log("\n=== PTZ Dashboard ===\n");

  if (data.items.length === 0) {
    console.log("No items yet. Add one with: npx tsx ptz.ts add <name>");
    return;
  }

  // Group by status
  const byStatus = new Map<string, Item[]>();
  for (const item of data.items) {
    const list = byStatus.get(item.status) ?? [];
    list.push(item);
    byStatus.set(item.status, list);
  }

  for (const [status, items] of byStatus) {
    console.log(`\n## ${status.toUpperCase()} (${items.length})`);
    for (const item of items) {
      console.log(`  - ${item.name}`);
    }
  }

  console.log(`\nTotal: ${data.items.length} items`);
}

/**
 * Run integrity checks on your data.
 *
 * TODO: Add your custom validation rules
 * - WIP limits
 * - Required fields
 * - Status transition rules
 * - Date validations
 */
function check(): void {
  const data = loadData();
  let issues = 0;

  console.log("\n=== Integrity Check ===\n");

  // Example: Check for items without names
  for (const item of data.items) {
    if (!item.name || item.name.trim() === "") {
      console.log(`[WARN] Item ${item.id} has no name`);
      issues++;
    }
  }

  // TODO: Add your custom checks here
  // Example: WIP limit check
  // const inProgress = data.items.filter(i => i.status === 'in_progress');
  // if (inProgress.length > 3) {
  //   console.log(`[WARN] Too many in-progress items: ${inProgress.length}`);
  //   issues++;
  // }

  if (issues === 0) {
    console.log("All checks passed!");
  } else {
    console.log(`\nFound ${issues} issue(s)`);
  }
}

// =============================================================================
// CLI PARSER
// Simple argument parsing - customize commands as needed
// =============================================================================

function printHelp(): void {
  console.log(`
PTZ - Personal Task Zen

Usage: npx tsx ptz.ts <command> [options]

Commands:
  show                    Display task dashboard
  add <name> [--status]   Add a new item
  update <id> [options]   Update an item
  remove <id>             Remove an item
  list [--status <s>]     List items (optionally filtered)
  check                   Run integrity checks
  help                    Show this help message

Examples:
  npx tsx ptz.ts add "Review PR"
  npx tsx ptz.ts update review-pr-abc1234 --status done
  npx tsx ptz.ts show
`);
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
        console.error("Usage: ptz add <name> [--status <status>]");
        process.exit(1);
      }
      const statusIdx = args.indexOf("--status");
      const status = statusIdx !== -1 ? args[statusIdx + 1] : undefined;
      addItem(name, { status });
      break;
    }

    case "update": {
      const id = args[1];
      if (!id) {
        console.error("Usage: ptz update <id> [--status <status>]");
        process.exit(1);
      }
      const updates: Partial<Item> = {};
      const statusIdx = args.indexOf("--status");
      if (statusIdx !== -1) {
        updates.status = args[statusIdx + 1];
      }
      updateItem(id, updates);
      break;
    }

    case "remove": {
      const id = args[1];
      if (!id) {
        console.error("Usage: ptz remove <id>");
        process.exit(1);
      }
      removeItem(id);
      break;
    }

    case "list": {
      const filter: FilterOptions = {};
      const statusIdx = args.indexOf("--status");
      if (statusIdx !== -1) {
        filter.status = args[statusIdx + 1];
      }
      const items = listItems(filter);
      for (const item of items) {
        console.log(`[${item.status}] ${item.name} (${item.id})`);
      }
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
