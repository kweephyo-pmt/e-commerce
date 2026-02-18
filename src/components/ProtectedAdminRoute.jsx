import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedAdminRoute = ({ children }) => {
    const { user, isAdmin, adminChecking } = useAuth();

    // Still waiting for the Firestore admin check — show a themed spinner
    if (adminChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e27] via-[#0f172a] to-[#1a1f3a]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-14 w-14 border-t-4 border-b-4 border-cyan-400 rounded-full"
                        style={{ boxShadow: '0 0 30px rgba(0,255,255,0.6)' }} />
                    <p className="text-cyan-400 text-xs font-black uppercase tracking-widest"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>Verifying Access...</p>
                </div>
            </div>
        );
    }

    // Not logged in or not an admin → redirect
    if (!user || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedAdminRoute;
