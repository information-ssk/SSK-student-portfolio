# Backend Specification

This backend is built as a Google Apps Script web app that stores records in Google Sheets and attachments in Google Drive.

## Core endpoints

- `action=login` (POST)
  - Accepts `{ email, password, dept }`
  - Returns `{ success: true, token, email, dept, isAdmin }`
  - Supports Admin login with `dept=Admin` and password `adminssk`
  - Supports staff login with `@ssk.ac.th` email and password `sskssk`

- `action=validateToken` (GET)
  - Accepts `token` as a query parameter
  - Returns `{ success: true, valid: true/false }`

- `action=upload` (POST)
  - Accepts `{ record, attachments }`
  - Validates the token
  - Saves the record to the configured sheet
  - Saves attached files to the configured Drive folder
  - Returns uploaded file URLs

- `action=list` (GET)
  - Returns all saved records
  - Each record includes `competitions` and `fileUrls`

## Storage strategy

- Tokens are stored in `PropertiesService.getScriptProperties()` with 24-hour expiry.
- Achievement records are stored in a sheet named `ผลงาน`.
- Attachments are decoded from Base64 and saved to a Drive folder with public link access.

## Deployment notes

- Use `apps-scripts/.clasp.json` to push `apps-scripts/src/Code.gs`.
- Replace `YOUR_SHEET_ID_HERE` and `YOUR_FOLDER_ID_HERE` with real values before deploying.
