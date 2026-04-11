import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  setRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  verifyUser: (id, status) => api.patch(`/admin/users/${id}/verify`, { status }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export const trailsAPI = {
  getAll: () => api.get('/trails'),
  create: (data) => api.post('/trails', data),
  update: (id, data) => api.put(`/trails/${id}`, data),
  delete: (id) => api.delete(`/trails/${id}`),
};

export const groupsAPI = {
  getAll: () => api.get('/groups'),
};

export const organizerAPI = {
  getRequests: () => api.get('/organizer/requests'),
  review: (id, status) => api.patch(`/organizer/requests/${id}`, { status }),
};

export const reportsAPI = {
  getAll: () => api.get('/reports'),
  update: (id, status) => api.patch(`/reports/${id}`, { status }),
};

export default api;
