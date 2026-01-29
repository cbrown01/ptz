---
name: google-calendar-reader
description: Read and display Google Calendar events. Use when the user asks about their calendar, schedule, meetings, upcoming events, or availability.
---

# Google Calendar Reader

Optional read-only integration with Google Calendar to display upcoming events.

## Overview

This is an optional feature that can be added to any PTZ setup. It helps users see their calendar alongside tasks for better scheduling.

## Quick Start

If the user's system has calendar integration:

```bash
npx tsx ptz.ts calendar           # Next 7 days
npx tsx ptz.ts calendar --days 1  # Today only
npx tsx ptz.ts calendar --days 14 # Next 2 weeks
```

## Setup (One-Time)

To add calendar integration, the user needs:

1. **Create Google Cloud project** (use personal Gmail if work account has restrictions)
   - Go to [console.cloud.google.com](https://console.cloud.google.com/)
   - Create new project

2. **Enable Calendar API**
   - APIs & Services → Library → Search "Google Calendar API" → Enable

3. **Configure OAuth consent screen**
   - APIs & Services → OAuth consent screen
   - Select "External", fill required fields
   - Add user's email as test user (important for work accounts)

4. **Create credentials**
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: Desktop app
   - Download JSON, save as `credentials.json` in project folder

5. **Authorize**
   - Run the calendar command
   - Browser opens for authorization
   - Token cached in `token.json`

## Implementation

To add calendar to a PTZ setup, implement:

```typescript
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';

async function getUpcomingEvents(days: number = 7) {
  // Authenticate and fetch events
  // See google-cloud-oauth skill for auth details
}
```

Required dependencies:
```bash
npm install googleapis @google-cloud/local-auth
```

## Files

| File | Purpose | Git? |
|------|---------|------|
| `credentials.json` | OAuth client config | No (sensitive) |
| `token.json` | Cached access token | No (user-specific) |

Both should be in `.gitignore`.

## Common Issues

**"access_denied" error**: Add the authorizing email as a test user in OAuth consent screen.

**Work account can't create project**: Use personal Gmail for the Cloud project, authorize with work account later.

## Scope

This integration is **read-only**. It uses the `calendar.readonly` scope and cannot create, modify, or delete calendar events.

## When to Suggest

During init, offer calendar integration if the user:
- Mentions wanting to see their schedule
- Has meeting-heavy days
- Wants to plan tasks around availability

This is optional - not all users will want it.
