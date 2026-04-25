import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { emitSessionExpired } from '../utils/sessionEvents';

function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  // In dev builds, derive the backend IP from Metro's host (same machine, port 5000)
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:5000/api`;
  return 'http://localhost:5000/api';
}

export const BASE_URL = getBaseUrl();

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
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  refresh:        (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe:          () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const trailsAPI = {
  getAll:     (params) => api.get('/trails', { params }),
  getOne:     (id)     => api.get(`/trails/${id}`),
  getById:    (id)     => api.get(`/trails/${id}`),
  search:     (q)      => api.get('/trails/search', { params: { q } }),
  getReviews: (id)     => api.get(`/trails/${id}/reviews`),
  postReview: (id, data) => api.post(`/trails/${id}/reviews`, data),
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
  uploadPhoto: async (id, uri) => {
    const token = await AsyncStorage.getItem('token');
    const form = new FormData();
    form.append('photo', { uri, name: 'group.jpg', type: 'image/jpeg' });
    return axios.post(`${BASE_URL}/groups/${id}/photo`, form, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
  },
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
  getProfile:    (id)   => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/me', data),
  getOrganizers: ()     => api.get('/users/organizers'),
  browseUsers:   (q)    => api.get('/users/browse', q ? { params: { q } } : {}),
  verifyRequest: (data) => api.post('/users/verify-request', data),
  uploadPhoto: async (uri) => {
    const token = await AsyncStorage.getItem('token');
    const form = new FormData();
    form.append('photo', { uri, name: 'photo.jpg', type: 'image/jpeg' });
    return axios.post(`${BASE_URL}/users/me/photo`, form, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadGovId: async (uri) => {
    const token = await AsyncStorage.getItem('token');
    const form = new FormData();
    form.append('photo', { uri, name: 'gov_id.jpg', type: 'image/jpeg' });
    return axios.post(`${BASE_URL}/users/me/govid`, form, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const reviewsAPI = {
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  getReviewsBy:   (userId) => api.get(`/reviews/by/${userId}`),
  postUserReview: (data)   => api.post('/reviews/user', data),
};

export const postsAPI = {
  getFeed:      () => api.get('/posts/feed'),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  like:         (id) => api.post(`/posts/${id}/like`),
  getComments:  (id) => api.get(`/posts/${id}/comments`),
  postComment:  (id, content) => api.post(`/posts/${id}/comments`, { content }),
  updatePost:   (id, content) => api.put(`/posts/${id}`, { content }),
  deletePost:   (id) => api.delete(`/posts/${id}`),
  create: async (content, trailId, imageUri) => {
    const token = await AsyncStorage.getItem('token');
    const form = new FormData();
    form.append('content', content);
    if (trailId) form.append('trail_id', trailId);
    if (imageUri) {
      form.append('photo', { uri: imageUri, name: 'post.jpg', type: 'image/jpeg' });
    }
    return axios.post(`${BASE_URL}/posts`, form, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
  }
};

export const notificationsAPI = {
  getAll:        () => api.get('/notifications'),
  markRead:      (id) => api.patch(`/notifications/${id}/read`),
  clearAll:      () => api.delete('/notifications/clear'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export const checklistAPI = {
  get:        (groupId)         => api.get(`/checklist/${groupId}`),
  addItem:    (groupId, item)   => api.post(`/checklist/${groupId}`, item),
  toggleItem: (itemId, data)    => api.patch(`/checklist/items/${itemId}`, data),
  deleteItem: (itemId)          => api.delete(`/checklist/items/${itemId}`),
};

export const budgetAPI = {
  get:        (groupId)         => api.get(`/budget/${groupId}`),
  add:        (groupId, data)   => api.post(`/budget/${groupId}`, data),
  remove:     (groupId, itemId) => api.delete(`/budget/${groupId}/${itemId}`),
};

export const connectionsAPI = {
  sendRequest:  (receiverId) => api.post('/connections/request', { receiverId }),
  getRequests:  ()           => api.get('/connections/requests'),
  getSent:      ()           => api.get('/connections/sent'),
  respond:      (id, status) => api.patch(`/connections/${id}`, { status }),
  getAll:       ()           => api.get('/connections'),
  getStatus:    (userId)     => api.get(`/connections/status/${userId}`),
  remove:       (id)         => api.delete(`/connections/${id}`),
};

export const savedTrailsAPI = {
  getAll:   ()        => api.get('/saved-trails'),
  save:     (trailId) => api.post(`/saved-trails/${trailId}`),
  unsave:   (trailId) => api.delete(`/saved-trails/${trailId}`),
  check:    (trailId) => api.get(`/saved-trails/check/${trailId}`),
};

export const tripsAPI = {
  getAll:          (params) => api.get('/trips', { params }),
  getById:         (id)     => api.get(`/trips/${id}`),
  create:          (data)   => api.post('/trips', data),
  update:          (id, data) => api.patch(`/trips/${id}`, data),
  addParticipant:  (id, userId) => api.post(`/trips/${id}/participants`, { userId }),
  updateParticipant: (id, userId, data) => api.patch(`/trips/${id}/participants/${userId}`, data),
  updateLocation:  (id, lat, lng) => api.post(`/trips/${id}/location`, { lat, lng }),
};

export const settingsAPI = {
  get:    () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const organizerAPI = {
  submitRequest: (data) => api.post('/organizer/request', data),
  getAll:        ()     => api.get('/organizer/requests'),
  respond:       (id, status) => api.patch(`/organizer/requests/${id}`, { status }),
};

export default api;
