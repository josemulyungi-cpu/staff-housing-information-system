const API_BASE = window.location.protocol === "file:"
  ? "http://localhost:5000/api"
  : "/api";

/**
 * Get stored auth token
 */
function getToken() {
  return localStorage.getItem("hims_token");
}

/**
 * Get stored user info
 */
function getUser() {
  const user = localStorage.getItem("hims_user");
  return user ? JSON.parse(user) : null;
}

/**
 * Save auth data
 */
function saveAuth(token, user) {
  localStorage.setItem("hims_token", token);
  localStorage.setItem("hims_user", JSON.stringify(user));
}

/**
 * Clear auth data
 */
function clearAuth() {
  localStorage.removeItem("hims_token");
  localStorage.removeItem("hims_user");
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return !!getToken();
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export { getToken, getUser, saveAuth, clearAuth, isLoggedIn, apiRequest };
