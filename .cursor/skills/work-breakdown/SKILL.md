---
name: work-breakdown
description: Break down large projects into atomic tasks. Use when the user describes a project, feature, or initiative involving multiple steps; uses broad verbs like "build", "migrate", "implement", or "set up"; or explicitly asks to plan or break down work.
---

# Work Breakdown

A guided process for decomposing large scopes of work into atomic, actionable tasks.

## When to Use This Skill

Activate when:

- User describes a project, feature, or initiative (not a single task)
- Work involves multiple steps, components, or phases
- Scope is vague or uses broad verbs like "build", "migrate", "implement", "set up"
- User explicitly asks to plan or break down work

**Do not use** for simple, single-session tasks that are already atomic.

## Process Overview

```
Phase 1: Scope Discovery → Phase 2: Structure & Decomposition → Phase 3: Execution
```

---

## Phase 1: Scope Discovery

Ask these questions as a batch to understand the work:

1. **End goal**: What does "done" look like? What's the definition of success?
2. **Constraints**: Any timeline, hard deadlines, or dependencies?
3. **Stakeholders**: Who else is involved?
4. **Risks**: Any unknowns, blockers, or risks to flag upfront?

### Example Questions

```
Before we break this down, a few questions:

1. What does "done" look like for this work?
2. Are there any deadlines or dependencies I should know about?
3. Who else is involved or needs to be consulted?
4. Any unknowns or risks you're already aware of?
```

Wait for the user's answers before proceeding to Phase 2.

---

## Phase 2: Structure & Decomposition

After gathering scope information:

### Step 1: Identify Phases

Organize the work into 2-4 logical phases or milestones. Common patterns:

- Research/Design → Implementation → Validation
- Setup → Core Work → Polish/Cleanup
- Discovery → Build → Test → Deploy

### Step 2: Generate Atomic Tasks

For each phase, create tasks that pass the **Atomicity Checklist**:

| Criterion | Description |
|-----------|-------------|
| Single session | Can be completed in one focused work session |
| Clear outcome | Has a verifiable deliverable or end state |
| Specific verb | Uses concrete action verbs, not vague ones |
| No compounds | Does not contain "and" joining separate actions |

### Signs a Proposed Task is Too Large

- Contains multiple distinct deliverables
- Uses vague language like "improve," "refactor," or "update" without specifics
- Would take more than a few hours
- Cannot be started and finished in one sitting

### Step 3: Ask for Placement

If the user's system has categories, projects, or groupings, ask where the tasks should go:

```
Where should these tasks go? [category/project/list name]
```

Run `npx tsx ptz.ts show` if needed to remind the user of their current structure.

### Step 4: Present for Confirmation

Show the full breakdown organized by phase:

```
Here's the breakdown for [project name]:

**Phase: [Phase Name]**
- Task 1 description
- Task 2 description

**Phase: [Phase Name]**
- Task 3 description
- Task 4 description

I'll add these [N] tasks. Confirm?
```

Wait for explicit confirmation before proceeding to Phase 3.

---

## Phase 3: Execution

Once the user confirms:

### Add Tasks

Run the add commands silently for each task. Check `AGENTS.md` for exact syntax.

Guidelines:
- Add notes when context would help (dependencies, references)
- Add due dates only if the user specified deadlines
- Add tasks in logical order

### Confirm Completion

After adding all tasks, respond conversationally:

```
Done! I've added 11 tasks for the SSO implementation.

Here's your updated list:
[Run show command and summarize or display results]

Ready to start on the first one?
```

The user doesn't need to see or run commands - just present the outcome.

---

## Example Flow

**User**: "I need to add SSO to our app"

**Agent (Phase 1)**:

```
Before we break this down, a few questions:

1. What does "done" look like? (e.g., which identity providers, internal only or customer-facing?)
2. Any deadlines or dependencies?
3. Who else needs to be involved? (security review, etc.)
4. Any known risks or blockers?
```

**User**: "Okta SAML for internal employees. Need it by end of Q1. Security team needs to review. Main risk is I haven't done SAML before."

**Agent (Phase 2)**:

```
Here's the breakdown for SSO implementation:

**Phase: Research & Design**
- Review existing auth flow in AuthService
- Read Okta SAML integration documentation
- Spike: Set up Okta sandbox and test basic SAML flow
- Document SSO requirements for security review

**Phase: Implementation**
- Add SAML configuration environment variables
- Implement SAML assertion callback endpoint
- Update login page with "Sign in with Okta" button
- Add session handling for SAML-authenticated users

**Phase: Validation**
- Write integration tests for SAML login flow
- Schedule and complete security review
- Test with 2-3 pilot users before rollout

I'll add these 11 tasks. Confirm?
```

**Agent (Phase 3)**:

*[Runs add commands silently]*

```
Done! I've added 11 tasks for the SSO implementation.

The first phase is Research & Design - want to start with 
"Review existing auth flow in AuthService"?
```

---

## Quick Reference

### Atomicity Checklist

Before proposing any task, verify:

- [ ] Completable in one focused session
- [ ] Has a clear, verifiable outcome
- [ ] Uses specific action verbs
- [ ] Does not contain multiple deliverables
- [ ] No "and" joining separate actions

### Common Phase Patterns

| Project Type | Suggested Phases |
|--------------|------------------|
| New feature | Research → Implement → Test |
| Migration | Audit → Plan → Execute → Validate |
| Integration | Spike → Build → Test → Document |
| Refactor | Analyze → Extract → Update → Verify |

### Bad vs Good Task Examples

| Too Large | Better |
|-----------|--------|
| "Refactor auth system" | "Extract auth logic into AuthService class" |
| "Improve performance" | "Add database index to users.email column" |
| "Set up monitoring" | "Create CloudWatch dashboard for API latency" |
| "Build SSO" | "Implement SAML callback endpoint" |

---

## Integration with PTZ

This skill produces tasks that go into the user's PTZ system. Check `AGENTS.md` for:

- Available commands and syntax
- Any constraints (WIP limits, etc.)
- Status values and workflow

For full system documentation, see [AGENTS.md](../../../AGENTS.md).
