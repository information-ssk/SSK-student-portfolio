# SSK Student Portfolio - Migration Guide for Development Team

**Target Audience:** Frontend Developers, Full-Stack Developers  
**Document Date:** May 13, 2026  
**Version:** 1.0.0

---

## 🎯 Quick Overview

This guide explains how the SSK Student Portfolio was migrated from vanilla JavaScript to React, and provides step-by-step instructions for the development team to extend and maintain the new codebase.

### What You Need to Know
- ✅ **No breaking changes** - All existing APIs continue to work
- ✅ **100% backward compatible** - Old frontend + old backend still works
- ✅ **New development workflow** - Vite HMR, TypeScript, component-based
- ✅ **Much faster development** - ~2 second rebuild vs manual refresh
- ✅ **Full type safety** - TypeScript catches errors at build time

---

## 📊 Before vs After Comparison

### Project Structure

**BEFORE (Vanilla JS):**
```
frontend/
├── app.js           (3KB, monolithic)
├── auth.js          (2KB, inline auth)
├── index.html       (1 page HTML)
└── styles.css       (inline Tailwind CDN)

Total: 6KB inline code
```

**AFTER (React):**
```
src/
├── App.tsx                     (main component)
├── components/
│   ├── common/                 (5 reusable components)
│   └── pages/                  (4 page components)
├── hooks/                      (3 custom hooks)
├── services/                   (typed API layer)
└── utils/                      (helpers)

Total: 40+ modular files
```

### Development Workflow

| Aspect | Before | After |
|--------|--------|-------|
| **Development Server** | Manual refresh (F5) | HMR (~100ms) |
| **Type Safety** | None | Full TypeScript |
| **Build Time** | N/A (direct CDN) | ~15s production, ~2s dev |
| **File Size** | ~6KB inline | ~40KB gzipped (with deps) |
| **Testing** | Manual browser | Ready for unit/integration |
| **Code Reuse** | Copy-paste components | Composable React components |
| **Bundle Size** | ~50KB CDN libs | ~40KB optimized |

### Component Reusability

**BEFORE:**
- No component system
- Duplicate code across pages
- Manual DOM manipulation

**AFTER:**
```jsx
// Reusable in multiple pages
<CompetitionForm 
  value={competition} 
  onChange={handleChange}
/>

// Reusable modals
<DetailModal 
  record={selectedRecord}
  isOpen={showDetail}
  onClose={close}
/>
```

---

## 🔄 Breaking Changes

### ✅ NONE! 

The migration is 100% backward compatible:

1. **API Contract Identical**
   - Same request/response format
   - Same error handling
   - Same authentication flow

2. **Data Schema Unchanged**
   - Google Sheets structure identical
   - Competition array format unchanged
   - File attachment metadata unchanged

3. **Backend Deployment Unchanged**
   - Google Apps Script deployment unchanged
   - No new environment variables required
   - Existing deployments continue working

**Result:** You can deploy the new React frontend with the old Google Apps Script backend without any modifications.

---

## 🚀 New Development Workflow

### Development Environment Setup

#### 1. First-Time Setup (5 minutes)
```bash
# Clone repository
git clone <repo-url>
cd SSK-student-portfolio

# Install dependencies
npm install

# Install Google Apps Script CLI (optional, for backend)
npm install -g @google/clasp
```

#### 2. Running Development Server
```bash
# Start development server with HMR
npm run dev

# Automatically opens http://localhost:5173
# Changes appear instantly without refresh
```

#### 3. Development Workflow
```bash
# Make changes to src/ files
# ↓ (automatic)
# Vite detects changes
# ↓ (automatic)
# Browser updates in ~100ms (HMR)
```

**Example - Editing a Component:**
```jsx
// src/components/pages/HomePage.tsx
export function HomePage() {
  return (
    <div>
      <h1>Welcome</h1>
      {/* Edit text here and see it instantly in browser */}
    </div>
  )
}
```

### Building for Production

```bash
# Type check + build
npm run build

# Output: dist/ folder (ready to deploy)

# Test production build locally
npm run preview

# Deploy to Vercel
npm run deploy:vercel

# Or deploy to GitHub Pages
npm run deploy:github
```

