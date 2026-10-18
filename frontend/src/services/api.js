const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const AUTH_KEY = 'inventory_auth_user';

function getAuthHeaders() {
  try {
    const user = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
    return user ? { Authorization: `Bearer ${user.username}` } : {};
  } catch (error) {
    return {};
  }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errorMessage = payload?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload;
}

export const api = {
  login: (payload) => request('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getDashboard: () => request('/api/dashboard'),
  getUsers: () => request('/api/users'),
  createUser: (payload) => request('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateUser: (id, payload) => request(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteUser: (id) => request(`/api/users/${id}`, {
    method: 'DELETE',
  }),
  getSupplies: () => request('/api/supplies'),
  createSupply: (payload) => request('/api/supplies', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateSupply: (id, payload) => request(`/api/supplies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteSupply: (id) => request(`/api/supplies/${id}`, {
    method: 'DELETE',
  }),
  getMachines: () => request('/api/machines'),
  createMachine: (payload) => request('/api/machines', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateMachine: (id, payload) => request(`/api/machines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteMachine: (id) => request(`/api/machines/${id}`, {
    method: 'DELETE',
  }),
};
