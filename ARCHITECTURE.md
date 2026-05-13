# SSK Student Portfolio - Technical Architecture

**Last Updated:** May 13, 2026  
**System Version:** 1.0.0  
**Status:** Production-Ready (Vercel + Google Apps Script + Google Sheets)

---

## Executive Summary

The SSK Student Portfolio is a web-based achievement management system for Satri Sirikesat School. It enables teachers and administrators to record, manage, and showcase student achievements from competitions and events. The system uses a serverless architecture combining:
- **Frontend**: Vercel-hosted static site (Vite + Tailwind CSS)
- **Backend**: Google Apps Script web app (serverless functions)
- **Database**: Google Sheets (ผลงาน sheet)
- **Storage**: Google Drive (file attachments)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Frontend)                  │
│                      Vercel Hosted                          │
│  - index.html (Canva-generated template)                    │
│  - JavaScript (vanilla, no framework)                       │
│  - Tailwind CSS + Lucide Icons                              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS Requests
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  API LAYER (Backend)                         │
│            Google Apps Script Web App                       │
│  - GET  /exec?action=getRecords                             │
│  - POST /exec?action=saveRecord                             │
│  - POST /exec?action=uploadFile                             │
│  - POST /exec?action=updateRecord                           │
│  - POST /exec?action=deleteRecord                           │
└────────────────────────┬────────────────────────────────────┘
                         │ Google API
                         ↓
┌──────────────────────┬──────────────────────┐
│  Google Sheets       │   Google Drive       │
│  (Data Storage)      │   (File Storage)     │
│                      │                      │
│ Sheet: ผลงาน         │  Folder ID:          │
│ SHEET_ID:            │  1kIk_4pcz9...      │
│ 1csUBR9Q...          │                      │
└──────────────────────┴──────────────────────┘
```

---

## 2. Backend APIs (Google Apps Script)

### Base URL
```
https://script.google.com/macros/s/AKfycbzUMl8DqVfVkjsUVJQ_YG3yqQdHynpkzZwSfhtk8eL3x1G2-LZfr_w4ukZSXzxGTzAq/exec
```

### 2.1 GET `/exec?action=getRecords`
**Purpose**: Retrieve all achievement records from the database

**Request**:
```
GET /exec?action=getRecords
```

**Response** (Success):
```json
{
  "success": true,
  "data": [
    {
      "rowIndex": 2,
      "timestamp": "2025-05-13T10:30:00",
      "recordedBy": "teacher@ssk.ac.th",
      "recordedDept": "วิทยาศาสตร์และเทคโนโลยี",
      "year": "2568",
      "level": "ชาติ",
      "project": "Smart Garden IoT Project",
      "org": "สถาบันพัฒนาวิทยาศาสตร์และเทคโนโลยี",
      "place": "กรุงเทพมหานคร",
      "date": "2025-04-15",
      "competitions": [
        {
          "name": "IoT Innovation Challenge",
          "type": "คู่/ทีม",
          "teamName": "Tech Innovators",
          "teamMembers": ["นางสาว ชลธิชา ศรีสกุล", "เด็กหญิง นัฎฐา ดำเนิน"],
          "medal": "ทอง",
          "award": "ชนะเลิศ",
          "coaches": ["ดร. สมศักดิ์ เล่นศิลป์", "อ.วิมล สุขสงคราม"]
        }
      ],
      "fileUrls": [
        "https://drive.google.com/file/d/1-9xKpZ3aB...z/view?usp=sharing",
        "https://drive.google.com/file/d/1-7qL2mJ8xB...w/view?usp=sharing"
      ]
    },
    // ... more records
  ]
}
```

**Response** (Error):
```json
{
  "success": false,
  "message": "Error message describing the failure"
}
```

---

### 2.2 POST `/exec?action=saveRecord`
**Purpose**: Create a new achievement record

**Request**:
```
POST /exec?action=saveRecord
Content-Type: application/x-www-form-urlencoded

