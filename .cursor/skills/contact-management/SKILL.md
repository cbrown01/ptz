---
name: contact-management
description: Manage contacts - add, update, or look up people the user works with. Use when the user mentions a person, asks about contacts, wants to add someone new, or needs relationship context for a task.
---

# Contact Management

Optional feature for tracking people the user works with.

## Overview

Some users may maintain a contacts file (e.g., `contacts.yaml`) as a handy reference for people mentioned in tasks. This is entirely optional.

## Important: Not a Source of Truth

A contacts list is a **handy reference**, not an authoritative directory. It:

- Can easily become out of date
- May diverge from real sources (HR systems, Slack, email)
- Should not be used for official lookups

Treat it as working notes about people relevant to current tasks.

## When to Use

- User mentions a person by name or handle
- User wants to track who they work with
- A task references someone and you need context
- User asks "who is [name]?" or similar

## Suggested Schema

If the user wants to track contacts, suggest this structure:

```yaml
contacts:
  - name: "Full Name"           # Required
    handle: "@slack_handle"     # Optional
    email: "email@example.com"  # Optional
    role: "Their Role"          # Optional
    team: "Team Name"           # Optional
    notes: "Context"            # Optional - relationship context
```

## Operations

### Add a Contact

Edit the contacts file directly:

```yaml
  - name: "New Person"
    handle: null
    email: null
    role: null
    team: null
    notes: "How you know them, what you work on together"
```

### Update a Contact

Edit the existing entry. Common updates:
- Adding handle/email when discovered
- Adding notes after working together
- Updating role or team

### Look Up a Contact

Read the contacts file to find information about a person.

## Cross-Referencing

When a task mentions a person:
1. Check if a contacts file exists
2. Look up the person for context
3. If unknown and user wants tracking, offer to add them

## Prompting for New Contacts

If a user mentions someone new:

```
I don't have [name] in contacts. Want me to add them?
If so, any details to include? (role, team, how you work together)
```

Keep it lightweight - missing fields are fine. Notes are most valuable.

## Setup

If the user wants contact tracking during init:

1. Create a `contacts.yaml` file
2. Add it to the system documentation
3. Mention it in AGENTS.md

This is an optional feature - not all users will want it.

## Personal Extensions

If `./PERSONAL.md` exists in this skill's directory, incorporate its contents as additional instructions specific to your contacts workflow.

**Do not modify this SKILL.md file directly.** Create a `PERSONAL.md` file for your customizations instead.
