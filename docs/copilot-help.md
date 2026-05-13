### Repository overview

---

### Recommended repo structure
```
ssk-student-portfolio
├─ frontend/
│  ├─ index.html
│  ├─ auth.js
│  ├─ app.js
│  └─ style.css
├─ apps-script/
│  ├─ src/
│  │  └─ Code.gs
│  └─ deploy.sh
├─ README.md
└─ .env.example
```

---

### Key files and ready‑to‑use code
#### **frontend/index.html**
```html
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Student Portfolio</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <div id="app">
    <header><h1>Student Portfolio</h1></header>

    <section id="authSection">
      <div id="loginBox">
        <input id="email" placeholder="Email" />
        <input id="password" type="password" placeholder="Password" />
        <button id="loginBtn">Login</button>
      </div>
      <div id="userBox" style="display:none;">
        <span id="userEmail"></span>
        <button id="logoutBtn">Logout</button>
      </div>
    </section>

    <section id="uploadSection" style="display:none;">
      <h2>Upload Work</h2>
      <input type="file" id="fileInput" />
      <input id="notes" placeholder="Notes (optional)" />
      <button id="submitBtn">Submit</button>
    </section>

    <section id="worksSection" style="display:none;">
      <h2>Works</h2>
      <div id="worksTable"></div>
      <div id="pagination"></div>
    </section>
  </div>

  <script src="/auth.js"></script>
  <script src="/app.js"></script>
</body>
</html>
```

#### **frontend/auth.js** — (localStorage + token flow)
```javascript
// auth.js
const APP_TOKEN_KEY = "ssk_user_token";
const APP_USER_KEY = "ssk_user_email";
const APPSCRIPT_URL = "https://script.google.com/macros/s/AK.../exec"; // replace

export function saveSession(token, email) {
  localStorage.setItem(APP_TOKEN_KEY, token);
  localStorage.setItem(APP_USER_KEY, email);
}

export function clearSession() {
  localStorage.removeItem(APP_TOKEN_KEY);
  localStorage.removeItem(APP_USER_KEY);
}

export function getSession() {
  return {
    token: localStorage.getItem(APP_TOKEN_KEY),
    email: localStorage.getItem(APP_USER_KEY)
  };
}

export async function validateToken(token) {
  if (!token) return false;
  try {
    const resp = await fetch(`${APPSCRIPT_URL}?action=validateToken&token=${encodeURIComponent(token)}`);
    const text = await resp.text();
    return text === "valid";
  } catch (e) {
    console.error("validateToken error", e);
    return false;
  }
}
```

#### **frontend/app.js** — (login, upload, auto login, pagination)
```javascript
// app.js
import { saveSession, clearSession, getSession, validateToken } from './auth.js';

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const submitBtn = document.getElementById("submitBtn");

async function init() {
  const session = getSession();
  if (session.token && await validateToken(session.token)) {
    showLoggedIn(session.email);
    loadWorks(1);
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById("loginBox").style.display = "";
  document.getElementById("userBox").style.display = "none";
  document.getElementById("uploadSection").style.display = "none";
  document.getElementById("worksSection").style.display = "none";
}

function showLoggedIn(email) {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("userBox").style.display = "";
  document.getElementById("userEmail").textContent = email;
  document.getElementById("uploadSection").style.display = "";
  document.getElementById("worksSection").style.display = "";
}

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  // Simple demo auth: send to Apps Script to verify
  const resp = await fetch("https://script.google.com/macros/s/AK.../exec?action=login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const j = await resp.json();
  if (j.status === "ok") {
    saveSession(j.token, email);
    showLoggedIn(email);
    loadWorks(1);
  } else {
    alert("Login failed");
  }
});

logoutBtn.addEventListener("click", () => {
  clearSession();
  showLogin();
});

submitBtn.addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) return alert("Choose a file");
  const file = fileInput.files[0];
  const notes = document.getElementById("notes").value || "";
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result.split(",")[1];
    const session = getSession();
    const payload = {
      action: "upload",
      token: session.token,
      filename: file.name,
      mimeType: file.type,
      data: base64,
      notes
    };
    const resp = await fetch("https://script.google.com/macros/s/AK.../exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const j = await resp.json();
    if (j.status === "ok") {
      alert("Uploaded");
      loadWorks(1);
    } else {
      alert("Upload failed: " + (j.message || ""));
    }
  };
  reader.readAsDataURL(file);
});

// Simple table + pagination
async function loadWorks(page = 1, pageSize = 5) {
  const session = getSession();
  const resp = await fetch(`https://script.google.com/macros/s/AK.../exec?action=list&token=${encodeURIComponent(session.token)}&page=${page}&pageSize=${pageSize}`);
  const j = await resp.json();
  renderTable(j.items || []);
  renderPagination(j.total || 0, page, pageSize);
}