data=JSON.stringify({
  "timestamp": "2025-05-13T10:30:00Z",
  "recordedBy": "teacher@ssk.ac.th",
  "recordedDept": "วิทยาศาสตร์และเทคโนโลยี",
  "year": "2568",
  "level": "ชาติ",
  "project": "Project Name",
  "org": "Organization Name",
  "place": "Location",
  "date": "2025-04-15",
  "competitions": [
    {
      "name": "Competition Name",
      "type": "เดี่ยว" | "คู่/ทีม",
      "teamName": "Optional team name",
      "teamMembers": ["Member 1", "Member 2"],
      "medal": "ทอง" | "เงิน" | "ทองแดง" | "อื่น" | "ไม่ระบุ",
      "medalOther": "Custom medal (if medal=อื่น)",
      "award": "ชนะเลิศ" | "รองชนะเลิศอันดับ1" | "รองชนะเลิศอันดับ2" | "ชมเชย" | "เข้าร่วม" | "อื่นๆ",
      "awardOther": "Custom award (if award=อื่นๆ)",
      "coaches": ["Coach 1", "Coach 2"]
    }
  ],
  "fileUrls": [
    "https://drive.google.com/file/d/...",
    "https://drive.google.com/file/d/..."
  ]
})
```

**Response**:
```json
{
  "success": true
}
```

---

### 2.3 POST `/exec?action=updateRecord`
**Purpose**: Update an existing achievement record

**Request**:
```
POST /exec?action=updateRecord
Content-Type: application/x-www-form-urlencoded

rowIndex=2&data=JSON.stringify({...same structure as saveRecord...})
```

**Parameters**:
- `rowIndex` (integer, 2+): Row number in the sheet (1-based, header is row 1)
- `data` (JSON string): Complete record data

**Response**:
```json
{
  "success": true
}
```

---

### 2.4 POST `/exec?action=deleteRecord`
**Purpose**: Delete an achievement record and associated files

**Request**:
```
POST /exec?action=deleteRecord
Content-Type: application/x-www-form-urlencoded

rowIndex=2&fileUrls=JSON.stringify([
  "https://drive.google.com/file/d/1-9xKpZ3aB.../view?usp=sharing",
  "https://drive.google.com/file/d/1-7qL2mJ8xB.../view?usp=sharing"
])
```

**Parameters**:
- `rowIndex` (integer, 2+): Row number to delete
- `fileUrls` (JSON string): Array of Google Drive URLs to trash

**Response**:
```json
{
  "success": true
}
```

**Side Effects**:
- Deletes row from Google Sheet
- Moves all files to Google Drive trash

---

### 2.5 POST `/exec?action=uploadFile`
**Purpose**: Upload a file to Google Drive

**Request**:
```
POST /exec?action=uploadFile
Content-Type: application/x-www-form-urlencoded

fileName=document.pdf&mimeType=application/pdf&base64Data=JVBERi0xLjQ...
```

**Parameters**:
- `fileName` (string): Name of the file with extension
- `mimeType` (string): MIME type (application/pdf, image/png, image/jpeg, etc.)
- `base64Data` (string): Base64-encoded file content

**Response** (Success):
```json
{
  "success": true,
  "fileUrl": "https://drive.google.com/file/d/1-9xKpZ3aB...z/view?usp=sharing",
  "fileId": "1-9xKpZ3aB..."
}
```

---

## 3. Frontend Architecture

### 3.1 Page Structure (Single-Page Application)

The frontend has 4 main pages managed via `showPage()` function:

#### **HOME Page** (`id="page-home"`)
- **Purpose**: Public view of achievements
- **Features**:
  - Achievement grid (card layout)
  - Search bar (`#search-input`)
  - Filter by level (`#filter-level`)
  - Login button
- **State**: `achievements` array (loaded from backend)
- **Functions**: `renderHomeGrid()`, `filterAchievements()`

#### **LOGIN Page** (`id="page-login"`)
- **Purpose**: Authentication
- **Auth Method**: Local/hardcoded credentials (no backend auth)
- **Credentials**:
  - Admin: `dept=Admin`, `password=adminssk`
  - Teachers: `email=*@ssk.ac.th`, `password=sskssk`
- **Departments** (selectable):
  - Curriculum areas (8 options)
  - Administrative groups (4 options)
  - Custom text option ("อื่นๆ")
- **State After Login**: `currentUser = { dept, email, isAdmin }`
- **Functions**: `handleLogin()`, `toggleEmailField()`

