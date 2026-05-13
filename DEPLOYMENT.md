# Deployment Guide

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository with this code

### Steps
1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL` = `https://0ec90b57d6e95fcbda19832f.supabase.co`
   - `VITE_SUPABASE_SUPABASE_ANON_KEY` = (your Supabase anon key)
3. Deploy - Vercel will automatically build and deploy

### Local Testing
```bash
npm install
npm run build
npm run preview
```

## Backend Deployment (Google Apps Script)

### Prerequisites
- Google Account
- Google Apps Script project

### Steps
1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Replace the code with contents of `apps-scripts/src/Code.gs`
4. Deploy as web app:
   - Click "Deploy" → "New deployment"
   - Type: "Web app"
   - Execute as: Your account
   - Who has access: "Anyone"
5. Copy the deployment URL and share with frontend

### Update Frontend
Add the Apps Script URL to `.env`:
```
VITE_APPSCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/usercallback
```

## Supabase Setup

Database tables and policies are automatically created via migrations.
Edge functions are deployed to Supabase.

### Verify Setup
- Check Supabase dashboard: Tables → achievements
- Check Edge Functions → upload-achievement-file
- Verify RLS policies are enabled

## Testing

1. Login with any @ssk.ac.th email and password `sskssk`
2. Admin login: username `Admin`, password `adminssk`
3. Data syncs with Supabase in real-time
