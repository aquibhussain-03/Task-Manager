import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>⚡ TaskFlow</h1>
        <p>Team Task Manager</p>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Main</span>
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={17} /> Dashboard
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FolderKanban size={17} /> Projects
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <CheckSquare size={17} /> Tasks
        </NavLink>

        {isAdmin && (
          <>
            <span className="nav-section-label">Admin</span>
            <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={17} /> Users
            </NavLink>
          </>
        )}

        <span className="nav-section-label">Account</span>
        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <User size={17} /> Profile
        </NavLink>
        <button className="nav-link btn" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', color: 'var(--danger)' }} onClick={handleLogout}>
          <LogOut size={17} /> Logout
        </button>
      </nav>

      <div className="sidebar-user">
        <div className={`avatar avatar-placeholder`}>
          {user?.avatar
            ? <img src={user.avatar} alt={user.name} className="avatar" />
            : getInitials(user?.name)}
        </div>
        <div className="sidebar-user-info">
          <div className="name">{user?.name}</div>
          <div className="role">{user?.role}</div>
        </div>
      </div>
    </aside>
  );
}
