import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner page />;
  return user ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <Spinner page />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner page />;
  return !user ? children : <Navigate to="/" replace />;
}