#### **RECORD Page** (`id="page-record"`)
- **Purpose**: Create/edit achievement records
- **Sections**:
  1. General Info (year, level, project name, org, place, date)
  2. Competitions (dynamic list, each with):
     - Competition name
     - Type: Single (เดี่ยว) or Team (คู่/ทีม)
     - Students/teams with medal and award selections
     - Coaches list
  3. File upload (max 5 files: PNG, JPG, PDF)
- **State**: `editingIndex` (null for new, row index for edit)
- **Functions**: `handleSaveRecord()`, `addCompetitionItem()`, `validateFiles()`

#### **MANAGE Page** (`id="page-manage"`)
- **Purpose**: List and manage user's own records
- **Features**:
  - List of records posted by current user
  - Edit/Delete buttons per record
  - "New Record" button
  - "View Home" button
  - Logout button
- **Functions**: `renderManageList()`, `handleLogout()`

### 3.2 Modal Components

#### **Detail Modal** (`#detail-modal`)
- **Purpose**: View full record details
- **Content**: All fields displayed read-only
- **Function**: `showDetailModal(index)`, `closeDetailModal()`

#### **Delete Confirm Modal** (`#delete-modal`)
- **Purpose**: Confirm deletion before sending to backend
- **Function**: `openDeleteModal(index)`, `confirmDelete()`, `closeDeleteModal()`

### 3.3 Key Global State

```javascript
let currentUser = null;           // { dept, email, isAdmin }
let achievements = [];             // All records from backend
let editingIndex = null;          // Index of record being edited
let deleteIndex = null;           // Index of record to delete
let competitionCounter = 0;       // Counter for dynamic competition items
let studentCounters = {};         // Counter for team members per competition
```

### 3.4 Key Frontend Functions

| Function | Purpose |
|----------|---------|
| `showPage(page)` | Navigate to page, trigger renders |
| `handleLogin(e)` | Authenticate user (local validation) |
| `loadAchievementsFromSheet()` | Fetch records from backend via `getRecords` |
| `handleSaveRecord(e)` | Create or update record; upload files |
| `renderHomeGrid()` | Display public achievement cards |
| `renderManageList()` | Display user's records with edit/delete buttons |
| `filterAchievements()` | Filter by search term and level |
| `addCompetitionItem()` | Add dynamic competition entry to form |
| `toggleCompType(select, idx)` | Switch between single/team mode |
| `addStudentEntry(compIdx)` | Add student or team to competition |
| `validateFiles(input)` | Check file count and type |
| `showToast(msg, type)` | Display notification |

---

## 4. Data Schema

### 4.1 Achievement Record Structure

```typescript
{
  // Metadata
  rowIndex: number;                  // Spreadsheet row (for updates/deletes)
  timestamp: string;                 // ISO 8601 creation time
  
  // User Information
  recordedBy: string;                // Email of recorder
  recordedDept: string;              // Department name
  
  // Achievement Details
  year: string;                      // Academic year (e.g., "2568")
  level: string;                     // "นานาชาติ" | "ชาติ" | "ภาค(เทียบเท่าชาติ)" | "ภาค" | "จังหวัด" | "เขตพื้นที่การศึกษา"
  project: string;                   // Project/event name
  org: string;                       // Organizing organization
  place: string;                     // Venue
  date: string;                      // Event date (YYYY-MM-DD)
  
  // Competition Details (Array)
  competitions: [{
    name: string;                    // Competition name
    type: "เดี่ยว" | "คู่/ทีม";      // Single or team
    teamName?: string;               // Optional team name
    teamMembers: string[];           // Array of participant names
    medal: string;                   // Medal level
    medalOther?: string;             // Custom medal if medal="อื่น"
    award: string;                   // Award type
    awardOther?: string;             // Custom award if award="อื่นๆ"
    coaches: string[];               // Array of coach names
  }];
  
  // Files
  fileUrls: string[];                // Array of Google Drive share links
}
```

### 4.2 Google Sheet Schema (ผลงาน sheet)

| Column | Header | Type | Notes |
|--------|--------|------|-------|
| A | timestamp | string | ISO 8601 |
| B | recordedBy | string | Email address |
| C | recordedDept | string | Department |
| D | year | string | Academic year |
| E | level | string | Achievement level |
| F | project | string | Project name |
| G | org | string | Organization |
| H | place | string | Venue |
| I | date | string | Date (YYYY-MM-DD) |
| J | competitions | JSON string | Array of competition objects |
| K | fileUrls | JSON string | Array of Google Drive URLs |

