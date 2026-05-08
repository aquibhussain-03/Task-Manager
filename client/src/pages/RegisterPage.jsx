import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs ? errs.map((e) => e.msg).join(', ') : err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>⚡ TaskFlow</h1>
          <p>Create your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="name" type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select id="role" className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="member">Member</option>
              <option value="admin">Admin (only if no admin exists)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            {loading ? <span className="spinner" /> : <><UserPlus size={16} /> Create Account</>}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
