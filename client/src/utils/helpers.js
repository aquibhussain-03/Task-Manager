// Shared utility helpers for the client

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const fmtDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  return new Date() > new Date(dueDate);
};

export const statusLabel = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done',
};

export const priorityLabel = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
};

export const statusOptions = ['todo', 'in-progress', 'review', 'done'];
export const priorityOptions = ['low', 'medium', 'high', 'critical'];
