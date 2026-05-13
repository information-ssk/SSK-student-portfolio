# SSK Student Portfolio - Ready for Deployment Checklist

**Target Audience:** QA Team, Release Manager, DevOps  
**Document Date:** May 13, 2026  
**Version:** 1.0.0  
**Status:** ✅ READY FOR DEPLOYMENT

---

## 📋 Pre-Deployment Checks (15 Items)

### Code Quality
- [ ] **No console errors** - Run `npm run build` locally, check output
  ```bash
  npm run build
  # Expected: Build successful, no errors, warnings acceptable
  ```

- [ ] **No TypeScript errors** - Build completes with `tsc`
  ```bash
  npm run build
  # Output should show: "dist/..." files, not "error TS..."
  ```

- [ ] **Code formatting consistent** - Check indentation, spacing
  ```bash
  # Visual check in Git diff
  git diff main..develop
  # All files should use consistent formatting
  ```

- [ ] **No hardcoded secrets** - Verify no passwords/API keys in code
  ```bash
  grep -r "password" src/
  grep -r "secret" src/
  grep -r "api_key" src/
  # Should return no results (only in types, comments OK)
  ```

- [ ] **Environment variables not committed** - `.env` files ignored
  ```bash
  git status
  # Should show: .env, .env.local NOT in staging
  
  cat .gitignore
  # Should include: .env, .env.*.local
  ```

### Functional Testing
- [ ] **Homepage loads** - App displays correctly on load
  ```
  1. Open http://localhost:5173 (dev) or deployed URL
  2. Expected: Header, navigation visible, no errors in console
  3. Check: All text renders in Thai/English correctly
  ```

- [ ] **Login works** - Authentication functional
  ```
  1. Click "Login" button
  2. Enter admin credentials (Department: Admin, Password: adminssk)
  3. Expected: Redirects to home, shows authenticated state
  4. Check: "Logout" button appears, "Login" disappears
  ```

- [ ] **Add achievement works** - Form submission successful
  ```
  1. After login, click "Record" button
  2. Fill all required fields
  3. Add at least one competition
  4. Click "Save"
  5. Expected: Toast notification "บันทึกสำเร็จ"
  6. Check: Data appears in achievement list
  ```

- [ ] **View achievements works** - List displays correctly
  ```
  1. Go to Home page
  2. Expected: List of achievements visible
  3. Click record to expand details
  4. Expected: All fields visible, formatted correctly
  5. Check: No broken layouts, images load
  ```

- [ ] **File upload works** (if implemented)
  ```
  1. Add achievement with file attachment
  2. Upload file through form
  3. Expected: File uploaded to Google Drive
  4. Check: File URL appears in record
  ```

### Performance & Bundle
- [ ] **Bundle size acceptable** - Production build < 100KB gzipped
  ```bash
  npm run build
  ls -lh dist/assets/
  # JS files should be < 50KB, total < 100KB gzipped
  ```

- [ ] **Build time acceptable** - Production build < 30 seconds
  ```bash
  time npm run build
  # Should complete in 15-20 seconds
  ```

- [ ] **No unused dependencies** - Check package.json
  ```bash
  npm list
  # All listed packages used in code
  # Remove: npm uninstall <package>
  ```

### Configuration
- [ ] **Environment template complete** - `.env.example` has all vars
  ```bash
  cat .env.example
  # Should have: VITE_APPSCRIPT_URL, VITE_SHEET_ID
  ```

- [ ] **Vercel config valid** - `vercel.json` has correct settings
  ```bash
  cat vercel.json
  # Should have:
  # - framework: "vite"
  # - buildCommand: "npm run build"
  # - outputDirectory: "dist"
  # - rewrites for SPA routing
  ```

- [ ] **GitHub Actions valid YAML** - Workflows parse correctly
  ```bash
  cat .github/workflows/deploy.yml | head -20
  # Should start with "name:" and "on:"
  # No YAML syntax errors
  ```

---

## 🔧 Backend Deployment Checklist (Google Apps Script)

### Pre-Deployment
- [ ] **Google Apps Script configured** - Backend ready
  ```bash
  # Check Code.gs exists
  ls -la apps-scripts/src/Code.gs
  ```

- [ ] **Credentials configured** - Google Drive folder ID set
  ```javascript
  // apps-scripts/src/Code.gs
  const SHEET_ID = '1csUBR9QdvqHEYTiIospBAb5KjuRupIOBJZkBTphCz0U'
  const FOLDER_ID = '1kIk_4pcz9DiuoA82K8Fnr8Conq3Y1Dnk'
  // Should be non-empty
  ```

