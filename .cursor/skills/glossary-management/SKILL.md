---
name: glossary-management
description: Manage terms - add, update, or look up acronyms, projects, tools, and concepts. Use when the user mentions an unfamiliar term, asks about terminology, wants to define something, or needs context for jargon in tasks.
---

# Glossary Management

Optional feature for tracking terminology, acronyms, and project names.

## Overview

Some users may maintain a glossary file (e.g., `glossary.yaml`) as a reference for terms, acronyms, and concepts relevant to their work. This is entirely optional.

## Important: Not a Source of Truth

A glossary is a **handy reference**, not an authoritative dictionary. It:

- Can easily become out of date
- May diverge from official documentation
- Should not be used for definitive specifications

Treat it as working notes about terminology relevant to current work.

## When to Use

- Encounter an unfamiliar acronym or term in a task
- User mentions a project or tool you don't recognize
- User wants to track terminology
- User asks "what is [term]?" or similar

## Suggested Schema

If the user wants to track terms, suggest this structure:

```yaml
terms:
  - term: "Term Name"           # Required
    definition: "What it means" # Required
    category: acronym           # acronym | project | team | tool | concept
    related: ["other-term"]     # Optional - related terms
```

### Categories

| Category | Use For |
|----------|---------|
| `acronym` | Abbreviations |
| `project` | Codebases, systems, services |
| `team` | Groups, communities, organizations |
| `tool` | Software, platforms, libraries |
| `concept` | Ideas, methodologies, patterns |

## Operations

### Add a Term

Edit the glossary file directly:

```yaml
  - term: "NewTerm"
    definition: "What it means and when it's used"
    category: tool
```

Add `related` only if there are clear connections to other terms.

### Update a Term

Edit the existing entry. Common updates:
- Filling in definitions when learned
- Adding related terms
- Correcting or clarifying definitions

### Look Up a Term

Read the glossary file to find definitions.

## Cross-Referencing

When a task uses unfamiliar terminology:
1. Check if a glossary file exists
2. Look up the term for context
3. If undefined and user wants tracking, offer to add it

## Prompting for Unknown Terms

If you encounter an unknown term:

```
I don't recognize "[term]" - what does it mean?
Want me to add it to the glossary?
```

Keep definitions concise - one or two sentences max.

## Setup

If the user wants a glossary during init:

1. Create a `glossary.yaml` file
2. Add it to the system documentation
3. Mention it in AGENTS.md

This is an optional feature - not all users will want it.
