import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskAPI, projectAPI } from '../api';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import Spinner from '../components/Spinner';
import { fmtDate, isOverdue, statusOptions, priorityOptions } from '../utils/helpers';
import { Search, Filter } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', project: '' });

  useEffect(() => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.project) params.project = filters.project;
    if (filters.search) params.search = filters.search;
    taskAPI.getAll(params).then((r) => setTasks(r.data.tasks)).finally(() => setLoading(false));
  }, [filters.status, filters.priority, filters.project]);

  useEffect(() => {
    projectAPI.getAll().then((r) => setProjects(r.data.projects));
  }, []);

  const filtered = filters.search
    ? tasks.filter((t) => t.title.toLowerCase().includes(filters.search.toLowerCase()))
    : tasks;

  if (loading) return <Spinner page />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{filtered.length} task{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input className="form-input search-input" placeholder="Search tasks..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priority</option>
          {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {!filtered.length ? (
        <div className="empty-state"><div className="empty-state-icon">🔍</div><h3>No tasks found</h3><p>Try adjusting your filters.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const overdue = isOverdue(t.dueDate, t.status);
                return (
                  <tr key={t._id}>
                    <td>
                      <Link to={`/tasks/${t._id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>
                        <span style={overdue ? { color: 'var(--danger)' } : {}}>{overdue && '⚠️ '}{t.title}</span>
                      </Link>
                      {t.tags?.length > 0 && <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {t.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                      </div>}
                    </td>
                    <td>
                      {t.project && <Link to={`/projects/${t.project._id}`} style={{ textDecoration: 'none' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.project.color, display: 'inline-block' }} />
                          <span style={{ fontSize: '0.82rem' }}>{t.project.name}</span>
                        </span>
                      </Link>}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{t.assignedTo?.name || <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>}</td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td style={{ fontSize: '0.82rem', color: overdue ? 'var(--danger)' : 'var(--text-muted)' }}>{fmtDate(t.dueDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