function renderTable(items) {
  const container = document.getElementById("worksTable");
  if (!items.length) {
    container.innerHTML = "<p>No works yet</p>";
    return;
  }
  const rows = items.map(it => `<div class="row"><a href="${it.url}" target="_blank">${it.filename}</a> — ${it.notes || ""}</div>`).join("");
  container.innerHTML = rows;
}

function renderPagination(total, page, pageSize) {
  const pages = Math.ceil(total / pageSize);
  const container = document.getElementById("pagination");
  container.innerHTML = "";
  for (let p = 1; p <= pages; p++) {
    const btn = document.createElement("button");
    btn.textContent = p;
    if (p === page) btn.disabled = true;
    btn.addEventListener("click", () => loadWorks(p, pageSize));
    container.appendChild(btn);
  }
}

window.addEventListener("load", init);
```

#### **apps-script/src/Code.gs** — (simple token check, upload, list)
```javascript
// Code.gs
const VALID_TOKENS = { "demo-token-123": "teacher@example.com" }; // replace with real store

function doGet(e) {
  const action = e.parameter.action;
  if (action === "validateToken") {
    const token = e.parameter.token;
    return ContentService.createTextOutput(VALID_TOKENS[token] ? "valid" : "invalid");
  }
  if (action === "list") {
    const token = e.parameter.token;
    if (!VALID_TOKENS[token]) return ContentService.createTextOutput(JSON.stringify({ items: [], total: 0 })).setMimeType(ContentService.MimeType.JSON);
    const sheetId = "YOUR_SHEET_ID"; // set destination sheet id
    const ss = SpreadsheetApp.openById(sheetId);
    const rows = ss.getSheets()[0].getDataRange().getValues().slice(1); // skip header
    const page = parseInt(e.parameter.page || "1", 10);
    const pageSize = parseInt(e.parameter.pageSize || "5", 10);
    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize).map(r => ({ filename: r[1], mimeType: r[2], url: r[3], notes: r[4] }));
    return ContentService.createTextOutput(JSON.stringify({ items, total })).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("ok");
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.action === "login") {
      // demo: accept any password for existing email; in real: check against DB
      const token = "demo-token-123";
      return ContentService.createTextOutput(JSON.stringify({ status: "ok", token })).setMimeType(ContentService.MimeType.JSON);
    }
    if (payload.action === "upload") {
      const token = payload.token;
      if (!VALID_TOKENS[token]) return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "invalid token" })).setMimeType(ContentService.MimeType.JSON);
      const blob = Utilities.newBlob(Utilities.base64Decode(payload.data), payload.mimeType, payload.filename);
      const file = DriveApp.createFile(blob);
      const sheetId = "YOUR_SHEET_ID";
      const ss = SpreadsheetApp.openById(sheetId);
      ss.getSheets()[0].appendRow([new Date(), payload.filename, payload.mimeType, file.getUrl(), payload.notes || ""]);
      return ContentService.createTextOutput(JSON.stringify({ status: "ok", url: file.getUrl() })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "unknown action" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### **apps-script/deploy.sh** (simple clasp flow)
```bash
#!/usr/bin/env bash
# deploy.sh - use clasp locally (teacher can run)
# requires: npm i -g @google/clasp and clasp login
clasp push
clasp deploy --description "Simple deploy"
```

#### **.env.example**
```
# Put local dev values here (do NOT commit real tokens)
APPSCRIPT_URL=https://script.google.com/macros/s/AK.../exec
SHEET_ID=your_google_sheet_id
```

#### **README.md** (สรุปสั้น)
```markdown
# SSK Student Portfolio

Simple student portfolio for teachers:
- Frontend: static site (Canva embed or Vercel)
- Backend: Google Apps Script (store files to Drive, metadata to Sheet)

## Quick start
1. Update `apps-script/src/Code.gs` with your `SHEET_ID` and valid token map.
2. Deploy Apps Script (use clasp or Apps Script editor).
3. Update `frontend/auth.js` APPSCRIPT_URL to your deployed URL.
4. Serve `frontend/` on Vercel or static host.

## Features
- Login (demo token)
- Upload file (Base64) → saved to Drive
- List works with pagination
- Session persisted in localStorage

## Checklist
- [ ] Replace demo token with real auth
- [ ] Secure Apps Script endpoints
- [ ] Test on Canva embed and Vercel
```

---

### Prompts for GitHub Copilot (Claude Hiku and Sonnet)
ใช้ prompt เหล่านี้ให้ Copilot อ่าน `README.md` แล้ว **generate/patch** โค้ดให้ระบบขึ้นจริงบน Canva frontend และ Vercel

**Prompt A (English, for Claude Hiku)**  
```
You are GitHub Copilot using Claude Hiku. Read the repository README.md and the frontend and apps-script files. Make the project deployable on Vercel and functional with Canva frontend embed. Tasks:
1. Replace demo token flow with a simple token generation endpoint in Apps Script (POST /action=login returns token tied to email).
2. Add token expiry (24h) stored in ScriptProperties or Sheet.
3. Ensure validateToken checks expiry.
4. Update frontend/auth.js to call the new endpoints and persist token in localStorage.
5. Add CORS-safe fetch patterns for Canva embed.
6. Create a minimal vercel.json or static config for Vercel deployment.
7. Add comments and small unit tests for client functions.
Output: a patch or new files ready to commit. Show only changed/added files and explain where to set secrets (SHEET_ID).
```

**Prompt B (English, for Sonnet)**  
```
You are GitHub Copilot using Sonnet. Read README.md and project files. Improve UX and reliability:
- Refactor login flow into auth.js with clear functions: login(email,password), logout(), autoLogin(), validateToken().
- Add friendly error handling and retry for network failures.
- Generate a small pagination helper for app.js and make table rendering accessible.
- Produce a Vercel-friendly index.html (base href) and a deployment checklist.
Return: code diffs and a short runbook for teacher to deploy on Vercel and connect Apps Script.
```

**How to use Copilot with these prompts**
- Open a new issue or PR in your repo, paste the prompt into the PR description, then ask Copilot to generate code in the changed files.
- Or paste the prompt into Copilot chat (if supported) and accept suggested edits.

---

### Simple checklist for you to follow now
- [ ] Update `apps-script/src/Code.gs` with your real `SHEET_ID` and replace `VALID_TOKENS` with a token store (or keep demo for testing).  
- [ ] Deploy Apps Script (Apps Script editor or `clasp`) and copy the deployed `APPSCRIPT_URL`.  
- [ ] Update `frontend/auth.js` `APPSCRIPT_URL` with the deployed URL.  
- [ ] Deploy `frontend/` to Vercel (create new project, point to repo).  
- [ ] Test flow: login → upload → refresh → back (should remain logged in).  
- [ ] Use the Copilot prompts above to refine code (token expiry, better error handling, pagination improvements).

---