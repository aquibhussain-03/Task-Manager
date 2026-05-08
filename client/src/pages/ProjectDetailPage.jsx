import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI, userAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { getInitials, fmtDate, isOverdue, statusOptions, priorityOptions } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, ArrowLeft, Trash2, UserPlus } from 'lucide-react';

const COLS = ['todo','in-progress','review','done'];
const COL_LABELS = { 'todo':'To Do','in-progress':'In Progress','review':'Review','done':'Done' };
const COL_COLORS = { 'todo':'var(--text-muted)','in-progress':'var(--primary)','review':'var(--warning)','done':'var(--success)' };

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
  const [memberIds, setMemberIds] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    projectAPI.getOne(id).then((r) => { setProject(r.data.project); setTasks(r.data.tasks); }).catch(() => navigate('/projects')).finally(() => setLoading(false));
    if (isAdmin) userAPI.getAll().then((r) => setAllUsers(r.data.users));
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await taskAPI.create({ ...taskForm, project: id });
      setTasks([r.data.task, ...tasks]);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
      toast.success('Task created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const r = await taskAPI.updateStatus(taskId, status);
      setTasks(tasks.map((t) => t._id === taskId ? { ...t, status: r.data.task.status } : t));
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project? All tasks will be removed.')) return;
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch { toast.error('Failed to delete'); }
  };

  const handleAddMembers = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await projectAPI.addMembers(id, memberIds);
      setProject(r.data.project);
      setShowMemberModal(false);
      setMemberIds([]);
      toast.success('Members added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner page />;
  if (!project) return null;

  const nonMembers = allUsers.filter((u) => !project.members?.some((m) => m._id === u._id));

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => navigate('/projects')}><ArrowLeft size={16} /></button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: project.color }} />
              <h1 className="page-title">{project.name}</h1>
              <span className={`badge badge-${project.status}`}>{project.status}</span>
            </div>
            <p className="page-subtitle">{project.description || 'No description'} {project.deadline && `· Due ${fmtDate(project.deadline)}`}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isAdmin && <button className="btn btn-ghost btn-sm" onClick={() => setShowMemberModal(true)}><UserPlus size={15} /> Members</button>}
          <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}><Plus size={15} /> Task</button>
          {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={handleDelete}><Trash2 size={15} /></button>}
        </div>
      </div>

      {/* Members */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Team:</span>
        <div className="member-stack">
          {project.members?.map((m) => (
            <div key={m._id} className="avatar avatar-sm avatar-placeholder" title={m.name} style={{ fontSize: '0.6rem' }}>{getInitials(m.name)}</div>
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{project.members?.length} member{project.members?.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {COLS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          return (
            <div key={col} className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-title" style={{ color: COL_COLORS[col] }}>{COL_LABELS[col]}</span>
                <span className="kanban-count">{colTasks.length}</span>
              </div>
              {colTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <div key={task._id} className={`task-card ${overdue ? 'overdue' : ''}`} onClick={() => navigate(`/tasks/${task._id}`)}>
                    <div className="task-card-header">
                      <span className="task-title">{task.title}</span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <div className="task-meta">
                      {task.assignedTo && (
                        <div className="avatar avatar-sm avatar-placeholder" title={task.assignedTo.name} style={{ fontSize: '0.55rem' }}>
                          {getInitials(task.assignedTo.name)}
                        </div>
                      )}
                      {task.dueDate && <span className="task-meta-item" style={overdue ? { color: 'var(--danger)' } : {}}>{overdue ? '⚠️' : '📅'} {fmtDate(task.dueDate)}</span>}
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <select className="form-select" style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }} value={task.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => { e.stopPropagation(); handleStatusChange(task._id, e.target.value); }}>
                        {statusOptions.map((s) => <option key={s} value={s}>{COL_LABELS[s]}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
              {!colTasks.length && <div style={{ textAlign: 'center', padding: '1.5rem 0', fontSize: '0.75rem', color: 'var(--text-dim)' }}>No tasks</div>}
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <Modal title="Create Task" onClose={() => setShowTaskModal(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="create-task-form" type="submit" disabled={saving}>{saving ? <span className="spinner" /> : 'Create Task'}</button>
          </>}>
          <form id="create-task-form" onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required placeholder="Task title..." />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" style={{ minHeight: 70 }} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Details..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  {priorityOptions.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                  {statusOptions.map((s) => <option key={s} value={s}>{COL_LABELS[s]}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-select" value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members?.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <Modal title="Add Members" onClose={() => setShowMemberModal(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="add-member-form" type="submit" disabled={saving || !memberIds.length}>{saving ? <span className="spinner" /> : 'Add Members'}</button>
          </>}>
          <form id="add-member-form" onSubmit={handleAddMembers}>
            {!nonMembers.length ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>All users are already members.</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {nonMembers.map((u) => (
                  <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)' }}>
                    <input type="checkbox" checked={memberIds.includes(u._id)} onChange={(e) => setMemberIds(e.target.checked ? [...memberIds, u._id] : memberIds.filter((id) => id !== u._id))} />
                    <div className="avatar-sm avatar-placeholder avatar" style={{ fontSize: '0.55rem' }}>{getInitials(u.name)}</div>
                    <div><div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.email}</div></div>
                  </label>
                ))}
              </div>
            }
          </form>
        </Modal>
      )}
    </div>
  );
}
