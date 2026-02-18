import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Chrome, Phone, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// View states: 'login' | 'signup' | 'forgot' | 'reset-sent'
const Login = () => {
    const [view, setView] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (view === 'login') {
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

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await resetPassword(resetEmail);
            setView('reset-sent');
        } catch (error) {
            setError(error.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const switchView = (v) => {
        setView(v);
        setError('');
        setEmail('');
        setPassword('');
        setResetEmail('');
    };

    // ── Forgot Password Form ─────────────────────────────────────────────────
    if (view === 'forgot') {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="card p-8 animate-fade-in bg-gray-900/50 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)' }}>
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 corner-clip-sm mb-4 border-2 border-cyan-500/50"
                                style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}>
                                <KeyRound className="w-8 h-8 text-white" style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.8))' }} />
                            </div>
                            <h2 className="text-3xl font-black text-cyan-400 mb-2 uppercase tracking-wide"
                                style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0,255,255,0.6)' }}>
                                Reset Password
                            </h2>
                            <p className="text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Enter your email and we'll send you a reset link
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500/50 corner-clip-sm text-red-400 text-sm animate-fade-in font-bold"
                                style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(255,0,0,0.3)' }}>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide"
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="you@example.com"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        {/* Back to login */}
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => switchView('login')}
                                className="inline-flex items-center gap-2 text-sm font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-wide transition-colors"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Reset Email Sent Confirmation ────────────────────────────────────────
    if (view === 'reset-sent') {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="card p-8 animate-fade-in bg-gray-900/50 border-2 border-green-500/40 text-center"
                        style={{ boxShadow: '0 0 30px rgba(0,255,0,0.2)' }}>
                        {/* Success icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 corner-clip mb-6 border-2 border-green-500/50 mx-auto"
                            style={{ boxShadow: '0 0 30px rgba(0,255,0,0.5)' }}>
                            <CheckCircle className="w-10 h-10 text-white" style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.8))' }} />
                        </div>

                        <h2 className="text-3xl font-black text-green-400 mb-3 uppercase tracking-wide"
                            style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0,255,0,0.6)' }}>
                            Email Sent!
                        </h2>
                        <p className="text-gray-300 font-bold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            A password reset link has been sent to:
                        </p>
                        <p className="text-cyan-400 font-black text-lg mb-6 break-all"
                            style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
                            {resetEmail}
                        </p>
                        <p className="text-gray-400 text-sm font-bold mb-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Check your inbox and follow the link to reset your password. The link expires in 1 hour.
                        </p>

                        <button
                            onClick={() => switchView('login')}
                            className="btn-primary w-full"
                        >
                            Back to Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Login / Sign Up Form ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="card p-8 animate-fade-in bg-gray-900/50 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)' }}>
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-magenta-500 corner-clip-sm mb-4 border-2 border-cyan-500/50"
                            style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}>
                            <UserIcon className="w-8 h-8 text-white" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))' }} />
                        </div>
                        <h2 className="text-3xl font-black text-cyan-400 mb-2 uppercase tracking-wide"
                            style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>
                            {view === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {view === 'login' ? 'Sign in to your account' : 'Sign up to get started'}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500/50 corner-clip-sm text-red-400 text-sm animate-fade-in font-bold"
                            style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)' }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {view === 'signup' && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
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
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
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
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
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
                            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
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

                        {/* Remember me + Forgot password */}
                        {view === 'login' && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-cyan-500 border-gray-600 rounded focus:ring-cyan-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-300 font-bold"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        Remember me
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => switchView('forgot')}
                                    className="text-sm font-black text-cyan-400 hover:text-cyan-300 transition-colors"
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : view === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-cyan-500/30"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-900 text-gray-400 font-bold uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 border-2 border-cyan-500/50 corner-clip-sm font-black text-gray-300 hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                        style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)' }}
                    >
                        <Chrome className="w-5 h-5" />
                        <span>Google</span>
                    </button>

                    {/* Toggle Login/Signup */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                onClick={() => switchView(view === 'login' ? 'signup' : 'login')}
                                className="font-black text-cyan-400 hover:text-cyan-300"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                            >
                                {view === 'login' ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-gray-300 hover:text-cyan-400 font-bold uppercase tracking-wide"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
