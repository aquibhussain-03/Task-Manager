import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskAPI } from '../api';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import Spinner from '../components/Spinner';
import { fmtDate, isOverdue, statusOptions, priorityOptions, getInitials } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, Send } from 'lucide-react';

const COL_LABELS = { 'todo':'To Do','in-progress':'In Progress','review':'Review','done':'Done' };

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState('');
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    taskAPI.getOne(id).then((r) => { setTask(r.data.task); setForm(r.data.task); }).catch(() => navigate('/tasks')).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await taskAPI.update(id, form);
      setTask(r.data.task);
      setEditing(false);
      toast.success('Task updated!');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try { await taskAPI.delete(id); toast.success('Task deleted'); navigate(-1); }
    catch { toast.error('Failed to delete'); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const r = await taskAPI.addComment(id, comment);
      setTask({ ...task, comments: r.data.comments });
      setComment('');
    } catch { toast.error('Failed to add comment'); }
  };

  if (loading) return <Spinner page />;
  if (!task) return null;

  const overdue = isOverdue(task.dueDate, task.status);
  const canEdit = isAdmin || task.assignedTo?._id === user._id || task.createdBy?._id === user._id;

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></button>
        <h1 className="page-title" style={{ flex: 1 }}>{task.title}</h1>
        {canEdit && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {editing ? <>
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setForm(task); }}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? <span className="spinner" /> : 'Save'}</button>
            </> : <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>}
            {(isAdmin || task.createdBy?._id === user._id) && <button className="btn btn-danger btn-sm btn-icon" onClick={handleDelete}><Trash2 size={15} /></button>}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            {overdue && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--danger)' }}>⚠️ This task is overdue</div>}
            <div className="form-group">
              <label className="form-label">Description</label>
              {editing
                ? <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                : <p style={{ fontSize: '0.875rem', color: form.description ? 'var(--text)' : 'var(--text-muted)', lineHeight: 1.7 }}>{task.description || 'No description provided.'}</p>}
            </div>
            {task.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {task.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Comments ({task.comments?.length || 0})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {task.comments?.map((c) => (
                <div key={c._id} style={{ display: 'flex', gap: '0.75rem' }}>
                  <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize: '0.55rem', flexShrink: 0 }}>{getInitials(c.user?.name || '')}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{c.user?.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fmtDate(c.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>{c.text}</p>
                  </div>
                </div>
              ))}
              {!task.comments?.length && <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No comments yet. Be the first!</p>}
            </div>
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="form-input" placeholder="Write a comment..." value={comment} onChange={(e) => setComment(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary btn-sm"><Send size={14} /></button>
            </form>
          </div>
        </div>

        {/* Sidebar details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Status</label>
            {editing
              ? <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {statusOptions.map((s) => <option key={s} value={s}>{COL_LABELS[s]}</option>)}
                </select>
              : <StatusBadge status={task.status} />}
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            {editing
              ? <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {priorityOptions.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              : <PriorityBadge priority={task.priority} />}
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            {editing
              ? <input type="date" className="form-input" value={form.dueDate?.split('T')[0] || ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              : <span style={{ fontSize: '0.875rem', color: overdue ? 'var(--danger)' : 'var(--text-muted)' }}>{fmtDate(task.dueDate)}</span>}
          </div>
          <div className="divider" />
          <div className="form-group">
            <label className="form-label">Project</label>
            {task.project && <Link to={`/projects/${task.project._id}`} style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: task.project.color, display: 'inline-block' }} />{task.project.name}
            </Link>}
          </div>
          <div className="form-group">
            <label className="form-label">Assigned To</label>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{task.assignedTo?.name || 'Unassigned'}</span>
          </div>
          <div className="form-group">
            <label className="form-label">Created By</label>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{task.createdBy?.name}</span>
          </div>
          <div className="form-group">
            <label className="form-label">Created</label>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{fmtDate(task.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
