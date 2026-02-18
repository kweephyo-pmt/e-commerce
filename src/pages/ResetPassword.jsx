import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, KeyRound, ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const oobCode = searchParams.get('oobCode');

    const [view, setView] = useState('loading'); // loading | form | success | error
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password strength
    const checks = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    };
    const strength = Object.values(checks).filter(Boolean).length;
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['', 'text-red-400', 'text-yellow-400', 'text-blue-400', 'text-green-400'][strength];
    const strengthBar = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][strength];

    // Verify the oobCode on mount
    useEffect(() => {
        if (!oobCode) {
            setView('error');
            setError('Invalid or missing reset link. Please request a new one.');
            return;
        }

        verifyPasswordResetCode(auth, oobCode)
            .then((userEmail) => {
                setEmail(userEmail);
                setView('form');
            })
            .catch(() => {
                setView('error');
                setError('This reset link has expired or already been used. Please request a new one.');
            });
    }, [oobCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (strength < 2) {
            setError('Please choose a stronger password.');
            return;
        }

        setLoading(true);
        try {
            await confirmPasswordReset(auth, oobCode, password);
            setView('success');
        } catch (err) {
            if (err.code === 'auth/expired-action-code') {
                setError('This reset link has expired. Please request a new one.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak. Please choose a stronger password.');
            } else {
                setError('Failed to reset password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (view === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto"
                        style={{ boxShadow: '0 0 20px rgba(0,255,255,0.3)' }} />
                    <p className="text-cyan-400 font-black uppercase tracking-widest"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Verifying reset link...
                    </p>
                </div>
            </div>
        );
    }

    // ── Invalid / Expired Link ───────────────────────────────────────────────
    if (view === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    <div className="card p-8 animate-fade-in bg-gray-900/50 border-2 border-red-500/40 text-center"
                        style={{ boxShadow: '0 0 30px rgba(255,0,0,0.2)' }}>
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 corner-clip mb-6 border-2 border-red-500/50 mx-auto"
                            style={{ boxShadow: '0 0 30px rgba(255,0,0,0.5)' }}>
                            <XCircle className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-red-400 mb-3 uppercase tracking-wide"
                            style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(255,0,0,0.6)' }}>
                            Link Invalid
                        </h2>
                        <p className="text-gray-300 font-bold mb-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {error}
                        </p>
                        <Link to="/login" className="btn-primary inline-block">
                            Request New Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Success ──────────────────────────────────────────────────────────────
    if (view === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    <div className="card p-8 animate-fade-in bg-gray-900/50 border-2 border-green-500/40 text-center"
                        style={{ boxShadow: '0 0 30px rgba(0,255,0,0.2)' }}>
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 corner-clip mb-6 border-2 border-green-500/50 mx-auto"
                            style={{ boxShadow: '0 0 30px rgba(0,255,0,0.5)' }}>
                            <CheckCircle className="w-10 h-10 text-white" style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.8))' }} />
                        </div>
                        <h2 className="text-3xl font-black text-green-400 mb-3 uppercase tracking-wide"
                            style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0,255,0,0.6)' }}>
                            Password Reset!
                        </h2>
                        <p className="text-gray-300 font-bold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Your password has been successfully updated.
                        </p>
                        <p className="text-cyan-400 font-black mb-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {email}
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn-primary w-full"
                        >
                            Sign In Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Reset Password Form ──────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="card p-8 animate-fade-in bg-gray-900/50 border-2 border-cyan-500/30"
                    style={{ boxShadow: '0 0 30px rgba(0,255,255,0.3)' }}>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 corner-clip-sm mb-4 border-2 border-cyan-500/50"
                            style={{ boxShadow: '0 0 20px rgba(0,255,255,0.5)' }}>
                            <KeyRound className="w-8 h-8 text-white" style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.8))' }} />
                        </div>
                        <h2 className="text-3xl font-black text-cyan-400 mb-2 uppercase tracking-wide"
                            style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0,255,255,0.6)' }}>
                            New Password
                        </h2>
                        <p className="text-gray-400 font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Resetting password for
                        </p>
                        <p className="text-cyan-400 font-black" style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 8px rgba(0,255,255,0.5)' }}>
                            {email}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500/50 corner-clip-sm text-red-400 text-sm animate-fade-in font-bold"
                            style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(255,0,0,0.3)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10 pr-10"
                                    placeholder="••••••••"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Strength bar */}
                            {password.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i}
                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthBar : 'bg-gray-700'}`} />
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-black uppercase tracking-wide ${strengthColor}`}
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            {strengthLabel}
                                        </span>
                                        <div className="flex gap-3">
                                            {[
                                                { key: 'length', label: '8+ chars' },
                                                { key: 'upper', label: 'A-Z' },
                                                { key: 'lower', label: 'a-z' },
                                                { key: 'number', label: '0-9' },
                                            ].map(({ key, label }) => (
                                                <span key={key}
                                                    className={`text-xs font-bold flex items-center gap-0.5 ${checks[key] ? 'text-green-400' : 'text-gray-600'}`}
                                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                    <ShieldCheck className="w-3 h-3" />
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`input-field pl-10 pr-10 ${confirmPassword.length > 0
                                        ? password === confirmPassword
                                            ? 'border-green-500/50 focus:border-green-400'
                                            : 'border-red-500/50 focus:border-red-400'
                                        : ''}`}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                                >
                                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {confirmPassword.length > 0 && (
                                <p className={`mt-1 text-xs font-bold ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || password !== confirmPassword || strength < 2}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Updating...' : 'Set New Password'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login"
                            className="text-sm font-black text-gray-400 hover:text-cyan-400 uppercase tracking-wide transition-colors"
                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            ← Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
