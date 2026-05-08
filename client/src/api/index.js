import api from './axiosInstance';

// AUTH
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// PROJECTS
export const projectAPI = {
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMembers: (id, memberIds) => api.post(`/projects/${id}/members`, { memberIds }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
};

// TASKS
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  delete: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, text) => api.post(`/tasks/${id}/comments`, { text }),
  dashboard: () => api.get('/tasks/dashboard'),
};

// USERS
export const userAPI = {
  getAll: () => api.get('/users'),
  getOne: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
};
