import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator -> localhost

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const trailsAPI = {
  getAll: (params) => api.get('/trails', { params }),
  getById: (id) => api.get(`/trails/${id}`),
  search: (q) => api.get('/trails/search', { params: { q } }),
};

export const groupsAPI = {
  getAll: (params) => api.get('/groups', { params }),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  join: (id) => api.post(`/groups/${id}/join`),
  getMyGroups: () => api.get('/groups/mine'),
};

export const messagesAPI = {
  getGroupMessages: (groupId) => api.get(`/messages/${groupId}`),
  send: (groupId, content) => api.post(`/messages/${groupId}`, { content }),
};

export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  getReviews: (id) => api.get(`/users/${id}/reviews`),
};

export const checklistAPI = {
  get: (groupId) => api.get(`/checklists/${groupId}`),
  addItem: (groupId, item) => api.post(`/checklists/${groupId}/items`, item),
  toggleItem: (groupId, itemId) => api.put(`/checklists/${groupId}/items/${itemId}/toggle`),
};

export default api;