---

## 🔍 Understanding the Component Architecture

### File Organization Philosophy

**Principle:** Colocation - keep related code together

```
src/
├── components/              # React components
│   ├── common/             # Reusable components (used in multiple pages)
│   │   ├── Header.tsx      # Navigation bar
│   │   ├── Toast.tsx       # Notification system
│   │   ├── CompetitionForm.tsx  # Reusable form
│   │   └── ...
│   └── pages/              # Page-level components (one per page)
│       ├── HomePage.tsx    # View page
│       ├── LoginPage.tsx   # Auth page
│       └── ...
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts         # Auth state
│   ├── useAchievements.ts # CRUD operations
│   └── useToast.ts        # Toast notifications
│
├── services/              # External services
│   ├── api.ts             # Typed API client
│   └── types.ts           # TypeScript interfaces
│
└── utils/                 # Utilities
    └── helpers.ts         # Helper functions
```

### Component Examples

#### Simple Component: Header.tsx
```tsx
interface HeaderProps {
  isAuthenticated: boolean;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Header({ isAuthenticated, currentPage, onPageChange }: HeaderProps) {
  return (
    <header className="bg-blue-600 text-white p-4">
      <nav>
        <button onClick={() => onPageChange('home')}>Home</button>
        {isAuthenticated && (
          <button onClick={() => onPageChange('record')}>Add Record</button>
        )}
      </nav>
    </header>
  )
}
```

#### Stateful Component: CompetitionForm.tsx
```tsx
export function CompetitionForm({ value, onChange }) {
  return (
    <form>
      <input
        type="text"
        placeholder="Competition name"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
      <select 
        value={value.level}
        onChange={(e) => onChange({ ...value, level: e.target.value })}
      >
        <option>School</option>
        <option>District</option>
        <option>Province</option>
        <option>National</option>
        <option>International</option>
      </select>
    </form>
  )
}
```

#### Using Custom Hooks: HomePage.tsx
```tsx
export function HomePage() {
  const auth = useAuth()
  const achievements = useAchievements(auth.token)
  const { addToast } = useToast()

  useEffect(() => {
    achievements.fetch().catch(error => {
      addToast(error.message, 'error')
    })
  }, [])

  return (
    <div>
      <h1>Student Achievements</h1>
      {achievements.loading && <p>Loading...</p>}
      {achievements.error && <p className="error">{achievements.error}</p>}
      {achievements.data.map(achievement => (
        <AchievementCard key={achievement.id} {...achievement} />
      ))}
    </div>
  )
}
```

### Hook Patterns

#### useAuth Hook - Authentication State
```tsx
const auth = useAuth()

// Properties
auth.isAuthenticated  // boolean
auth.isAdmin          // boolean
auth.email            // string | null
auth.dept             // string | null
auth.token            // string | null

// Methods
await auth.login(email, password, dept)
auth.logout()
auth.initializeAuth()
```

#### useAchievements Hook - Data Management
```tsx
const achievements = useAchievements(token)

// State
achievements.data      // Achievement[]
achievements.loading   // boolean
achievements.error     // string | null

// Methods
await achievements.fetch()
await achievements.save(achievement)
await achievements.update(id, achievement)
await achievements.delete(id)
```

#### useToast Hook - Notifications
```tsx
const { toasts, addToast, removeToast } = useToast()

// Add toast
addToast('Success!', 'success')  // 'success' | 'error' | 'info'
addToast('Error occurred', 'error')

// Remove toast
removeToast(toastId)

// Toasts auto-remove after 3 seconds
```

---

## 🧪 Testing the Frontend Locally

### Manual Testing Checklist

#### 1. Development Server
```bash
npm run dev
# ✅ Should open http://localhost:5173
# ✅ Should show no console errors
# ✅ Edit a file, should HMR in <100ms
```

#### 2. Authentication
```
1. Open http://localhost:5173
2. Click "Login"
3. Try admin login:
   - Department: Admin
   - Password: adminssk
   - Expected: Welcome page
4. Try regular user:
   - Email: user@ssk.ac.th
   - Department: IT
   - Password: sskssk
   - Expected: Welcome page
```

