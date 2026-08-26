

const API_BASE = '/api'; 


async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...headers, ...options.headers },
    ...options,
  });

  
  if (res.status === 204) return null;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    
    throw new Error(body.error || `Request failed: ${res.status} ${path}`);
  }
  return body;
}

export default request;






export const createMeeting = (title) =>
  request('/meetings', { method: 'POST', body: JSON.stringify({ title }) });

export const listMeetings = () => request('/meetings');

export const getMeeting = (id) => request(`/meetings/${id}`);

export const deleteMeeting = (id) =>
  request(`/meetings/${id}`, { method: 'DELETE' });






export const generateSummary = (meetingId) =>
  request(`/meetings/${meetingId}/summary`, { method: 'POST' });

export const getSummary = (meetingId) =>
  request(`/meetings/${meetingId}/summary`);





export const addTask = (meetingId, description, assignee) =>
  request(`/meetings/${meetingId}/tasks`, { 
    method: 'POST', 
    body: JSON.stringify({ description, assignee }) 
  });

export const toggleTask = (meetingId, taskId) =>
  request(`/meetings/${meetingId}/tasks/${taskId}/toggle`, { method: 'PATCH' });

export const dispatchEmails = (meetingId) =>
  request(`/meetings/${meetingId}/dispatch`, { method: 'POST' });






export const checkHealth = () => request('/health');
