---
name: google-cloud-oauth
description: Set up Google Cloud OAuth credentials for Google APIs (Calendar, Drive, Gmail, etc.). Use when configuring Google API access, creating OAuth credentials, or troubleshooting Google authentication errors.
---

# Google Cloud OAuth Setup

Guide for creating OAuth 2.0 credentials to access Google APIs.

## Quick Setup Steps

1. Create Google Cloud project
2. Enable the required API
3. Configure OAuth consent screen
4. Create OAuth credentials
5. Download credentials.json

## Step 1: Create Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Click project dropdown → **New Project**
3. Name it (e.g., "My App")
4. Click **Create**

**Work account can't create project?** Use personal Gmail for the project, authorize with work account later.

## Step 2: Enable API

1. Select your project
2. Go to **APIs & Services** → **Library**
3. Search for the API (e.g., "Google Calendar API")
4. Click **Enable**

## Step 3: OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (or Internal for Workspace)
3. Fill required fields:
   - App name
   - User support email
   - Developer contact email
4. Click **Save and Continue** through remaining steps
5. On **Test users**, add emails that will authorize the app

## Step 4: Create Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Desktop app**
4. Name it (e.g., "Desktop Client")
5. Click **Create**
6. Click **Download JSON**
7. Save as `credentials.json` in your project

## Step 5: First Authorization

Run your app - it will open a browser for authorization. After consent, a `token.json` is cached for future use.

## Node.js Implementation

```typescript
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function authorize() {
  // Check for existing token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    const auth = new google.auth.OAuth2();
    auth.setCredentials(token);
    return auth;
  }

  // Authenticate and save token
  const auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  
  if (auth.credentials) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(auth.credentials));
  }
  
  return auth;
}
```

Required dependencies:
```bash
npm install googleapis @google-cloud/local-auth
```

## Common Errors

### "access_denied" (Error 403)

The authorizing email isn't a test user.

**Fix:** Go to OAuth consent screen → Test users → Add the email.

### "Organization required" when creating project

Work/school account has restrictions.

**Fix:** Use personal Gmail for the Cloud project. You can still authorize with your work account later.

### "Credentials not found"

The `credentials.json` file is missing or in wrong location.

**Fix:** Download from Cloud Console → Credentials → your OAuth client → Download JSON.

## Scopes Reference

| API | Read-Only Scope | Full Access Scope |
|-----|-----------------|-------------------|
| Calendar | `calendar.readonly` | `calendar` |
| Drive | `drive.readonly` | `drive` |
| Gmail | `gmail.readonly` | `gmail.modify` |
| Sheets | `spreadsheets.readonly` | `spreadsheets` |

## Files

| File | Purpose | Git? |
|------|---------|------|
| `credentials.json` | OAuth client config | No (sensitive) |
| `token.json` | Cached access token | No (user-specific) |

Add both to `.gitignore`.
