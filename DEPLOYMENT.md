# Deployment Guide - SSK Student Portfolio

This repository includes a Vercel-hosted frontend (React + Vite) and a Google Apps Script backend. Multiple deployment options are supported: Vercel (recommended), GitHub Pages, and manual deployment.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Frontend Deployment Options](#frontend-deployment-options)
3. [Backend Deployment](#backend-deployment)
4. [Environment Setup](#environment-setup)
5. [CI/CD Workflows](#cicd-workflows)
6. [Troubleshooting](#troubleshooting)
7. [Custom Domain Setup](#custom-domain-setup)

---

## Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your values:
# - VITE_APPSCRIPT_URL: Your Google Apps Script URL
# - VITE_SHEET_ID: Your Google Sheet ID

# Start development server
npm run dev
# Opens at http://localhost:5173
```

### Production Build
```bash
# Build the frontend
npm run build

# Preview production build locally
npm run preview
```

---

## Frontend Deployment Options

### Option 1: Vercel (Recommended)

#### Step 1: Connect GitHub Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"** → **"Import Git Repository"**
3. Select your GitHub repository (SSK-student-portfolio)
4. **Framework Preset**: Select **"Vite"** (automatically detected)
5. Click **"Import"**

#### Step 2: Configure Environment Variables in Vercel

In the **Settings** tab > **Environment Variables**:

```
VITE_APPSCRIPT_URL=https://script.google.com/macros/d/{YOUR_SCRIPT_ID}/usercurrent/exec
VITE_SHEET_ID={YOUR_SHEET_ID}
```

**How to find these values:**
- **VITE_APPSCRIPT_URL**: From Google Apps Script > Deploy as web app > Copy the "Current web app URL"
- **VITE_SHEET_ID**: From your Google Sheet URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

#### Step 3: Deploy

**Automatic**: Push to `main` branch triggers automatic deployment
```bash
git push origin main
```

**Manual preview**:
```bash
npm run deploy:vercel:preview
```

**Manual production**:
```bash
npm run deploy:vercel
```

Or install [Vercel CLI](https://vercel.com/docs/cli):
```bash
npm i -g vercel
vercel --prod
```

✅ **Vercel deployment is now live!** Check your deployment URL in Vercel dashboard.

---

### Option 2: GitHub Pages

#### Step 1: Enable GitHub Pages

1. Go to your GitHub repository **Settings** → **Pages**
2. Under "Source", select **"Deploy from a branch"**
3. Select **`gh-pages`** branch, **`/ (root)`** folder
4. Click **"Save"**

#### Step 2: Add Repository Secrets

In repository **Settings** → **Secrets and variables** → **Actions**, add:
```
VITE_APPSCRIPT_URL=https://script.google.com/macros/d/{YOUR_SCRIPT_ID}/usercurrent/exec
VITE_SHEET_ID={YOUR_SHEET_ID}
```

#### Step 3: Deploy

Push to `main` branch - GitHub Actions automatically builds and deploys to `gh-pages`:
```bash
git push origin main
```

The site is live at: `https://{github-username}.github.io/{repository-name}/`

**Manual deployment** (if not using GitHub Actions):
```bash
npm run deploy:github
```

---

### Option 3: Manual Deployment

#### Build
```bash
npm run build
```

#### Deploy to any static host:
- **AWS S3**: Upload `dist/` folder
- **Netlify**: Drag & drop `dist/` folder
- **Firebase Hosting**: 
  ```bash
  npm install -g firebase-tools
  firebase init hosting
  firebase deploy --only hosting
  ```
- **Surge.sh**:
  ```bash
  npm install -g surge
  surge dist/
  ```

---

## Backend Deployment

### Google Apps Script Setup

#### Step 1: Install clasp
```bash
npm install -g @google/clasp
```

#### Step 2: Authenticate
```bash
clasp login
```
This opens a browser to authenticate with your Google account.

#### Step 3: Create Apps Script Project
```bash
cd apps-scripts
clasp create --title "SSK Student Portfolio Backend"
```

#### Step 4: Configure Credentials

Edit [apps-scripts/src/Code.gs](apps-scripts/src/Code.gs) with your values:
```javascript
const SHEET_ID = "YOUR_SHEET_ID";
const FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID";
```

#### Step 5: Push Code
```bash
clasp push
```

#### Step 6: Deploy as Web App

```bash
clasp deploy --description "Production deployment"
```

This returns a deployment ID. Use the **Current web app URL** in your frontend environment variables:
```
https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercurrent/exec
```

#### Update Deployment
```bash
npm run build
clasp push
clasp deploy --description "Update message"
```

---

## Environment Setup

### Files Reference

| File | Purpose | Required |
|------|---------|----------|
| `.env.local` | Development environment variables | ✅ |
| `.env.development` | Development defaults (committed) | ✅ |
| `.vercel/.env.example` | Vercel production template | ✅ |
| `.env.example` | Repository template | ✅ |

### Creating Environment Files

**Development**:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_APPSCRIPT_URL=https://script.google.com/macros/d/{YOUR_DEV_SCRIPT_ID}/usercurrent/exec
VITE_SHEET_ID={YOUR_DEV_SHEET_ID}
```

**Production** (on Vercel/GitHub):
Set secrets in platform dashboard (never commit `.env` files)

---

## CI/CD Workflows

This repository includes GitHub Actions workflows for automated testing and deployment.

### Workflow: `.github/workflows/deploy.yml`

**Triggers**: Push to `main` or `develop` branches

**Jobs**:
1. **Build & Test** (Node 18 & 20)
   - Lint & type-check
   - Upload build artifacts
   
2. **Deploy to GitHub Pages** (main branch only)
   - Automatic on `main` push
   - Uses `VITE_APPSCRIPT_URL` and `VITE_SHEET_ID` secrets
   
3. **Deploy to Vercel** (main branch only)
   - Requires: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Workflow: `.github/workflows/github-pages.yml`

**Triggers**: Push to `main` branch or manual trigger

**Jobs**:
1. Build Vite project with environment variables
2. Configure GitHub Pages
3. Deploy to `gh-pages` branch

### Setting Up Secrets

Navigate to **Settings** → **Secrets and variables** → **Actions**:

**For GitHub Pages**:
```
VITE_APPSCRIPT_URL = https://script.google.com/macros/d/.../usercurrent/exec
VITE_SHEET_ID = your_sheet_id
```

**For Vercel CI/CD**:
```
VERCEL_TOKEN = (from vercel.com/account/tokens)
VERCEL_ORG_ID = (from Vercel dashboard)
VERCEL_PROJECT_ID = (from Vercel project settings)
```

---

## Troubleshooting

### Issue: Build fails with "VITE_APPSCRIPT_URL not defined"

**Solution**: Add environment variable to platform:
- **Local**: Create `.env.local` file
- **GitHub**: Add to repository Secrets (Settings → Secrets)
- **Vercel**: Add to Environment Variables (Project Settings)

### Issue: "Cannot find module" errors

**Solution**: Rebuild dependencies
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Routes not working after deployment

**Solution**: Ensure SPA rewrite rules are configured:
- **Vercel**: ✅ Configured in `vercel.json` with `"rewrites"`
- **GitHub Pages**: ✅ Works automatically with `index.html`
- **Other**: Configure `/* → /index.html` rewrite

### Issue: Static assets (CSS, images) not loading

**Solution**: Check paths are correct
```bash
npm run build
npm run preview  # Test locally
```

### Issue: "Vercel CLI not authenticated"

**Solution**:
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Custom Domain Setup

### Vercel

1. Go to **Project Settings** → **Domains**
2. Click **"Add"** → Enter your domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-30 minutes)

### GitHub Pages

1. Repository **Settings** → **Pages**
2. Under "Custom domain", enter your domain
3. Update DNS records to point to GitHub Pages:
   ```
   A     185.199.108.153
   A     185.199.109.153
   A     185.199.110.153
   A     185.199.111.153
   ```
4. Enable **"Enforce HTTPS"** (recommended)

### DNS Configuration Example (for `example.com`)

**For Vercel**:
```
CNAME  www.example.com → cname.vercel-dns.com.
```

**For GitHub Pages**:
```
A      example.com → 185.199.108.153
A      example.com → 185.199.109.153
A      example.com → 185.199.110.153
A      example.com → 185.199.111.153
CNAME  www.example.com → {username}.github.io.
```

---

## Performance Optimization

### Cache Strategy (configured in `vercel.json`)

```json
{
  "/assets/*": "public, max-age=31536000, immutable",
  "/*": "public, max-age=3600"
}
```

- **Assets** (`/assets/*`): Cached for 1 year (files have content hashes)
- **HTML/JS**: Cached for 1 hour (allows quick updates)

### Monitoring

- **Vercel**: Dashboard → Analytics
- **GitHub Pages**: No built-in analytics (use third-party)

---

## Security Considerations

✅ **Implemented**:
- Environment variables for sensitive data
- No secrets in source code
- HTTPS enforced on production
- `.gitignore` prevents accidental commits

⚠️ **Important**:
- Never commit `.env` files
- Rotate secrets if exposed
- Use separate credentials for dev/prod
- Review `Code.gs` for sensitive data handling

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [GitHub Issues](https://github.com/your-org/SSK-student-portfolio/issues)
3. Consult [Vercel Docs](https://vercel.com/docs) or [GitHub Pages Docs](https://docs.github.com/en/pages)
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
