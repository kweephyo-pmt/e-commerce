import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="relative">
                    <div className="animate-spin corner-clip h-16 w-16 border-t-4 border-b-4 border-cyan-400" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.6)' }}></div>
                    <div className="absolute inset-0 corner-clip border-2 border-magenta-400 animate-ping"></div>
                </div>
            </div>
        );
    }

    // Check for both user and explicit admin status
    if (!user || !isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
