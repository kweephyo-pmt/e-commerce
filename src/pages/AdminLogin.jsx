import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Shield, ArrowLeft } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    // If already logged in as admin, redirect to dashboard
    useEffect(() => {
        if (user && isAdmin) {
            navigate('/admin/dashboard');
        }
    }, [user, isAdmin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Use Firebase auth directly to bypass customer login restrictions
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Check if user is admin
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

            if (!userDoc.exists()) {
                setError('User account not found. Please contact support.');
                await auth.signOut(); // Sign out if not found
                setLoading(false);
                return;
            }

            const userData = userDoc.data();

            if (userData.isAdmin !== true) {
                setError('Access denied. This account does not have admin privileges.');
                await auth.signOut(); // Sign out if not admin
                setLoading(false);
                return;
            }

            // User is admin, will be redirected by useEffect
        } catch (error) {
            if (error.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please check your credentials and try again.');
            } else if (error.code === 'auth/user-not-found') {
                setError('No account found with this email address.');
            } else if (error.code === 'auth/wrong-password') {
                setError('Incorrect password. Please try again.');
            } else if (error.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
            } else {
                setError(error.message || 'An error occurred. Please try again.');
            }
            console.error('Admin login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f172a] to-[#1a1f3a] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated background effects */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-magenta-500 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl p-8 sm:p-10 animate-fade-in border-2 border-magenta-500/30 corner-clip relative overflow-hidden" style={{ boxShadow: '0 0 60px rgba(255, 0, 255, 0.4), inset 0 0 40px rgba(255, 0, 255, 0.05)' }}>
                    {/* Background scan lines */}
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 255, 0.1) 2px, rgba(255, 0, 255, 0.1) 4px)' }}></div>

                    {/* Header */}
                    <div className="text-center mb-8 relative z-10">
                        <div className="inline-flex items-center justify-center w-24 h-24 border-2 border-magenta-500/50 corner-clip mb-6 relative" style={{ boxShadow: '0 0 40px rgba(255, 0, 255, 0.2)' }}>
                            <Shield className="w-12 h-12 text-magenta-400" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 0, 255, 0.5))' }} />
                            {/* Pulsing ring */}
                            <div className="absolute inset-0 corner-clip border-2 border-magenta-400/50 animate-ping"></div>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-magenta-400 mb-2 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(255, 0, 255, 1), 0 0 40px rgba(255, 0, 255, 0.6)' }}>
                            Admin Access
                        </h2>
                        <p className="text-cyan-300 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                            Authorized Personnel Only
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/50 corner-clip-sm text-red-400 text-sm animate-fade-in relative overflow-hidden" style={{ boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)' }}>
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent"></div>
                            <p className="relative z-10 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-sm font-black text-cyan-400 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                                Admin Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border-2 border-cyan-500/50 corner-clip-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all duration-200 font-bold"
                                    style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(0, 255, 255, 0.05)' }}
                                    placeholder="admin@gamezone.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-cyan-400 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border-2 border-cyan-500/50 corner-clip-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all duration-200 font-bold"
                                    style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(0, 255, 255, 0.05)' }}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-magenta-600 to-purple-600 hover:from-magenta-500 hover:to-purple-500 text-white font-black py-3 px-6 corner-clip-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider relative overflow-hidden group"
                            style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 30px rgba(255, 0, 255, 0.5)' }}
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <span className="relative z-10">{loading ? 'Authenticating...' : 'Enter Admin Zone'}</span>
                        </button>
                    </form>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-magenta-500/10 to-purple-500/10 border-2 border-magenta-500/30 corner-clip-sm relative overflow-hidden" style={{ boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-magenta-500/5 to-transparent"></div>
                        <div className="flex items-start space-x-3 relative z-10">
                            <Shield className="w-5 h-5 text-magenta-400 mt-0.5 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 0, 255, 0.8))' }} />
                            <div className="text-sm">
                                <p className="font-black mb-1 text-magenta-400 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Security Clearance Required</p>
                                <p className="text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    Only authorized administrators can access this restricted area. Your account must have admin privileges.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-6 relative z-10">
                        <Link
                            to="/"
                            className="inline-flex items-center space-x-2 text-cyan-300 hover:text-cyan-400 font-bold uppercase tracking-wide transition-all duration-200 p-3 corner-clip-sm hover:bg-cyan-500/10 border-2 border-transparent hover:border-cyan-500/30"
                            style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }}
                        >
                            <ArrowLeft className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 255, 255, 0.8))' }} />
                            <span>Back to Store</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
