import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>⚡ TaskFlow</h1>
          <p>Sign in to your workspace</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            {loading ? <span className="spinner" /> : <><LogIn size={16} /> Sign In</>}
          </button>

          <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Demo credentials:</strong><br />
            Admin: admin@taskmanager.com / password123<br />
            Member: bob@taskmanager.com / password123
          </div>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
