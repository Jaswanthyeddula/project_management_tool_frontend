import api from './axios';

export const authApi = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore token revocation failure on client logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

export const projectApi = {
  list: async () => {
    const res = await api.get('/projects');
    return res.data;
  },
  create: async (name, description = '') => {
    const res = await api.post('/projects', { name, description });
    return res.data;
  },
  get: async (projectId) => {
    const res = await api.get(`/projects/${projectId}`);
    return res.data;
  },
  update: async (projectId, data) => {
    const res = await api.patch(`/projects/${projectId}`, data);
    return res.data;
  },
  delete: async (projectId) => {
    const res = await api.delete(`/projects/${projectId}`);
    return res.data;
  },
  stats: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/stats`);
    return res.data;
  },
  members: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/members`);
    return res.data;
  },
  addMember: async (projectId, email, role = 'member') => {
    const res = await api.post(`/projects/${projectId}/members`, { email, role });
    return res.data;
  },
};

export const boardApi = {
  list: async (projectId) => {
    const res = await api.get(`/boards/project/${projectId}`);
    return res.data?.boards || res.data || [];
  },
  create: async (projectId, name, description = '') => {
    const res = await api.post(`/boards/project/${projectId}`, { name, description });
    return res.data;
  },
  update: async (boardId, data) => {
    const res = await api.patch(`/boards/${boardId}`, data);
    return res.data;
  },
  delete: async (boardId) => {
    const res = await api.delete(`/boards/${boardId}`);
    return res.data;
  },
};

export const taskApi = {
  list: async (boardId, status) => {
    const params = status ? { status } : {};
    const res = await api.get(`/boards/${boardId}/tasks`, { params });
    return res.data;
  },
  create: async (boardId, { title, description = '', priority = 'medium', due_date = null, assignee_id = null }) => {
    const payload = {
      title,
      description,
      priority: priority.toLowerCase(),
      due_date,
    };
    if (assignee_id) payload.assignee_id = assignee_id;
    const res = await api.post(`/boards/${boardId}/tasks`, payload);
    return res.data;
  },
  update: async (taskId, data) => {
    const res = await api.patch(`/tasks/${taskId}`, data);
    return res.data;
  },
  delete: async (taskId) => {
    const res = await api.delete(`/tasks/${taskId}`);
    return res.data;
  },
  move: async (taskId, status, position) => {
    const res = await api.patch(`/tasks/${taskId}/move`, { status, position });
    return res.data;
  },
  assign: async (taskId, assigneeId) => {
    const res = await api.patch(`/tasks/${taskId}/assign`, { assignee_id: assigneeId });
    return res.data;
  },
  createWithAI: async (projectId, boardId, input) => {
    const res = await api.post(`/projects/${projectId}/boards/${boardId}/ai-tasks`, { input });
    return res.data;
  },
};

export const notificationApi = {
  list: async (unreadOnly = false) => {
    const params = unreadOnly ? { unread_only: "true" } : {};
    const res = await api.get("/notifications", { params });
    return res.data?.notifications || [];
  },
  getUnreadCount: async () => {
    const res = await api.get("/notifications/unread-count");
    return res.data?.unread_count ?? 0;
  },
  markRead: async (notificationId) => {
    const res = await api.patch(`/notifications/${notificationId}/read`);
    return res.data?.notification;
  },
  markAllRead: async () => {
    const res = await api.patch("/notifications/read-all");
    return res.data;
  },
};

