import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach the bearer token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password, role: 'student' }),
  me: () => api.get('/auth/me'),
};

// ---------------------------------------------------------------------------
// Students — admin only
// ---------------------------------------------------------------------------
export const studentApi = {
  list: (filters = {}) => api.get('/students', { params: filters }),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  toggleEligibility: (id) => api.patch(`/students/${id}/eligibility`),
  resetPassword: (id, newPassword) => api.post(`/students/${id}/reset-password`, { newPassword }),
  import: (csvText) => api.post('/students/import', csvText, { headers: { 'Content-Type': 'text/csv' } }),
};

// ---------------------------------------------------------------------------
// Elections — admin only
// ---------------------------------------------------------------------------
export const electionApi = {
  list: () => api.get('/elections'),
  get: (id) => api.get(`/elections/${id}`),
  create: (data) => api.post('/elections', data),
  update: (id, data) => api.put(`/elections/${id}`, data),
  changeStatus: (id, status) => api.patch(`/elections/${id}/status`, { status }),
  start: (id) => api.post(`/elections/${id}/start`),
  pause: (id) => api.post(`/elections/${id}/pause`),
  close: (id) => api.post(`/elections/${id}/close`),
  publishResults: (id) => api.post(`/elections/${id}/publish-results`),
};

// ---------------------------------------------------------------------------
// Positions — admin only
// ---------------------------------------------------------------------------
export const positionApi = {
  list: (filters = {}) => api.get('/positions', { params: filters }),
  create: (data) => api.post('/positions', data),
  update: (id, data) => api.put(`/positions/${id}`, data),
  delete: (id) => api.delete(`/positions/${id}`),
};

// ---------------------------------------------------------------------------
// Candidates — admin only
// ---------------------------------------------------------------------------
export const candidateApi = {
  list: (filters = {}) => api.get('/candidates', { params: filters }),
  get: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
  approve: (id) => api.patch(`/candidates/${id}/approve`),
  reject: (id) => api.patch(`/candidates/${id}/reject`),
  assignToElection: (id, electionId) => api.post(`/candidates/${id}/assign-election`, { candidate_id: id, election_id: electionId }),
  assignToPosition: (id, positionId) => api.post(`/candidates/${id}/assign-position`, { candidate_id: id, position_id: positionId }),
};

// ---------------------------------------------------------------------------
// Votes — authenticated
// ---------------------------------------------------------------------------
export const voteApi = {
  cast: (electionId, positionId, candidateId) =>
    api.post('/votes/cast', { election_id: electionId, position_id: positionId, candidate_id: candidateId }),
  myVotes: () => api.get('/votes/my-votes'),
  stats: (electionId) => api.get(`/votes/stats/${electionId}`),
};

// ---------------------------------------------------------------------------
// Audit log — admin only
// ---------------------------------------------------------------------------
export const auditApi = {
  list: () => api.get('/audit'),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export async function handleResponse(data) {
  return data;
}

export async function handleError(error) {
  const message = error.response?.data?.message || error.message || 'Something went wrong';
  throw new Error(message);
}

export default api;
