const SHEET_ID = 'YOUR_SHEET_ID_HERE';
const FOLDER_ID = 'YOUR_FOLDER_ID_HERE';
const TOKEN_PREFIX = 'auth_token_';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'validateToken') {
    return validateToken(e);
  }
  if (action === 'list') {
    return listRecords(e);
  }
  return jsonResponse({ success: false, message: 'Invalid action' });
}

function doPost(e) {
  const action = e.parameter.action;
  try {
    if (action === 'login') {
      return login(e);
    }
    if (action === 'upload') {
      return uploadRecord(e);
    }
  } catch (err) {
    return jsonResponse({ success: false, message: err.message });
  }
  return jsonResponse({ success: false, message: 'Invalid action' });
}

function login(e) {
  const body = parseRequestBody(e);
  const email = (body.email || '').toString().trim();
  const password = (body.password || '').toString();
  const dept = (body.dept || '').toString().trim();

  if (!dept || !password) {
    return jsonResponse({ success: false, message: 'Department and password are required' });
  }

  let isAdmin = false;
  let userEmail = email;

  if (dept === 'Admin') {
    if (password !== 'adminssk') {
      return jsonResponse({ success: false, message: 'Invalid admin credentials' });
    }
    isAdmin = true;
    userEmail = userEmail || 'admin@ssk.ac.th';
  } else {
    if (!userEmail || !userEmail.toLowerCase().endsWith('@ssk.ac.th')) {
      return jsonResponse({ success: false, message: 'Email must be @ssk.ac.th' });
    }
    if (password !== 'sskssk') {
      return jsonResponse({ success: false, message: 'Invalid password' });
    }
  }

  const token = Utilities.getUuid().replace(/-/g, '');
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = {
    email: userEmail,
    dept,
    isAdmin,
    expiresAt,
  };

  PropertiesService.getScriptProperties().setProperty(TOKEN_PREFIX + token, JSON.stringify(payload));
  return jsonResponse({ success: true, token, email: userEmail, dept, isAdmin });
}

function validateToken(e) {
  const token = getTokenFromRequest(e);
  if (!token) {
    return jsonResponse({ success: true, valid: false });
  }

  const stored = getTokenPayload(token);
  if (!stored || stored.expiresAt < Date.now()) {
    return jsonResponse({ success: true, valid: false });
  }

  return jsonResponse({ success: true, valid: true, email: stored.email, dept: stored.dept, isAdmin: stored.isAdmin });
}

function uploadRecord(e) {
  const token = getTokenFromRequest(e);
  const auth = getTokenPayload(token);
  if (!auth || auth.expiresAt < Date.now()) {
    return jsonResponse({ success: false, message: 'Invalid or expired token' });
  }

  const body = parseRequestBody(e);
  const record = body.record || {};
  const attachments = Array.isArray(body.attachments) ? body.attachments : [];
  const sheet = openSheet();

  if (!sheet) {
    throw new Error('Unable to open sheet');
  }

  const fileUrls = attachments
    .map(file => uploadAttachment(file.fileName, file.mimeType, file.base64Data))
    .filter(url => url);

  const row = [
    record.timestamp || new Date().toISOString(),
    auth.email,
    auth.dept,
    record.year || '',
    record.level || '',
    record.project || '',
    record.org || '',
    record.place || '',
    record.date || '',
    JSON.stringify(record.competitions || []),
    JSON.stringify(fileUrls),
  ];

  sheet.appendRow(row);
  return jsonResponse({ success: true, fileUrls });
}

function listRecords(e) {
  const sheet = openSheet();
  if (!sheet) {
    return jsonResponse({ success: true, data: [] });
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return jsonResponse({ success: true, data: [] });
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
  const records = rows.map((row, index) => ({
    rowIndex: index + 2,
    timestamp: row[0],
    recordedBy: row[1],
    recordedDept: row[2],
    year: row[3],
    level: row[4],
    project: row[5],
    org: row[6],
    place: row[7],
    date: row[8],
    competitions: safeParseJSON(row[9], []),
    fileUrls: safeParseJSON(row[10], []),
  }));

  return jsonResponse({ success: true, data: records });
}

function openSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('ผลงาน');
  if (!sheet) {
    sheet = ss.insertSheet('ผลงาน');
    sheet.appendRow([
      'timestamp',
      'recordedBy',
      'recordedDept',
      'year',
      'level',
      'project',
      'org',
      'place',
      'date',
      'competitions',
      'fileUrls',
    ]);
  }
  return sheet;
}

function uploadAttachment(fileName, mimeType, base64Data) {
  if (!fileName || !base64Data) return null;
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType || 'application/octet-stream', fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function getTokenFromRequest(e) {
  const tokenParam = e.parameter.token || '';
  if (tokenParam) {
    return tokenParam.toString();
  }
  const body = parseRequestBody(e);
  return body.token || '';
}

function getTokenPayload(token) {
  if (!token) return null;
  const stored = PropertiesService.getScriptProperties().getProperty(TOKEN_PREFIX + token);
  try {
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    return null;
  }
}

function parseRequestBody(e) {
  if (e.postData && typeof e.postData.type === 'string' && e.postData.type.includes('application/json')) {
    return JSON.parse(e.postData.contents || '{}');
  }
  try {
    return JSON.parse(e.postData && e.postData.contents ? e.postData.contents : '{}');
  } catch (err) {
    return {};
  }
}

function safeParseJSON(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
