import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from './AdminLayout';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user || user.role !== 'admin') return <Navigate to="/login" />;

    return <AdminLayout>{children}</AdminLayout>;
};

export default ProtectedRoute;