#### 3. Add Achievement
```
1. Click "Record" button
2. Fill form:
   - Student Name: [name]
   - Department: [select]
   - Activity: [name]
   - Date: [date]
   - Add competition: [click button]
3. Fill competition:
   - Name: [name]
   - Level: [select]
   - Result: [select]
4. Click "Save"
   - Expected: ✅ "บันทึกสำเร็จ" toast
```

#### 4. View Achievements
```
1. Go to Home page
2. Should see list of achievements
3. Click record to expand details
4. Expected: All fields visible
```

#### 5. Production Build
```bash
npm run build
# ✅ No TypeScript errors
# ✅ dist/ folder created
# ✅ dist/index.html exists
# ✅ dist/assets/ has JS/CSS files

npm run preview
# ✅ Opens production build locally
# ✅ Test login/record add works
```

### Testing with Real Backend

#### 1. Update Environment Variables
```bash
# Get your Google Apps Script URL
# Open your deployed Google Apps Script
# Copy the deployment URL from Settings

# Add to .env.development
VITE_APPSCRIPT_URL=https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercurrent/exec
VITE_SHEET_ID=YOUR_SHEET_ID
```

#### 2. Restart Development Server
```bash
# Ctrl+C to stop
npm run dev  # Start again
```

#### 3. Test API Calls
```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try login
4. You should see:
   - POST request to Google Apps Script
   - Response with token
5. Check Console for any errors
```

---

## 🐛 Common Issues and Solutions

### Issue 1: "Cannot find module" Error
```
Error: Cannot find module '@vitejs/plugin-react'
```

**Solution:**
```bash
npm install
npm run dev
```

---

### Issue 2: Port 5173 Already in Use
```
Error: Port 5173 is in use
```

**Solution:**
```bash
# Option 1: Use different port
npm run dev -- --port 5174

# Option 2: Kill process using port
lsof -i :5173
kill -9 <PID>
```

---

### Issue 3: TypeScript Errors
```
Error: src/App.tsx:10 - Type 'string' is not assignable to type 'boolean'
```

**Solution:**
```tsx
// Check the type definition in types.ts
// Make sure your data matches the interface

// Example fix:
const value: Achievement = {
  isTeam: true,  // Must be boolean, not string "true"
  // ...
}
```

---

### Issue 4: Blank White Page After Deploy
```
Deployed to Vercel but see blank page
```

**Solution:**
1. Check browser console (F12) for errors
2. Check Network tab - network requests failing?
3. Verify `VITE_APPSCRIPT_URL` is set on Vercel
4. Test: Run `npm run preview` locally

---

### Issue 5: Google Apps Script 404 Error
```
Error: 404 - Script not found
```

**Solution:**
1. Verify Apps Script URL is correct
2. Deploy Apps Script: `clasp push`
3. Get new deployment URL from Apps Script Settings
4. Update `VITE_APPSCRIPT_URL` environment variable

---

### Issue 6: CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Add to Google Apps Script `doGet`/`doPost`:
```javascript
function doGet(e) {
  return addAccessControl_(handler(e));
}

function addAccessControl_(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
```

---

### Issue 7: State Not Updating
```
Changed value in form but component doesn't re-render
```

**Solution:**
```tsx
// ❌ Wrong - won't trigger re-render
achievement.name = newName;

// ✅ Correct - creates new object, triggers re-render
setAchievement({ ...achievement, name: newName });
```

---

### Issue 8: HMR Not Working
```
Changes don't appear in browser, need manual refresh
```

**Solution:**
```bash
# Restart dev server
# Ctrl+C
npm run dev

# Or clear cache
rm -rf node_modules/.vite
npm run dev
```

---

## ✏️ How to Extend the System

### Add a New Field to Achievement Form

#### Step 1: Update Type Definition
```typescript
// src/services/types.ts
export interface Achievement {
  id?: string;
  date: string;
  student: string;
  dept: string;
  activity: string;
  // ADD THIS:
  location?: string;  // New field
  competitions: Competition[];
  fileUrl?: string;
  fileName?: string;
}
```

