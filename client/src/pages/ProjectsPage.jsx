import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI, userAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { getInitials, fmtDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, FolderOpen } from 'lucide-react';

const PROJECT_COLORS = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#14b8a6'];

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', deadline: '', color: '#6366f1', memberIds: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    projectAPI.getAll().then((r) => setProjects(r.data.projects)).finally(() => setLoading(false));
    if (isAdmin) userAPI.getAll().then((r) => setAllUsers(r.data.users));
  }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await projectAPI.create(form);
      setProjects([r.data.project, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '', deadline: '', color: '#6366f1', memberIds: [] });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner page />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {!projects.length ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FolderOpen size={48} /></div>
          <h3>No projects yet</h3>
          <p>{isAdmin ? 'Create your first project to get started.' : 'You haven\'t been added to any projects yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {projects.map((p) => {
            const pct = p.taskCount ? Math.round((p.doneCount / p.taskCount) * 100) : 0;
            return (
              <Link key={p._id} to={`/projects/${p._id}`} className="project-card">
                <div className="project-color-bar" style={{ background: p.color }} />
                <div className="project-card-header">
                  <h3 className="project-name">{p.name}</h3>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </div>
                <p className="project-desc">{p.description || 'No description'}</p>
                <div className="project-progress">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    <span>{p.doneCount}/{p.taskCount} tasks done</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                </div>
                <div className="project-footer">
                  <div className="member-stack">
                    {p.members?.slice(0, 4).map((m) => (
                      <div key={m._id} className="avatar avatar-sm avatar-placeholder" title={m.name} style={{ fontSize: '0.6rem' }}>
                        {getInitials(m.name)}
                      </div>
                    ))}
                    {p.members?.length > 4 && <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize: '0.6rem' }}>+{p.members.length - 4}</div>}
                  </div>
                  {p.deadline && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📅 {fmtDate(p.deadline)}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title="Create Project" onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="create-project-form" type="submit" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Create Project'}
            </button>
          </>}
        >
          <form id="create-project-form" onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Website Redesign" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project overview..." style={{ minHeight: 80 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input type="date" className="form-input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {PROJECT_COLORS.map((c) => (
                    <div key={c} onClick={() => setForm({ ...form, color: c })}
                      style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid white' : '3px solid transparent', transition: 'all 0.15s' }} />
                  ))}
                </div>
              </div>
            </div>
            {isAdmin && allUsers.length > 0 && (
              <div className="form-group">
                <label className="form-label">Add Members</label>
                <div style={{ maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.5rem', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  {allUsers.map((u) => (
                    <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.memberIds.includes(u._id)} onChange={(e) => setForm({ ...form, memberIds: e.target.checked ? [...form.memberIds, u._id] : form.memberIds.filter((id) => id !== u._id) })} />
                      {u.name} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({u.email})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
