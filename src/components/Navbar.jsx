import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Shield } from 'lucide-react';
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
        <nav className="glassmorphism sticky top-0 z-50 border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gradient">ShipShop</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                            Home
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                            Products
                        </Link>
                        {user && (
                            <Link to="/orders" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                                Orders
                            </Link>
                        )}
                        {isAdmin && (
                            <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center space-x-1">
                                <Shield className="w-4 h-4" />
                                <span>Admin</span>
                            </Link>
                        )}
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-4">
                        {/* Cart */}
                        <Link to="/cart" className="relative group">
                            <div className="p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                                <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors duration-200" />
                                {getCartItemsCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                        {getCartItemsCount()}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* User Menu */}
                        {user ? (
                            <div className="flex items-center space-x-2">
                                <Link to="/profile" className="p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                                    <User className="w-6 h-6 text-gray-700 hover:text-blue-600 transition-colors duration-200" />
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                >
                                    <LogOut className="w-6 h-6 text-gray-700 hover:text-red-600 transition-colors duration-200" />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn-primary text-sm px-4 py-2">
                                Sign In
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 animate-fade-in">
                        <div className="flex flex-col space-y-4">
                            <Link
                                to="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                            >
                                Home
                            </Link>
                            <Link
                                to="/products"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                            >
                                Products
                            </Link>
                            {user && (
                                <>
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/orders"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                                    >
                                        Orders
                                    </Link>
                                </>
                            )}
                            {isAdmin && (
                                <Link
                                    to="/admin/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center space-x-1"
                                >
                                    <Shield className="w-4 h-4" />
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