**Example Row**:
```
timestamp | recordedBy | recordedDept | year | level | project | org | place | date | competitions | fileUrls
2025-05-13T10:30:00 | teacher@ssk.ac.th | วิทยาศาสตร์ | 2568 | ชาติ | Smart Garden | สถาบัน | Bangkok | 2025-04-15 | [{"name":"IoT Challenge",...}] | ["https://drive.google.com/file/d/1-9xK..."]
```

---

## 5. Authentication & Authorization

### 5.1 Authentication Method
- **Type**: Local hardcoded credentials (no backend validation)
- **Flow**:
  1. User selects department from dropdown
  2. For Admin: verify password only
  3. For others: verify email domain + password
  4. Store `currentUser` in browser memory
  5. Redirect to Manage page

### 5.2 Credentials
```javascript
// Admin
dept: "Admin"
password: "adminssk"

// Regular Users
email: "*@ssk.ac.th"  (any)
password: "sskssk"
```

### 5.3 Authorization Rules
- **Admin users**: Can see all records in manage page
- **Regular users**: Can only see their own records
- **Public access**: Can only view home page with basic filters

---

## 6. Deployment Architecture

### 6.1 Deployment Platforms

| Component | Platform | Technology |
|-----------|----------|-----------|
| Frontend | Vercel | Node.js Static Site |
| Backend | Google Apps Script | JavaScript (Apps Script runtime) |
| Database | Google Sheets | Spreadsheet (manual) |
| File Storage | Google Drive | Cloud Storage |

### 6.2 Frontend Deployment (Vercel)

**Build Settings**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Node Version: Default (18.x+)

**Environment Variables**:
```env
VITE_APPSCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
VITE_SHEET_ID=1csUBR9QdvqHEYTiIospBAb5KjuRupIOBJZkBTphCz0U
```

**Live URL**: [Deploy from GitHub repository]

### 6.3 Backend Deployment (Google Apps Script)

**Steps**:
1. Install `clasp` CLI
2. Authenticate: `clasp login`
3. Deploy: `clasp push` (update script code)
4. Deploy as web app: `clasp deploy --description 'Deploy message'`
5. Copy deployment URL to Vercel environment variable

**Current Deployment ID**:
```
AKfycbzUMl8DqVfVkjsUVJQ_YG3yqQdHynpkzZwSfhtk8eL3x1G2-LZfr_w4ukZSXzxGTzAq
```

**Google Resources**:
- Sheet ID: `1csUBR9QdvqHEYTiIospBAb5KjuRupIOBJZkBTphCz0U`
- Drive Folder ID: `1kIk_4pcz9DiuoA82K8Fnr8Conq3Y1Dnk`

### 6.4 Deployment Checklist

- [ ] Update `SHEET_ID` in `apps-scripts/src/Code.gs`
- [ ] Update `FOLDER_ID` in `apps-scripts/src/Code.gs`
- [ ] Run `clasp login` and authenticate
- [ ] Run `clasp push` to update script
- [ ] Run `clasp deploy` to create web app
- [ ] Copy deployment URL
- [ ] Set `VITE_APPSCRIPT_URL` in Vercel dashboard
- [ ] Trigger Vercel deployment
- [ ] Test login and record creation

---

## 7. User Flows

### 7.1 Public User Flow (Viewing Achievements)

```
HOME Page
  ↓ [Search/Filter]
  ↓ 
View Achievement Cards (Read-Only)
  ↓ [Click Card]
  ↓
Detail Modal (View Full Details + File Downloads)
  ↓ [Close Modal]
  ↓
[Optionally Login]
  ↓
LOGIN Page
```

### 7.2 Teacher/Department User Flow (Recording Achievement)

```
HOME Page
  ↓ [Click Login]
  ↓
LOGIN Page → [Enter dept, email, password]
  ↓ [Login Success]
  ↓
MANAGE Page (View Own Records)
  ↓ [Click "New Record"]
  ↓
RECORD Page
  ├─ Fill General Info (year, level, project, etc.)
  ├─ Add Competitions (name, type, students, medal, award, coaches)
  ├─ Upload Files (up to 5)
  ├─ [Click Submit]
  ├─ [System uploads files to Drive]
  ├─ [System saves record to Sheet]
  ↓
MANAGE Page (Record Listed)
  ├─ [Click Edit] → Back to RECORD Page (prefilled)
  ├─ [Click Delete] → Confirm Modal → Delete
  ├─ [Click View] → Detail Modal
  ↓
[Optional: Click Logout]
  ↓
HOME Page
```

