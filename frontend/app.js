import {
  login,
  logout,
  autoLogin,
  validateToken,
  getStoredToken,
  getStoredEmail,
  clearAuth,
} from './auth.js';

let authState = {
  isAuthenticated: false,
  email: null,
  token: null,
  loading: true,
};

const authListeners = [];

function notifyAuthStateChange() {
  authListeners.forEach(listener => listener(authState));
}

export function onAuthStateChange(callback) {
  authListeners.push(callback);
  callback(authState);
  return () => {
    const index = authListeners.indexOf(callback);
    if (index > -1) authListeners.splice(index, 1);
  };
}

export async function initializeAuth() {
  authState.loading = true;
  notifyAuthStateChange();

  try {
    const result = await autoLogin();

    if (result.success) {
      authState = {
        isAuthenticated: true,
        email: result.email,
        token: result.token,
        loading: false,
      };
    } else {
      authState = {
        isAuthenticated: false,
        email: null,
        token: null,
        loading: false,
      };
    }
  } catch (error) {
    console.error('Auth initialization failed:', error.message);
    authState = {
      isAuthenticated: false,
      email: null,
      token: null,
      loading: false,
    };
  }

  notifyAuthStateChange();
  return authState;
}

export async function handleLogin(email, password) {
  try {
    const result = await login(email, password);

    authState = {
      isAuthenticated: true,
      email: result.email,
      token: result.token,
      loading: false,
    };

    notifyAuthStateChange();
    return { success: true, message: 'Login successful' };
  } catch (error) {
    authState.loading = false;
    notifyAuthStateChange();
    return { success: false, message: error.message };
  }
}

export async function handleLogout() {
  try {
    await logout();
  } catch (error) {
    console.error('Logout error:', error.message);
  } finally {
    authState = {
      isAuthenticated: false,
      email: null,
      token: null,
      loading: false,
    };

    notifyAuthStateChange();
  }
}

export function getAuthState() {
  return { ...authState };
}

export function isAuthenticated() {
  return authState.isAuthenticated;
}

export function getEmail() {
  return authState.email;
}

export function getToken() {
  return authState.token;
}