- [ ] **API endpoints verified** - All 5 endpoints present
  ```
  ✓ login - User authentication
  ✓ validateToken - Session validation
  ✓ list - Fetch records
  ✓ upload - Save records
  ✓ delete - Remove records
  ```

- [ ] **Google Sheets accessible** - Database sheet exists and has correct schema
  ```
  1. Open Google Sheet (SHEET_ID)
  2. Expected: "ผลงาน" sheet visible
  3. Check: 11 columns present with correct headers
  ```

- [ ] **Google Drive folder accessible** - File storage ready
  ```
  1. Open Google Drive
  2. Find folder (FOLDER_ID)
  3. Expected: Folder exists, writable
  ```

### Deployment Steps
- [ ] **Install clasp CLI** - Google Apps Script deployer
  ```bash
  npm install -g @google/clasp
  clasp -v
  # Should show: @google/clasp <version>
  ```

- [ ] **Authenticate with Google** - clasp has permissions
  ```bash
  clasp login
  # Browser opens, authenticate with Google account
  # that owns the Google Apps Script project
  ```

- [ ] **Push code to Apps Script** - Deploy backend
  ```bash
  cd apps-scripts
  clasp push
  # Expected: "✓ Pushed 1 file"
  ```

- [ ] **Deploy Apps Script** - Make new deployment
  ```bash
  clasp deploy --version "1.0.0"
  # Expected: Shows new deployment ID
  # Copy deployment URL (looks like: https://script.google.com/macros/d/...)
  ```

- [ ] **Test endpoints** - Verify backend working
  ```bash
  # Get deployment URL from Apps Script Settings
  # Test with curl:
  curl -X POST "https://script.google.com/macros/d/YOUR_ID/exec?action=login" \
    -H "Content-Type: application/json" \
    -d '{"password":"adminssk","dept":"Admin"}'
  
  # Expected: JSON response with success: true, token field
  ```

- [ ] **Note deployment URL** - Save for environment config
  ```
  Apps Script URL: https://script.google.com/macros/d/AKfycbw.../exec
  
  Use in:
  - .env.production
  - Vercel environment variables
  - GitHub Secrets (if using GitHub Actions)
  ```

### Post-Deployment Verification
- [ ] **Backend accessible from frontend** - API calls work
  ```
  1. Deploy frontend with new VITE_APPSCRIPT_URL
  2. Try login on deployed site
  3. Expected: Login successful, token received
  4. Check browser Network tab: POST to Apps Script succeeds
  ```

- [ ] **Data persistence** - Records saved to Sheet
  ```
  1. Add new achievement through frontend
  2. Check Google Sheet
  3. Expected: New row appears with data
  4. Check: All fields populated correctly
  ```

---

## 🚀 Frontend Deployment Checklist (2 Options)

### Option A: Vercel Deployment (RECOMMENDED)

#### Pre-Deployment
- [ ] **Vercel account created** - Free account accessible
  ```
  Sign up at: https://vercel.com (free tier)
  ```

- [ ] **GitHub connected to Vercel** - Authorization granted
  ```
  1. Login to Vercel
  2. Settings → Git Repositories
  3. Should show GitHub repo connected
  ```

- [ ] **Environment variables configured in Vercel**
  ```
  1. Vercel dashboard → Project → Settings → Environment Variables
  2. Add:
     - VITE_APPSCRIPT_URL = https://script.google.com/macros/d/.../exec
     - VITE_SHEET_ID = 1csUBR9QdvqHEYTiIospBAb5KjuRupIOBJZkBTphCz0U
  3. Select production environment
  ```

#### Deployment Steps
- [ ] **Trigger deployment**
  ```bash
  # Option 1: Deploy from local
  npm run deploy:vercel --prod
  
  # Option 2: Push to main branch (auto-deploy if configured)
  git push origin main
  ```

- [ ] **Monitor deployment logs** - Build completes successfully
  ```
  1. Open Vercel dashboard
  2. Click project
  3. Watch Deployments tab
  4. Expected: Build and Deployment complete (green checkmark)
  5. Check logs for errors
  ```

- [ ] **Get deployment URL** - Note the live URL
  ```
  Vercel shows: https://ssk-portfolio.vercel.app
  or custom domain if configured
  ```

#### Post-Deployment Verification
- [ ] **Frontend loads** - No 404 or blank page
  ```
  1. Open deployed URL
  2. Expected: Homepage with achievements visible
  3. Check: No "Cannot GET /" errors
  ```

- [ ] **Login functional** - Authentication works
  ```
  1. Click Login
  2. Enter credentials
  3. Expected: Login successful, redirect to home
  4. Browser DevTools Network: POST succeeds to Apps Script
  ```