### 7.3 Admin User Flow

Same as Teacher, but can see all department records in MANAGE page instead of just their own.

---

## 8. Build & Development Setup

### 8.1 Prerequisites
- Node.js 16+
- npm or yarn
- Google Account with Drive access
- `clasp` CLI (for Apps Script deployment)
- Vercel account (for frontend hosting)

### 8.2 Local Development

**Frontend**:
```bash
cd /workspaces/SSK-student-portfolio
npm install
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build locally
```

**Backend** (Google Apps Script):
```bash
cd /workspaces/SSK-student-portfolio/apps-scripts
clasp login
clasp open         # Opens Apps Script editor in browser
# Edit Code.gs directly in browser or:
clasp push         # Push local changes
clasp deploy       # Create new deployment version
```

### 8.3 Project Dependencies

**Frontend**:
- `vite` (5.0.0+) - Build tool
- `terser` (5.47.1+) - Minification
- No frontend framework (vanilla JS + HTML/CSS)
- Tailwind CSS (via CDN in index.html)
- Lucide Icons (via CDN)

**Backend**:
- Google Apps Script (no dependencies)

---

## 9. Key Features Summary

### 9.1 Student Achievement Recording
✓ Multi-field form capturing:
  - Academic year and competition level
  - Project/event details (org, place, date)
  - Flexible competition items (single or team)
  - Medal and award selections
  - Coach information
  - File attachments (up to 5)

### 9.2 Achievement Display & Search
✓ Public-facing home page with:
  - Achievement card grid
  - Full-text search
  - Filter by competition level
  - Detailed view modal with file downloads

### 9.3 Data Management
✓ CRUD operations:
  - Create records (with file uploads)
  - Read/retrieve all records
  - Update existing records
  - Delete records (with file cleanup)

### 9.4 Multi-Role Support
✓ Two user types:
  - Teachers/Department staff (can record and manage their own)
  - Admin (can see all records)

### 9.5 File Management
✓ Google Drive integration:
  - Upload files with records
  - Share files publicly (view-only links)
  - Auto-cleanup when records deleted

---

## 10. Technical Constraints & Considerations

### 10.1 Constraints
1. **Frontend Auth**: Hardcoded credentials (not production-secure)
2. **No User Management Backend**: Credentials stored in frontend code
3. **Google Drive Quota**: Limited by free tier (15GB)
4. **Sheet Limit**: Max ~1M rows (practical limit ~100k with good performance)
5. **File Upload Size**: Limited by Apps Script timeout (~6 minutes)
6. **Concurrent Users**: Apps Script quotas may affect simultaneous uploads

