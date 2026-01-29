const API_BASE = 'https://task-management-api-production-a18c.up.railway.app';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

export const api = {
  get: (endpoint) =>
    fetch(`${API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(handleResponse),

  post: (endpoint, data) =>
    fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  put: (endpoint, data) =>
    fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (endpoint) =>
    fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(handleResponse),
};

export { API_BASE };
