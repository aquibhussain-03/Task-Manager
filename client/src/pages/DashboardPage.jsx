import { useEffect, useState } from 'react';
import { taskAPI } from '../api';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import Spinner from '../components/Spinner';
import { fmtDate, isOverdue } from '../utils/helpers';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, FolderOpen, ListTodo, TrendingUp } from 'lucide-react';

const COLORS = ['#94a3b8', '#6366f1', '#f59e0b', '#10b981'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskAPI.dashboard().then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner page />;

  const { stats, myTasks, recentTasks } = data || {};

  const pieData = [
    { name: 'To Do', value: stats?.todoCount || 0 },
    { name: 'In Progress', value: stats?.inProgressCount || 0 },
    { name: 'Review', value: stats?.reviewCount || 0 },
    { name: 'Done', value: stats?.doneCount || 0 },
  ];

  const barData = [
    { name: 'To Do', count: stats?.todoCount || 0, fill: '#6366f1' },
    { name: 'In Progress', count: stats?.inProgressCount || 0, fill: '#818cf8' },
    { name: 'Review', count: stats?.reviewCount || 0, fill: '#f59e0b' },
    { name: 'Done', count: stats?.doneCount || 0, fill: '#10b981' },
  ];

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects, icon: <FolderOpen size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
    { label: 'Active Projects', value: stats?.activeProjects, icon: <TrendingUp size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    { label: 'Total Tasks', value: stats?.totalTasks, icon: <ListTodo size={22} />, color: '#818cf8', bg: 'rgba(129,140,248,0.15)' },
    { label: 'Completed', value: stats?.doneCount, icon: <CheckCircle size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    { label: 'In Progress', value: stats?.inProgressCount, icon: <Clock size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { label: 'Overdue', value: stats?.overdueCount, icon: <AlertTriangle size={22} />, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">👋 Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Here's what's happening with your projects today.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <div className="value" style={{ color: s.color }}>{s.value ?? 0}</div>
              <div className="label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="chart-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="chart-card">
          <div className="chart-title">Task Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Tasks by Status</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* My Tasks + Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>My Pending Tasks</h3>
          {!myTasks?.length
            ? <div className="empty-state" style={{ padding: '2rem' }}><div className="empty-state-icon">🎉</div><p>All caught up!</p></div>
            : myTasks.map((t) => (
              <Link key={t._id} to={`/tasks/${t._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={`task-card card-sm ${isOverdue(t.dueDate, t.status) ? 'overdue' : ''}`} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span className="task-title">{t.title}</span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div className="task-meta">
                    <span className="task-meta-item">{t.project?.name}</span>
                    {t.dueDate && <span className={`task-meta-item ${isOverdue(t.dueDate, t.status) ? '' : ''}`} style={isOverdue(t.dueDate, t.status) ? { color: 'var(--danger)' } : {}}>📅 {fmtDate(t.dueDate)}</span>}
                  </div>
                </div>
              </Link>
            ))
          }
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Recent Tasks</h3>
          {!recentTasks?.length
            ? <div className="empty-state" style={{ padding: '2rem' }}><div className="empty-state-icon">📋</div><p>No tasks yet</p></div>
            : recentTasks.slice(0, 6).map((t) => (
              <Link key={t._id} to={`/tasks/${t._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="task-card card-sm" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div className="task-title" style={{ fontSize: '0.82rem' }}>{t.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t.project?.name}</div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              </Link>
            ))
          }
        </div>
      </div>
    </div>
  );
}
