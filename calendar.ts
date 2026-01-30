/**
 * Google Calendar Integration Helper (TypeScript)
 *
 * This module provides read-only access to Google Calendar to help inform
 * task scheduling by showing upcoming events.
 *
 * SETUP INSTRUCTIONS:
 * -------------------
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project (or select existing one)
 * 3. Go to "APIs & Services" > "Library"
 * 4. Search for "Google Calendar API" and enable it
 * 5. Go to "APIs & Services" > "Credentials"
 * 6. Click "Create Credentials" > "OAuth client ID"
 * 7. If prompted, configure the OAuth consent screen first:
 *    - User Type: External (or Internal if using Workspace)
 *    - App name: "Priority Calendar" (or any name)
 *    - Scopes: Add ".../auth/calendar.readonly"
 * 8. For OAuth client ID:
 *    - Application type: "Desktop app"
 *    - Name: "Priority Calendar Desktop"
 * 9. Download the JSON file and save it as "credentials.json" in this folder
 * 10. First run will open a browser for authorization
 *
 * Files created by this module:
 * - token.json: Cached OAuth token (auto-created after first auth)
 */

import * as fs from "fs";
import * as path from "path";
import { authenticate } from "@google-cloud/local-auth";
import { google, calendar_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// Paths
const CREDENTIALS_FILE = path.join(import.meta.dirname, "credentials.json");
const TOKEN_FILE = path.join(import.meta.dirname, "token.json");

// Read-only scope
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

// =============================================================================
// TYPES
// =============================================================================

export interface CalendarEvent {
  summary: string;
  start: string;
  end: string;
  location?: string;
  allDay: boolean;
}

// =============================================================================
// CONFIGURATION CHECK
// =============================================================================

export function isCalendarConfigured(): boolean {
  return fs.existsSync(CREDENTIALS_FILE);
}

// =============================================================================
// AUTHENTICATION
// =============================================================================

async function loadSavedToken(): Promise<OAuth2Client | null> {
  if (!fs.existsSync(TOKEN_FILE)) {
    return null;
  }

  try {
    const content = fs.readFileSync(TOKEN_FILE, "utf-8");
    const credentials = JSON.parse(content);
    const auth = new google.auth.OAuth2();
    auth.setCredentials(credentials);
    return auth;
  } catch {
    return null;
  }
}

async function saveToken(client: OAuth2Client): Promise<void> {
  const credentials = client.credentials;
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(credentials), "utf-8");
}

async function getCalendarService(): Promise<calendar_v3.Calendar> {
  if (!isCalendarConfigured()) {
    throw new Error(
      `credentials.json not found at ${CREDENTIALS_FILE}\n` +
        "See setup instructions in this file."
    );
  }

  // Try to load existing token
  let auth = await loadSavedToken();

  // Check if token is valid
  if (auth) {
    try {
      // Test the credentials
      const calendar = google.calendar({ version: "v3", auth });
      await calendar.calendarList.list({ maxResults: 1 });
      return calendar;
    } catch {
      // Token expired or invalid, need to re-authenticate
      auth = null;
    }
  }

  // Authenticate
  auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_FILE,
  });

  // Save for next time
  await saveToken(auth);

  return google.calendar({ version: "v3", auth });
}

// =============================================================================
// CALENDAR OPERATIONS
// =============================================================================

export async function getUpcomingEvents(
  days: number = 7,
  maxResults: number = 20
): Promise<CalendarEvent[]> {
  const calendar = await getCalendarService();

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    maxResults,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = response.data.items || [];
  const result: CalendarEvent[] = [];

  for (const event of events) {
    const start = event.start?.dateTime || event.start?.date || "";
    const end = event.end?.dateTime || event.end?.date || "";
    const allDay = !event.start?.dateTime;

    result.push({
      summary: event.summary || "(No title)",
      start,
      end,
      location: event.location || undefined,
      allDay,
    });
  }

  return result;
}

export async function getEventsForDate(targetDate: Date): Promise<CalendarEvent[]> {
  const calendar = await getCalendarService();

  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: dayStart.toISOString(),
    timeMax: dayEnd.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = response.data.items || [];
  const result: CalendarEvent[] = [];

  for (const event of events) {
    const start = event.start?.dateTime || event.start?.date || "";
    const end = event.end?.dateTime || event.end?.date || "";
    const allDay = !event.start?.dateTime;

    result.push({
      summary: event.summary || "(No title)",
      start,
      end,
      location: event.location || undefined,
      allDay,
    });
  }

  return result;
}

// =============================================================================
// FORMATTING
// =============================================================================

function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) {
    return "All day";
  }

  try {
    const start = new Date(event.start);
    return start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return event.start;
  }
}

export function formatEventForDisplay(event: CalendarEvent, showDate: boolean = true): string {
  const timeStr = formatEventTime(event);
  const summary = event.summary;

  if (event.allDay) {
    if (showDate) {
      try {
        const date = new Date(event.start + "T00:00:00");
        const dateDisplay = date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        return `${dateDisplay}: ${summary} (all day)`;
      } catch {
        return `${event.start}: ${summary} (all day)`;
      }
    }
    return `${summary} (all day)`;
  }

  // Timed event
  try {
    const start = new Date(event.start);
    if (showDate) {
      const dateDisplay = start.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      return `${dateDisplay} ${timeStr}: ${summary}`;
    }
    return `${timeStr}: ${summary}`;
  } catch {
    return `${timeStr}: ${summary}`;
  }
}

// =============================================================================
// SETUP INSTRUCTIONS
// =============================================================================

function printSetupInstructions(): void {
  console.log(`
Google Calendar Integration Helper

SETUP INSTRUCTIONS:
-------------------
1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing one)
3. Go to "APIs & Services" > "Library"
4. Search for "Google Calendar API" and enable it
5. Go to "APIs & Services" > "Credentials"
6. Click "Create Credentials" > "OAuth client ID"
7. If prompted, configure the OAuth consent screen first
8. Application type: "Desktop app"
9. Download the JSON file and save as "credentials.json" here
10. First run will open a browser for authorization

Status:
`);

  if (isCalendarConfigured()) {
    console.log("  credentials.json: Found");
    if (fs.existsSync(TOKEN_FILE)) {
      console.log("  token.json: Found (authenticated)");
    } else {
      console.log("  token.json: Not found (run a calendar command to authenticate)");
    }
  } else {
    console.log("  credentials.json: NOT FOUND");
    console.log(`  Expected location: ${CREDENTIALS_FILE}`);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  printSetupInstructions();
}