#### Step 2: Update Google Sheets Schema
```
Add new column to "ผลงาน" sheet:
Column M: "Location" (for the new field)
```

#### Step 3: Update Google Apps Script (optional)
```javascript
// apps-scripts/src/Code.gs - if needed
function createRecord(row, data) {
  row.push(data.location || '');  // Add location
}
```

#### Step 4: Update RecordPage Component
```tsx
// src/components/pages/RecordPage.tsx
<input
  type="text"
  placeholder="Location"
  value={formData.location}
  onChange={(e) => setFormData({...formData, location: e.target.value})}
/>
```

#### Step 5: Update API Service (if schema changed)
```typescript
// src/services/api.ts - if custom processing needed
export const api = {
  async save(achievement: Achievement) {
    // Process location if needed
    return fetchWithRetry(...)
  }
}
```

#### Step 6: Test
```bash
npm run dev
# Test adding record with new location field
# Verify it saves to Google Sheets
```

---

### Create a New Component

#### Example: Medal Counter Component

```tsx
// src/components/common/MedalCounter.tsx
interface MedalCounterProps {
  achievements: Achievement[];
}

export function MedalCounter({ achievements }: MedalCounterProps) {
  const medals = {
    gold: achievements.filter(a => a.competitions.some(c => c.result === 'gold')).length,
    silver: achievements.filter(a => a.competitions.some(c => c.result === 'silver')).length,
    bronze: achievements.filter(a => a.competitions.some(c => c.result === 'bronze')).length,
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-yellow-100 p-4 rounded">
        <h3 className="font-bold">Gold</h3>
        <p className="text-3xl">{medals.gold}</p>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-bold">Silver</h3>
        <p className="text-3xl">{medals.silver}</p>
      </div>
      <div className="bg-orange-100 p-4 rounded">
        <h3 className="font-bold">Bronze</h3>
        <p className="text-3xl">{medals.bronze}</p>
      </div>
    </div>
  )
}
```

#### Use It in HomePage
```tsx
// src/components/pages/HomePage.tsx
import { MedalCounter } from '../common/MedalCounter'

export function HomePage() {
  // ... existing code ...
  return (
    <div>
      <MedalCounter achievements={achievements.data} />
      {/* ... rest of page ... */}
    </div>
  )
}
```

---

### Create a New Custom Hook

#### Example: useFilter Hook

```typescript
// src/hooks/useFilter.ts
import { useState } from 'react'
import type { Achievement } from '../services/types'

export function useFilter(achievements: Achievement[]) {
  const [filter, setFilter] = useState({
    dept: '',
    startDate: '',
    endDate: '',
  })

  const filtered = achievements.filter(a => {
    if (filter.dept && a.dept !== filter.dept) return false
    if (filter.startDate && new Date(a.date) < new Date(filter.startDate)) return false
    if (filter.endDate && new Date(a.date) > new Date(filter.endDate)) return false
    return true
  })

  return { filter, setFilter, filtered }
}
```

#### Use in Component
```tsx
import { useFilter } from '../hooks/useFilter'

export function HomePage() {
  const achievements = useAchievements(token)
  const { filter, setFilter, filtered } = useFilter(achievements.data)

  return (
    <div>
      <input
        value={filter.dept}
        onChange={(e) => setFilter({...filter, dept: e.target.value})}
      />
      {filtered.map(a => <AchievementCard key={a.id} {...a} />)}
    </div>
  )
}
```

---

## 📝 Code Style Guidelines

### Naming Conventions
```typescript
// ✅ Components: PascalCase
export function HomePage() {}
export function CompetitionForm() {}

// ✅ Files with components: PascalCase.tsx
HomePage.tsx
CompetitionForm.tsx

// ✅ Hooks: camelCase, starts with "use"
export function useAuth() {}
export function useAchievements() {}

// ✅ Files with hooks: camelCase.ts
useAuth.ts
useAchievements.ts

// ✅ Variables & functions: camelCase
const userEmail = ''
function handleSubmit() {}

// ✅ Constants: UPPER_CASE
const MAX_RETRIES = 3
const TOKEN_KEY = 'ssk_user_token'
```