- [ ] **API calls work** - Backend communication successful
  ```
  1. Try adding achievement
  2. Browser DevTools → Network tab
  3. POST request to Apps Script should return 200
  4. Expected: Toast "บันทึกสำเร็จ"
  ```

- [ ] **Files serve correctly** - Assets load with proper caching
  ```
  Browser DevTools → Network tab:
  - .html files: Cache-Control: max-age=3600
  - /assets/* files: Cache-Control: max-age=31536000, immutable
  - All files: HTTP 200 (not 304)
  ```

### Option B: GitHub Pages Deployment

#### Pre-Deployment
- [ ] **GitHub Pages enabled** - Repository settings configured
  ```
  1. GitHub repo → Settings → Pages
  2. Build and deployment → Source: "GitHub Actions"
  3. Or: Source: "Deploy from branch", Branch: "gh-pages"
  ```

- [ ] **Environment variables in GitHub Secrets** (if using Actions)
  ```
  1. GitHub repo → Settings → Secrets and variables → Actions
  2. Add:
     - VITE_APPSCRIPT_URL = https://script.google.com/macros/d/.../exec
     - VITE_SHEET_ID = 1csUBR9QdvqHEYTiIospBAb5KjuRupIOBJZkBTphCz0U
  ```

#### Deployment Steps
- [ ] **Build and deploy**
  ```bash
  npm run deploy:github
  # Builds, commits dist/, pushes to gh-pages branch
  # Takes ~1-2 minutes
  ```

- [ ] **Monitor deployment** - Check GitHub Actions
  ```
  1. GitHub repo → Actions tab
  2. Watch workflow run
  3. Expected: All steps complete (green checkmarks)
  4. Check logs for errors
  ```

- [ ] **Get deployment URL** - Note the live URL
  ```
  GitHub Pages URL: https://<username>.github.io/<repo-name>
  For public repo: https://<org>.github.io/SSK-student-portfolio
  ```

#### Post-Deployment Verification
- [ ] **Frontend loads** - No 404 errors
  ```
  1. Open GitHub Pages URL
  2. Expected: Homepage loads
  3. Check: Not blank page, not 404
  ```

- [ ] **SPA routing works** - Page navigation functions
  ```
  1. Click links to navigate
  2. URL changes (or hash-based navigation)
  3. Expected: Page content updates
  4. Browser back/forward work
  ```

- [ ] **Login functional** - Authentication works
  ```
  Same as Vercel option above
  ```

---

## ✅ Post-Deployment Verification (14 Items)

### Functionality Tests
- [ ] **All pages accessible** - All 4 pages load
  ```
  ✓ Home (/)
  ✓ Login (/login)
  ✓ Record (/record)
  ✓ Manage (/manage)
  ```

- [ ] **Authentication flow works** - Login → Home → Add → View → Logout
  ```
  1. Login with credentials
  2. See authenticated UI
  3. Add achievement
  4. See it in list
  5. Logout
  6. Should return to login page
  ```

- [ ] **Data persistence** - Records appear after refresh
  ```
  1. Add achievement
  2. F5 to refresh page
  3. Expected: Achievement still visible
  4. Check: Data persisted to Google Sheet
  ```

- [ ] **Error handling** - Invalid input shows errors
  ```
  1. Try empty login
  2. Expected: Error message appears
  3. Try invalid password
  4. Expected: "Invalid credentials" error
  5. Try form submission without required fields
  6. Expected: Validation error shown
  ```

- [ ] **File uploads work** (if applicable)
  ```
  1. Add achievement with file
  2. Expected: Upload succeeds
  3. Check: File accessible in Google Drive
  ```

### Performance Tests
- [ ] **Page load time acceptable** - Homepage loads < 3 seconds
  ```
  Browser DevTools → Lighthouse
  Expected: 80+ score on Performance
  ```

- [ ] **No console errors** - DevTools shows no errors
  ```
  Browser DevTools → Console
  Expected: No red errors, only info/warnings acceptable
  ```

- [ ] **Responsive design** - Works on mobile
  ```
  1. Browser DevTools → Device toolbar
  2. Test on iPhone 12, Pixel 5, Tablet
  3. Expected: Readable, all functions work
  ```

- [ ] **Cross-browser compatibility** - Works on Chrome, Firefox, Safari
  ```
  Test on:
  ✓ Chrome
  ✓ Firefox
  ✓ Safari (macOS)
  ✓ Edge (optional)
  ```

### Security Checks
- [ ] **HTTPS enabled** - All traffic encrypted
  ```
  URL should show: https://... (not http://)
  Browser address bar: Green lock icon
  ```

- [ ] **No sensitive data in logs** - Error messages safe
  ```
  Browser Console: No passwords, tokens, API keys visible
  Network requests: Sensitive data only in POST body
  ```

