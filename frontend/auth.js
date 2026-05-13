const APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL || 'https://script.google.com/macros/d/AKfycbw5dXYC-3KORzjCRSExnpgTA9TkIHju8U8Ed7khoNGt4e0tgd36yjN3UEUWyvdCgvg/exec';
const TOKEN_KEY = 'ssk_user_token';
const EMAIL_KEY = 'ssk_user_email';
const DEPT_KEY = 'ssk_user_dept';
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
    if (retryCount < MAX_RETRIES) {
      await delay(RETRY_DELAY * (retryCount + 1));
      return fetchWithRetry(url, options, retryCount + 1);
    }
    throw error;
  }
}

export async function login({ email, password, dept }) {
  if (!password || !dept) {
    throw new Error('Department and password are required');
  }

  const payload = {
    email: email || '',
    password,
    dept,
  };

  const response = await fetchWithRetry(`${APPSCRIPT_URL}?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!data.success || !data.token) {
    throw new Error(data.message || 'Login failed');
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(EMAIL_KEY, data.email || '');
  localStorage.setItem(DEPT_KEY, data.dept || '');

  return {
    success: true,
    email: data.email || '',
    dept: data.dept || '',
    token: data.token,
    isAdmin: !!data.isAdmin,
  };
}

export function logout() {
  clearAuth();
  return { success: true };
}

export async function validateToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return { valid: false, token: null, email: null, dept: null };
  }

  try {
    const response = await fetchWithRetry(`${APPSCRIPT_URL}?action=validateToken&token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });

    const data = await response.json();
    if (!data.success || !data.valid) {
      clearAuth();
      return { valid: false, token: null, email: null, dept: null };
    }

    return {
      valid: true,
      token,
      email: localStorage.getItem(EMAIL_KEY),
      dept: localStorage.getItem(DEPT_KEY),
      isAdmin: !!data.isAdmin,
    };
  } catch (error) {
    console.warn('Token validation failed:', error.message);
    clearAuth();
    return { valid: false, token: null, email: null, dept: null };
  }
}

export async function autoLogin() {
  const result = await validateToken();
  return result.valid ? { success: true, ...result } : { success: false };
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export function getStoredDept() {
  return localStorage.getItem(DEPT_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(DEPT_KEY);
}

export { APPSCRIPT_URL };
