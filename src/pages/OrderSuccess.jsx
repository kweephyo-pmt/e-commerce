import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home, ShoppingBag, Zap, Trophy } from 'lucide-react';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, orderTotal } = location.state || {};

    useEffect(() => {
        // If no order data, redirect to home
        if (!orderId) {
            navigate('/');
        }
    }, [orderId, navigate]);

    if (!orderId) {
        return null;
    }`  `

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f172a] to-[#1a1f3a] py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Success Animation */}
                <div className="text-center mb-10 sm:mb-12 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-500 to-green-500 corner-clip mb-6 sm:mb-8 relative" style={{ boxShadow: '0 0 60px rgba(0, 255, 255, 0.6), 0 0 100px rgba(0, 255, 0, 0.3)' }}>
                        <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-white animate-pulse" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 1))' }} />
                        {/* Pulsing rings */}
                        <div className="absolute inset-0 corner-clip border-4 border-cyan-400 animate-ping"></div>
                        <div className="absolute -inset-4 corner-clip border-2 border-green-400 animate-ping" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        <span className="text-cyan-400" style={{ textShadow: '0 0 30px rgba(0, 255, 255, 1), 0 0 60px rgba(0, 255, 255, 0.6)' }}>Order </span>
                        <span className="text-gradient" style={{ textShadow: '0 0 30px rgba(0, 255, 0, 0.8)' }}>Confirmed!</span>
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-cyan-300 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                        Victory! Your order is locked in! 🎮🎉
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm p-6 sm:p-8 mb-6 animate-slide-up border-2 border-cyan-500/30 corner-clip relative overflow-hidden" style={{ boxShadow: '0 0 40px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.05)' }}>
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)' }}></div>

                    <div className="border-b-2 border-cyan-500/30 pb-6 mb-6 relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-black mb-2 text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 0.8)' }}>
                            Order Details
                        </h2>
                        <p className="text-gray-300 font-bold text-base sm:text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Confirmation email dispatched to your inbox! 📧
                        </p>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 corner-clip-sm border-2 border-cyan-500/50 relative overflow-hidden" style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent"></div>
                            <div className="relative z-10 flex-1">
                                <p className="text-xs sm:text-sm text-gray-400 mb-1 uppercase tracking-wide font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Order Number</p>
                                <p className="font-mono font-black text-lg sm:text-xl text-cyan-400" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.8)' }}>#{orderId.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 relative z-10" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))' }} />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 bg-gradient-to-r from-green-500/10 to-cyan-500/10 corner-clip-sm border-2 border-green-500/50 relative overflow-hidden" style={{ boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)' }}>
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent"></div>
                            <div className="relative z-10 flex-1">
                                <p className="text-xs sm:text-sm text-gray-400 mb-1 uppercase tracking-wide font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Amount</p>
                                <p className="font-black text-2xl sm:text-3xl text-gradient" style={{ textShadow: '0 0 20px rgba(0, 255, 0, 0.8)' }}>฿{orderTotal?.toFixed(2)}</p>
                            </div>
                            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 relative z-10" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 0, 0.8))' }} />
                        </div>
                    </div>
                </div>

                {/* What's Next */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm p-6 sm:p-8 mb-6 animate-slide-up border-2 border-magenta-500/30 corner-clip relative overflow-hidden" style={{ animationDelay: '0.1s', boxShadow: '0 0 40px rgba(255, 0, 255, 0.3), inset 0 0 30px rgba(255, 0, 255, 0.05)' }}>
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 255, 0.1) 2px, rgba(255, 0, 255, 0.1) 4px)' }}></div>

                    <h3 className="text-xl sm:text-2xl font-black mb-6 sm:mb-8 flex items-center space-x-2 text-magenta-400 uppercase tracking-wide relative z-10" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(255, 0, 255, 0.8)' }}>
                        <Truck className="w-6 h-6 sm:w-7 sm:h-7" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 0, 255, 0.8))' }} />
                        <span>Mission Progress</span>
                    </h3>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 corner-clip-sm flex items-center justify-center border-2 border-cyan-500/50" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                                <span className="text-white font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>1</span>
                            </div>
                            <div>
                                <h4 className="font-black mb-1 text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem' }}>Order Processing</h4>
                                <p className="text-sm text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    Preparing your gear for deployment.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 corner-clip-sm flex items-center justify-center border-2 border-cyan-500/50" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                                <span className="text-white font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>2</span>
                            </div>
                            <div>
                                <h4 className="font-black mb-1 text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem' }}>Shipping Confirmation</h4>
                                <p className="text-sm text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    Tracking code incoming within 24 hours.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 corner-clip-sm flex items-center justify-center border-2 border-cyan-500/50" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                                <span className="text-white font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>3</span>
                            </div>
                            <div>
                                <h4 className="font-black mb-1 text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem' }}>Delivery</h4>
                                <p className="text-sm text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    ETA: 3-5 business days. Game on! 🚀
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid sm:grid-cols-2 gap-4 animate-slide-up mb-6" style={{ animationDelay: '0.2s' }}>
                    <Link
                        to="/orders"
                        className="btn-primary text-center flex items-center justify-center space-x-2"
                    >
                        <Package className="w-5 h-5" />
                        <span>View Order Details</span>
                    </Link>
                    <Link
                        to="/products"
                        className="btn-secondary text-center flex items-center justify-center space-x-2"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        <span>Continue Shopping</span>
                    </Link>
                </div>

                {/* Back to Home */}
                <div className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <Link
                        to="/"
                        className="inline-flex items-center space-x-2 text-cyan-300 hover:text-cyan-400 transition-all duration-200 font-bold uppercase tracking-wide p-3 corner-clip-sm hover:bg-cyan-500/10 border-2 border-transparent hover:border-cyan-500/30"
                        style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }}
                    >
                        <Home className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 255, 255, 0.8))' }} />
                        <span>Back to Home</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
