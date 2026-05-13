const SUPABASE_URL = 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

function doGet(e) {
  const action = e.parameter.action;
  try {
    if (action === 'getRecords') {
      return getRecords();
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  try {
    if (action === 'login') {
      return handleLogin(e);
    } else if (action === 'logout') {
      return handleLogout(e);
    } else if (action === 'validate') {
      return validateToken(e);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleLogin(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const email = payload.email;
    const password = payload.password;

    if (!email || !password) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Email and password required'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const token = Utilities.getUuid();
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      token: token,
      email: email
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleLogout(e) {
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function validateToken(e) {
  try {
    const token = e.parameter.token;
    if (!token) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        valid: false
      })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      valid: true
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      valid: false
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getRecords() {
  try {
    const url = SUPABASE_URL + '/rest/v1/achievements?select=*&order=created_at.desc';
    const options = {
      method: 'get',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
}