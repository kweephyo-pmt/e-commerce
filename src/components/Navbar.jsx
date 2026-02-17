import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Shield, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, signOut } = useAuth();
    const { getCartItemsCount } = useCart();
    const { isAdmin } = useAdmin();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#0a0e27] via-[#0f172a] to-[#0a0e27] border-b-2 border-cyan-500/30 relative overflow-hidden" style={{ boxShadow: '0 0 40px rgba(0, 255, 255, 0.3), 0 10px 50px rgba(0, 0, 0, 0.8), inset 0 -2px 20px rgba(0, 255, 255, 0.15)' }}>
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 opacity-50 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse" style={{ animation: 'shimmer 3s infinite linear' }}></div>
            </div>

            {/* Scan line effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="h-full w-full" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
                    animation: 'scan 8s linear infinite'
                }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex justify-between items-center h-20">
                    {/* Left: Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6 flex-1">
                        <Link to="/" className="text-cyan-300 hover:text-cyan-400 font-bold uppercase tracking-wide transition-all duration-200 relative group px-3 py-2" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }}>
                            Home
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-magenta-500 group-hover:w-full transition-all duration-300" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 1)' }}></span>
                            <span className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-all duration-200 -z-10 corner-clip-sm"></span>
                        </Link>
                        <Link to="/products" className="text-cyan-300 hover:text-cyan-400 font-bold uppercase tracking-wide transition-all duration-200 relative group px-3 py-2" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }}>
                            Products
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-magenta-500 group-hover:w-full transition-all duration-300" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 1)' }}></span>
                            <span className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-all duration-200 -z-10 corner-clip-sm"></span>
                        </Link>
                        {user && (
                            <Link to="/orders" className="text-cyan-300 hover:text-cyan-400 font-bold uppercase tracking-wide transition-all duration-200 relative group px-3 py-2" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }}>
                                Orders
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-magenta-500 group-hover:w-full transition-all duration-300" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 1)' }}></span>
                                <span className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-all duration-200 -z-10 corner-clip-sm"></span>
                            </Link>
                        )}
                        {isAdmin && (
                            <Link to="/admin/dashboard" className="text-magenta-300 hover:text-magenta-400 font-bold uppercase tracking-wide transition-all duration-200 flex items-center space-x-1 relative group px-3 py-2" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem', textShadow: '0 0 10px rgba(255, 0, 255, 0.3)' }}>
                                <Shield className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 0, 255, 1))' }} />
                                <span>Admin</span>
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-magenta-500 to-purple-500 group-hover:w-full transition-all duration-300" style={{ boxShadow: '0 0 15px rgba(255, 0, 255, 1)' }}></span>
                                <span className="absolute inset-0 bg-magenta-500/0 group-hover:bg-magenta-500/10 transition-all duration-200 -z-10 corner-clip-sm"></span>
                            </Link>
                        )}
                    </div>

                    {/* Center: Logo */}
                    <Link to="/" className="flex items-center space-x-3 group relative mx-auto md:mx-0">
                        {/* Glow effect behind logo */}
                        <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>

                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-magenta-500 corner-clip-sm flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border-2 border-cyan-500/50 relative" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.7), inset 0 0 20px rgba(255, 255, 255, 0.2)' }}>
                            <Gamepad2 className="w-7 h-7 text-white" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 1))' }} />
                            {/* Pulsing ring */}
                            <div className="absolute inset-0 corner-clip-sm border-2 border-cyan-400 animate-ping opacity-75"></div>
                        </div>
                        <div className="flex flex-col leading-none relative">
                            <span className="text-2xl font-black uppercase tracking-widest relative" style={{ fontFamily: 'Orbitron, sans-serif', color: '#00ffff', textShadow: '0 0 20px rgba(0, 255, 255, 1), 0 0 40px rgba(0, 255, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.3)' }}>
                                GAME
                                <span className="absolute -inset-1 bg-cyan-500/20 blur-md -z-10"></span>
                            </span>
                            <span className="text-base font-bold uppercase tracking-widest relative" style={{ fontFamily: 'Orbitron, sans-serif', color: '#ff00ff', textShadow: '0 0 15px rgba(255, 0, 255, 1), 0 0 30px rgba(255, 0, 255, 0.6)' }}>
                                ZONE
                                <span className="absolute -inset-1 bg-magenta-500/20 blur-md -z-10"></span>
                            </span>
                        </div>
                    </Link>

                    {/* Right: Action Icons */}
                    <div className="flex items-center space-x-3 flex-1 justify-end">
                        {/* Cart */}
                        <Link to="/cart" className="relative group">
                            <div className="p-2.5 corner-clip-sm hover:bg-cyan-500/20 transition-all duration-200 border-2 border-transparent hover:border-cyan-500/50 relative" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)' }}>
                                <ShoppingCart className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200 group-hover:scale-110 transform" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.6))' }} />
                                {/* Hover glow effect */}
                                <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/20 transition-all duration-200 corner-clip-sm -z-10 blur-sm"></div>
                                {getCartItemsCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-500 to-magenta-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse" style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 20px rgba(0, 255, 255, 1)' }}>
                                        {getCartItemsCount()}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* User Menu */}
                        {user ? (
                            <div className="hidden md:flex items-center space-x-2">
                                <Link to="/profile" className="p-2.5 corner-clip-sm hover:bg-cyan-500/20 transition-all duration-200 border-2 border-transparent hover:border-cyan-500/50 group relative" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)' }}>
                                    <User className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200 group-hover:scale-110 transform" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.6))' }} />
                                    <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/20 transition-all duration-200 corner-clip-sm -z-10 blur-sm"></div>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="p-2.5 corner-clip-sm hover:bg-red-500/20 transition-all duration-200 border-2 border-transparent hover:border-red-500/50 group relative"
                                    style={{ boxShadow: '0 0 15px rgba(255, 0, 0, 0.2)' }}
                                >
                                    <LogOut className="w-6 h-6 text-red-400 group-hover:text-red-300 transition-colors duration-200 group-hover:scale-110 transform" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 0, 0, 0.6))' }} />
                                    <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/20 transition-all duration-200 corner-clip-sm -z-10 blur-sm"></div>
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="hidden md:block btn-primary text-sm px-6 py-2 uppercase tracking-wider">
                                Sign In
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 corner-clip-sm hover:bg-cyan-500/20 transition-all duration-200 border-2 border-cyan-500/30 hover:border-cyan-500/60"
                            style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)' }}
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6 text-cyan-400" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 255, 255, 0.5))' }} />
                            ) : (
                                <Menu className="w-6 h-6 text-cyan-400" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 255, 255, 0.5))' }} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 animate-fade-in border-t-2 border-cyan-500/20">
                        <div className="flex flex-col space-y-3">
                            <Link
                                to="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-cyan-300 hover:text-cyan-400 font-bold uppercase tracking-wide transition-all duration-200 p-3 corner-clip-sm hover:bg-cyan-500/10 border-2 border-transparent hover:border-cyan-500/30"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                            >
                                Home
                            </Link>
                            <Link
                                to="/products"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-cyan-300 hover:text-cyan-400 font-bold uppercase tracking-wide transition-all duration-200 p-3 corner-clip-sm hover:bg-cyan-500/10 border-2 border-transparent hover:border-cyan-500/30"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                            >
                                Products
                            </Link>
                            {user && (
                                <>
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-cyan-300 hover:text-cyan-400 font-bold uppercase tracking-wide transition-all duration-200 p-3 corner-clip-sm hover:bg-cyan-500/10 border-2 border-transparent hover:border-cyan-500/30"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/orders"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-cyan-300 hover:text-cyan-400 font-bold uppercase tracking-wide transition-all duration-200 p-3 corner-clip-sm hover:bg-cyan-500/10 border-2 border-transparent hover:border-cyan-500/30"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                    >
                                        Orders
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setIsMenuOpen(false);
                                        }}
                                        className="text-red-400 hover:text-red-300 font-bold uppercase tracking-wide transition-all duration-200 p-3 corner-clip-sm hover:bg-red-500/10 border-2 border-transparent hover:border-red-500/30 text-left flex items-center space-x-2"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                    >
                                        <LogOut className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 3px rgba(255, 0, 0, 0.8))' }} />
                                        <span>Logout</span>
                                    </button>
                                </>
                            )}
                            {!user && (
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-cyan-300 hover:text-cyan-400 font-bold uppercase tracking-wide transition-all duration-200 p-3 corner-clip-sm hover:bg-cyan-500/10 border-2 border-cyan-500/30"
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                >
                                    Sign In
                                </Link>
                            )}
                            {isAdmin && (
                                <Link
                                    to="/admin/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-magenta-300 hover:text-magenta-400 font-bold uppercase tracking-wide transition-all duration-200 flex items-center space-x-2 p-3 corner-clip-sm hover:bg-magenta-500/10 border-2 border-transparent hover:border-magenta-500/30"
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                >
                                    <Shield className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 3px rgba(255, 0, 255, 0.8))' }} />
                                    <span>Admin Dashboard</span>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
