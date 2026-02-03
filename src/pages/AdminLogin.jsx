import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Shield } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="card p-8 animate-fade-in">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gradient mb-2">
                            Admin Login
                        </h2>
                        <p className="text-gray-600">
                            Sign in to access the admin dashboard
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In as Admin'}
                        </button>
                    </form>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-900">
                                <p className="font-semibold mb-1">Admin Access Required</p>
                                <p className="text-blue-700">
                                    Only authorized administrators can access this area. Your account must be marked as admin in the system.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-6">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">
                            ← Back to Store
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