### Component Structure
```tsx
// Imports first
import React from 'react'
import type { Achievement } from '../services/types'

// Types/Interfaces
interface ComponentProps {
  data: Achievement
  onSave: (data: Achievement) => Promise<void>
}

// Component function
export function MyComponent({ data, onSave }: ComponentProps) {
  // Hooks first
  const [loading, setLoading] = React.useState(false)
  
  // Effects
  React.useEffect(() => {
    // ...
  }, [])
  
  // Handlers
  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave(data)
    } catch (error) {
      // ...
    } finally {
      setLoading(false)
    }
  }
  
  // Render
  return (
    <form onSubmit={handleSave}>
      {/* JSX */}
    </form>
  )
}
```

### TypeScript Best Practices
```typescript
// ✅ Use interfaces for component props
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

// ✅ Import types
import type { Achievement } from '../services/types'

// ✅ Use union types
type PageType = 'home' | 'login' | 'record' | 'manage'

// ✅ Use explicit return types
function getMessage(): string {
  return 'Hello'
}

// ✅ Avoid 'any'
// ❌ const data: any = response.json()
// ✅ const data: Achievement = await response.json()
```

---

## 🔗 Git Workflow

### Branch Strategy
```bash
# Main branch for production
main

# Development branch
develop

# Feature branches
feature/add-export
feature/fix-login
feature/improve-performance

# Naming: feature/{description}
```

### Commit Message Format
```
# Type: feat|fix|docs|style|refactor|test|chore

feat: Add export to CSV functionality
fix: Resolve login timeout issue
docs: Update deployment guide
chore: Update dependencies
```

### Pull Request Workflow
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, commit
git commit -m "feat: Add new feature"

# Push to GitHub
git push origin feature/my-feature

# Create PR on GitHub
# - Set base branch to "develop"
# - Add description
# - Request review

# After approval, merge to develop
# Test on develop branch
# Then merge develop to main for production
```

---

## 📚 Resources & Documentation

### Local Documentation
- `FINAL_SUMMARY.md` - Project overview
- `ARCHITECTURE.md` - System design & APIs
- `DEPLOYMENT.md` - Deployment guide
- `REACT_FRONTEND_README.md` - React setup
- `READY_FOR_DEPLOYMENT.md` - Pre-deploy checklist

### Online Resources
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Google Apps Script](https://developers.google.com/apps-script)

### Tools
- **IDE:** VS Code with TypeScript/React extensions
- **Browser:** Chrome/Firefox DevTools
- **Git:** GitHub Desktop or CLI
- **Terminal:** bash/zsh

---

## ✅ Next Steps

1. **Read `ARCHITECTURE.md`** to understand the backend
2. **Clone repository** and run `npm install`
3. **Start dev server** with `npm run dev`
4. **Make a small change** and verify HMR works
5. **Extend a component** following examples above
6. **Test production build** with `npm run build && npm run preview`
7. **Deploy** with `npm run deploy:vercel`

---

## 🤝 Team Communication

### Questions?
- Check this guide first (Common Issues section)
- Check `ARCHITECTURE.md` for backend questions
- Check `DEPLOYMENT.md` for deployment questions
- Ask in team chat with error message + code snippet

### Found a Bug?
1. Create GitHub issue with:
   - Title: "Bug: Description"
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, Node version, etc.)

2. If critical:
   - Create branch: `fix/issue-description`
   - Fix + test locally
   - Create PR with fix

### Feature Requests?
1. Discuss in team chat
2. Create GitHub discussion with:
   - Use case
   - Proposed solution
   - Estimated effort
3. Add to roadmap if approved

---

**Happy Coding! 🚀**

For more details, see:
- Backend: `ARCHITECTURE.md`
- Deployment: `DEPLOYMENT.md`
- Project Status: `FINAL_SUMMARY.md`

Version 1.0.0 | May 13, 2026
