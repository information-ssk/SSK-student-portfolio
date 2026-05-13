# Deployment Guide

This repository delivers a Vercel-hosted frontend and a Google Apps Script backend.

## 1. Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- Repository connected to Vercel

### Vercel Environment Variables
Set the following values in the Vercel dashboard:
- `VITE_APPSCRIPT_URL` = your Apps Script web app URL
- `VITE_SHEET_ID` = your Google Sheet ID (for reference)

### Build Settings
- Build Command: `npm run build`
- Output Directory: `dist`

### Local Build
```bash
npm install
npm run build
npm run preview
```

## 2. Backend Deployment (Google Apps Script)

### Prerequisites
- Google Account
- `clasp` installed locally

### Setup
1. Open a terminal in the repository root.
2. Change to the Apps Script directory:
   ```bash
   cd apps-scripts
   ```
3. Update `apps-scripts/src/Code.gs` with your real `SHEET_ID` and `FOLDER_ID`.
4. Authenticate with Google:
   ```bash
   clasp login
   ```
5. Push the script:
   ```bash
   clasp push
   ```
6. Deploy as a web app:
   ```bash
   clasp deploy --description 'Deploy student portfolio backend'
   ```
7. Copy the deployment URL and set it as `VITE_APPSCRIPT_URL` in Vercel.

## 3. Environment Variables for Vercel
Paste these values into the Vercel dashboard:
- `VITE_APPSCRIPT_URL` = `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`
- `VITE_SHEET_ID` = `YOUR_GOOGLE_SHEET_ID`

## 4. Verification
- Open the deployed Vercel site and confirm the login screen appears.
- Test login with `Admin` / `adminssk`.
- Test login with any `@ssk.ac.th` email and password `sskssk`.
- Create a record and verify it appears on the manage screen.
- Confirm uploaded attachments open from the record detail view.
