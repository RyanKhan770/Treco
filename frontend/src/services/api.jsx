import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emitSessionExpired } from '../utils/sessionEvents';

const BASE_URL = 'http://10.43.129.188:5000/api'; // LAN IP — phone must be on same WiFi

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: silently try to refresh the access token, then retry once.
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) return Promise.reject(error);
    if (original.url?.includes('/auth/refresh')) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token stored');
      const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const { token } = res.data;
      await AsyncStorage.setItem('token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      processQueue(null, token);
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await AsyncStorage.multiRemove(['token', 'refreshToken']);
      emitSessionExpired();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  refresh:  (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe:    () => api.get('/auth/me'),
};

export const trailsAPI = {
  getAll:  (params) => api.get('/trails', { params }),
  getOne:  (id) => api.get(`/trails/${id}`),
  getById: (id) => api.get(`/trails/${id}`),
  search:  (q) => api.get('/trails/search', { params: { q } }),
};

export const groupsAPI = {
  getAll:       (params) => api.get('/groups', { params }),
  getById:      (id) => api.get(`/groups/${id}`),
  create:       (data) => api.post('/groups', data),
  join:         (id, message) => api.post(`/groups/${id}/join`, { message }),
  leave:        (id) => api.delete(`/groups/${id}/leave`),
  // Fixed: backend route is /user/mygroups
  getMyGroups:  () => api.get('/groups/user/mygroups'),
  getRequests:  (id) => api.get(`/groups/${id}/requests`),
  respondToRequest: (requestId, status) => api.patch(`/groups/requests/${requestId}`, { status }),
};

export const messagesAPI = {
  getGroupMessages: (groupId) => api.get(`/messages/${groupId}`),
  send:             (groupId, content) => api.post(`/messages/${groupId}`, { content }),
};

export const dmAPI = {
  getInbox:    () => api.get('/dm/inbox'),
  getMessages: (userId) => api.get(`/dm/${userId}`),
  send:        (userId, content) => api.post(`/dm/${userId}`, { content }),
};

export const userAPI = {
  getProfile:    (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/me', data),
  getOrganizers: () => api.get('/users/organizers'),
  browseUsers:   (q) => api.get('/users/browse', q ? { params: { q } } : {}),
  getReviews:    (id) => api.get(`/users/${id}/reviews`),
};

export const checklistAPI = {
  get:        (groupId) => api.get(`/checklists/${groupId}`),
  addItem:    (groupId, item) => api.post(`/checklists/${groupId}/items`, item),
  toggleItem: (groupId, itemId) => api.put(`/checklists/${groupId}/items/${itemId}/toggle`),
};

export default api;
