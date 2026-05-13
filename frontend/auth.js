const APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL || 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercallback';
const TOKEN_KEY = 'ssk_user_token';
const EMAIL_KEY = 'ssk_user_email';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retryCount = 0) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    if (retryCount < MAX_RETRIES && (error instanceof TypeError || error.message.includes('HTTP'))) {
      await delay(RETRY_DELAY * (retryCount + 1));
      return fetchWithRetry(url, options, retryCount + 1);
    }
    throw error;
  }
}

export async function login(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    const response = await fetchWithRetry(`${APPSCRIPT_URL}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!data.success || !data.token) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(EMAIL_KEY, email);

    return { success: true, email, token: data.token };
  } catch (error) {
    const message = error.message || 'Network error. Please check your connection and try again.';
    throw new Error(message);
  }
}

export async function logout() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      await fetchWithRetry(`${APPSCRIPT_URL}?action=logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.warn('Logout sync failed:', error.message);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  }
}

export async function validateToken() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return { valid: false, token: null, email: null };
  }

  try {
    const response = await fetchWithRetry(`${APPSCRIPT_URL}?action=validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.valid) {
      return { valid: true, token, email: localStorage.getItem(EMAIL_KEY) };
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    return { valid: false, token: null, email: null };
  } catch (error) {
    console.warn('Token validation failed:', error.message);
    return { valid: false, token: null, email: null };
  }
}

export async function autoLogin() {
  const result = await validateToken();

  if (result.valid) {
    return { success: true, email: result.email, token: result.token };
  }

  return { success: false };
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
