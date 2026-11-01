
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('ratenest_token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && token) {
    localStorage.removeItem('ratenest_token');
    localStorage.removeItem('ratenest_user');

    if (
      !endpoint.startsWith('/auth/login') &&
      !endpoint.startsWith('/auth/register')
    ) {
      window.location.replace('/login');
    }
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong.');
  }

  return data;
}

const api = {
  get: (endpoint) => apiRequest(endpoint),

  post: (endpoint, body) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: (endpoint, body) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: 'DELETE',
    }),
};

export default api;
