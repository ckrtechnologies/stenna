import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Optional: add strict role checking if needed, but Login handles routing based on role
    if (user.role !== 'admin' && user.role !== 'WA_InventoryManager') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white', flexDirection: 'column' }}>
                <p>Unauthorized Access. You need the WA_InventoryManager or Admin role.</p>
                <a href="/login" style={{ color: '#2563eb', marginTop: '1rem' }}>Back to Login</a>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
