import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, AdminRoute, GuestRoute } from './components/RouteGuards';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' },
            success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
          }}
        />
        <Routes>
          {/* Guest only */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* Protected */}
          <Route path="/" element={<PrivateRoute><AppLayout><DashboardPage /></AppLayout></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><AppLayout><ProjectsPage /></AppLayout></PrivateRoute>} />
          <Route path="/projects/:id" element={<PrivateRoute><AppLayout><ProjectDetailPage /></AppLayout></PrivateRoute>} />
          <Route path="/tasks" element={<PrivateRoute><AppLayout><TasksPage /></AppLayout></PrivateRoute>} />
          <Route path="/tasks/:id" element={<PrivateRoute><AppLayout><TaskDetailPage /></AppLayout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><AppLayout><ProfilePage /></AppLayout></PrivateRoute>} />

          {/* Admin only */}
          <Route path="/users" element={<AdminRoute><AppLayout><UsersPage /></AppLayout></AdminRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
