import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';
import { RoleBadge } from '../components/Badge';
import { Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '', currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, avatar: form.avatar };
      if (form.newPassword) { payload.currentPassword = form.currentPassword; payload.newPassword = form.newPassword; }
      const r = await userAPI.updateProfile(payload);
      updateUser(r.data.user);
      setForm({ ...form, currentPassword: '', newPassword: '' });
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="avatar-lg avatar-placeholder avatar" style={{ width: 64, height: 64, fontSize: '1.25rem', flexShrink: 0 }}>
          {user?.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : getInitials(user?.name)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</div>
          <div style={{ marginTop: '0.35rem' }}><RoleBadge role={user?.role} /></div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Edit Profile</h3>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Avatar URL</label>
            <input className="form-input" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
          </div>

          <div className="divider" />
          <h3 style={{ fontWeight: 700 }}>Change Password</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-0.5rem' }}>Leave blank to keep your current password.</p>

          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} placeholder="Enter current password" />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="Min. 6 characters" minLength={form.newPassword ? 6 : undefined} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? <span className="spinner" /> : <><Save size={15} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