- [ ] **Session timeout works** - Token expiration handled
  ```
  1. Login
  2. Wait 24+ hours (or trigger token expiration in code)
  3. Try action
  4. Expected: Redirected to login
  ```

- [ ] **Credentials not hardcoded** - Production safe
  ```bash
  grep -r "password:" dist/
  grep -r "token:" dist/
  # Should return no actual credentials
  ```

### Data Integrity
- [ ] **Data format correct** - Saved data matches schema
  ```
  1. Add achievement
  2. Check Google Sheet
  3. Verify:
     - Date is valid format (YYYY-MM-DD)
     - Student name is string
     - Competition array valid JSON
     - Numbers are numbers (not strings)
  ```

- [ ] **No data loss** - All fields persisted
  ```
  1. Add achievement with all fields
  2. Refresh page
  3. Check all fields present (no nulls, no truncation)
  ```

---

## 🚨 Rollback Plan

### If Deployment Fails

#### Vercel Rollback
```bash
# Option 1: Revert to previous deployment
1. Vercel dashboard → Deployments
2. Find previous working deployment
3. Click ... → Promote to Production

# Option 2: Rollback code and re-deploy
git revert HEAD
git push origin main
# Vercel auto-deploys
```

#### GitHub Pages Rollback
```bash
# Option 1: Revert commit
git revert <commit-hash>
git push origin main
# GitHub Actions re-builds

# Option 2: Delete gh-pages branch, redeploy
git push origin --delete gh-pages
npm run deploy:github
```

### If Backend Fails

#### Google Apps Script Rollback
```bash
# Option 1: Restore previous version from Apps Script
1. Open Google Apps Script project
2. Editor left panel → Deployment versions
3. Find previous working version
4. New deployment → Choose previous version
5. Update VITE_APPSCRIPT_URL to new deployment

# Option 2: Push previous code
git checkout apps-scripts/src/Code.gs  # Revert changes
clasp push
clasp deploy --version "rollback"
```

---

## 📋 Final Sign-Off Checklist

**By checking this, you confirm the deployment is verified and ready for production use.**

- [ ] **All Pre-Deployment Checks passed** - Code quality verified
- [ ] **All Backend Deployment steps complete** - Google Apps Script deployed
- [ ] **All Frontend Deployment steps complete** - Frontend deployed to Vercel/GitHub
- [ ] **All Post-Deployment Verification tests passed** - Functionality confirmed
- [ ] **Team tested and approved** - QA sign-off received
- [ ] **Documentation updated** - All guides reflect deployed version
- [ ] **Rollback plan documented** - Team knows how to rollback
- [ ] **Production environment configured** - All secrets/env vars set

**Deployment Status:** ✅ **READY FOR PRODUCTION**

**Deployed By:** _________________ (name)  
**Date:** _________________ (MM/DD/YYYY)  
**Version:** 1.0.0  
**Environment:** Production / Staging  

---

## 📞 Support During Deployment

### Key Contacts
- **Frontend Issues:** [Frontend Developer Name]
- **Backend Issues:** [Backend Developer Name]
- **DevOps/Infrastructure:** [DevOps Name]
- **Project Manager:** [PM Name]

### Escalation Path
```
Issue detected
    ↓
Notify [Frontend/Backend] Developer
    ↓
If critical → Notify Project Manager
    ↓
If unresolved → Trigger rollback plan
    ↓
Postmortem meeting to prevent recurrence
```

### Common Deployment Issues

**Issue:** "Build failed on Vercel"  
**Solution:** Check logs → npm install → git push again

**Issue:** "404 on deployed site"  
**Solution:** Configure SPA rewrites → Redeploy

**Issue:** "Login fails after deploy"  
**Solution:** Verify VITE_APPSCRIPT_URL in env vars → Check Google Apps Script deployed

**Issue:** "Assets not loading"  
**Solution:** Clear browser cache (Ctrl+F5) → Check network requests

---

## ✅ Success Criteria

✅ **Deployment successful when:**
1. Frontend loads without errors
2. Login works with test credentials  
3. Can add achievement and see it in list
4. Data persists in Google Sheets
5. No console errors in browser DevTools
6. Load time < 3 seconds
7. Mobile/tablet responsive
8. All 4 pages accessible

**Status: READY FOR DEPLOYMENT** 🚀

---

**Document Version:** 1.0.0  
**Last Updated:** May 13, 2026  
**Next Review:** After first production deployment

For detailed setup information, see:
- `DEPLOYMENT.md` - Complete deployment guide
- `FINAL_SUMMARY.md` - Project overview
- `ARCHITECTURE.md` - Technical details
