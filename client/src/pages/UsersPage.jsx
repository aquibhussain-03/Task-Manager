import { useEffect, useState } from 'react';
import { userAPI } from '../api';
import { RoleBadge } from '../components/Badge';
import Spinner from '../components/Spinner';
import { getInitials, fmtDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Trash2, Shield } from 'lucide-react';

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getAll().then((r) => setUsers(r.data.users)).finally(() => setLoading(false));
  }, []);

  const handleRoleToggle = async (u) => {
    const newRole = u.role === 'admin' ? 'member' : 'admin';
    if (!confirm(`Change ${u.name}'s role to ${newRole}?`)) return;
    try {
      const r = await userAPI.updateRole(u._id, newRole);
      setUsers(users.map((usr) => usr._id === u._id ? r.data.user : usr));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await userAPI.delete(u._id);
      setUsers(users.filter((usr) => usr._id !== u._id));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  if (loading) return <Spinner page />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize: '0.6rem' }}>{getInitials(u.name)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                      {u._id === me._id && <div style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>You</div>}
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.email}</td>
                <td><RoleBadge role={u.role} /></td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{fmtDate(u.createdAt)}</td>
                <td>
                  {u._id !== me._id && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm btn-icon" title={`Make ${u.role === 'admin' ? 'Member' : 'Admin'}`} onClick={() => handleRoleToggle(u)}>
                        <Shield size={14} style={{ color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-muted)' }} />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(u)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