### 10.2 Security Notes
- **Authentication**: Currently using hardcoded credentials (should upgrade to OAuth2 or similar for production)
- **Authorization**: Minimal server-side validation (should add role-based backend checks)
- **File Access**: Files are publicly accessible via Google Drive links
- **Data Privacy**: All data stored in Google Drive/Sheets (subject to Google's T&C)

### 10.3 Performance Considerations
1. **Initial Load**: All records fetched on each login (N+1 queries pattern)
2. **Large Datasets**: Grid rendering could be slow with 1000+ records
3. **File Uploads**: Sequential (could be parallelized)
4. **Spreadsheet Queries**: Linear scan of all rows

### 10.4 Future Optimization Opportunities
- [ ] Implement pagination/lazy loading for achievements
- [ ] Add server-side filtering/search
- [ ] Implement caching (localStorage for achievements)
- [ ] Upgrade to Firebase/Supabase for better scalability
- [ ] Add OAuth2 authentication
- [ ] Implement role-based access control (RBAC) on backend
- [ ] Add image optimization and compression
- [ ] Implement partial updates instead of full record rewrites

---

## 11. File Structure & Locations

```
/workspaces/SSK-student-portfolio/
├── index.html                    # Frontend entry point
├── vite.config.js               # Vite build config
├── package.json                 # Frontend dependencies
├── vercel.json                  # Vercel deployment config
├── DEPLOYMENT.md                # Deployment instructions
├── ARCHITECTURE.md              # This file
├── README.md                    # Project overview
│
├── apps-scripts/
│   └── src/
│       ├── Code.gs              # Main Apps Script backend
│       └── Code.gs.bak1         # Backup of backend
│
├── docs/
│   ├── appscript.md             # Backend documentation
│   ├── canva-site.md            # Frontend HTML code
│   ├── backend.md               # Backend notes
│   ├── frontend.md              # Frontend notes
│   ├── user-req.md              # User requirements
│   └── copilot-help.md          # Development notes
│
├── frontend/
│   ├── app.js                   # Alternate frontend entry
│   └── auth.js                  # Alternate auth module
│
├── src/
│   ├── main.js                  # Alternate main script
│   └── styles.css               # Alternate styles
│
└── archive/
    └── bolt-generated/          # Old Bolt.new implementations
```

---

## 12. API Integration Endpoints Summary

| Endpoint | Method | Purpose | Parameters | Returns |
|----------|--------|---------|-----------|---------|
| `/exec?action=getRecords` | GET | Fetch all records | None | `{ success, data: [] }` |
| `/exec?action=saveRecord` | POST | Create record | `data` (JSON) | `{ success }` |
| `/exec?action=updateRecord` | POST | Update record | `rowIndex`, `data` | `{ success }` |
| `/exec?action=deleteRecord` | POST | Delete record | `rowIndex`, `fileUrls` | `{ success }` |
| `/exec?action=uploadFile` | POST | Upload file | `fileName`, `mimeType`, `base64Data` | `{ success, fileUrl, fileId }` |

---

## 13. Configuration Reference

### 13.1 Apps Script Configuration
```javascript
const SHEET_ID = '1csUBR9QdvqHEYTiIospBAb5KjuRupIOBJZkBTphCz0U';
const FOLDER_ID = '1kIk_4pcz9DiuoA82K8Fnr8Conq3Y1Dnk';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUMl8DqVfVkjsUVJQ_YG3yqQdHynpkzZwSfhtk8eL3x1G2-LZfr_w4ukZSXzxGTzAq/exec';
```

### 13.2 Frontend Configuration
```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUMl8DqVfVkjsUVJQ_YG3yqQdHynpkzZwSfhtk8eL3x1G2-LZfr_w4ukZSXzxGTzAq/exec';
const MAX_FILES = 5;
const ALLOWED_FILE_TYPES = ['png', 'jpg', 'jpeg', 'pdf'];
const SHEET_NAME = 'ผลงาน';
```

### 13.3 Deployment Configuration (Vercel)
```yaml
name: ssk-student-portfolio
buildCommand: npm run build
outputDirectory: dist
environmentVariables:
  VITE_APPSCRIPT_URL: https://script.google.com/macros/s/.../exec
  VITE_SHEET_ID: 1csUBR9QdvqHEYTiIospBAb5KjuRupIOBJZkBTphCz0U
```

---

## 14. Troubleshooting Guide

### Issue: "Invalid action" response from Apps Script
**Cause**: Incorrect action parameter or URL
**Solution**: 
- Verify `APPS_SCRIPT_URL` is correct in frontend
- Check action names match exactly: `getRecords`, `saveRecord`, `uploadFile`, `updateRecord`, `deleteRecord`

### Issue: Files not uploading
**Cause**: Base64 encoding failure or Drive folder inaccessible
**Solution**:
- Check file size < 25MB
- Verify `FOLDER_ID` has correct permissions
- Check Google Drive quota

### Issue: 403 Permission Error
**Cause**: Apps Script doesn't have permission to access Sheet/Drive
**Solution**:
- Re-deploy Apps Script: `clasp deploy`
- Grant access when prompted

### Issue: Records not appearing after save
**Cause**: JSON parsing error in sheet columns
**Solution**:
- Check `competitions` and `fileUrls` are valid JSON strings
- Use `safeParseJSON()` function for error handling

---

## 15. Contact & Support

- **School**: Satri Sirikesat School (สตรีสิริเกศ)
- **System Admin**: [To be configured]
- **Tech Support**: [To be configured]

---

**Document Status**: ✅ Complete  
**Last Review**: May 13, 2026  
**Version**: 1.0
