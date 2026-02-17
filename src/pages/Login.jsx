import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Chrome, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password, name, phone);
            }
            navigate(from);
        } catch (error) {
            setError(error.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithGoogle();
            navigate(from);
        } catch (error) {
            setError(error.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="card p-8 animate-fade-in bg-gray-900/50 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)' }}>
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-magenta-500 corner-clip-sm mb-4 border-2 border-cyan-500/50" style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}>
                            <UserIcon className="w-8 h-8 text-white" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))' }} />
                        </div>
                        <h2 className="text-3xl font-black text-cyan-400 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500/50 corner-clip-sm text-red-400 text-sm animate-fade-in font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)' }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="input-field pl-10"
                                            placeholder="John Doe"
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="input-field pl-10"
                                            placeholder="+1 (555) 123-4567"
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
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

                        {isLogin && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-cyan-500 border-gray-600 rounded focus:ring-cyan-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Remember me</span>
                                </label>
                                <a href="#" className="text-sm font-bold text-cyan-400 hover:text-cyan-300" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    Forgot password?
                                </a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-cyan-500/30"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-900 text-gray-400 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 border-2 border-cyan-500/50 corner-clip-sm font-black text-gray-300 hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)' }}
                    >
                        <Chrome className="w-5 h-5" />
                        <span>Google</span>
                    </button>

                    {/* Toggle Login/Signup */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="font-black text-cyan-400 hover:text-cyan-300" style={{ fontFamily: 'Rajdhani, sans-serif' }}
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-gray-300 hover:text-cyan-400 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
