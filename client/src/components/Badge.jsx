import { statusLabel, priorityLabel } from '../utils/helpers';

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{statusLabel[status] || status}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge badge-${priority}`}>{priorityLabel[priority] || priority}</span>;
}

export function RoleBadge({ role }) {
  return <span className={`badge badge-${role}`}>{role}</span>;
}
