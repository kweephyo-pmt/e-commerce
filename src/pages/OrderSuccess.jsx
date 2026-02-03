import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home, ShoppingBag } from 'lucide-react';

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
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Success Animation */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 animate-bounce">
                        <CheckCircle className="w-16 h-16 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Order <span className="text-gradient">Confirmed!</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                        Thank you for your purchase! 🎉
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="card p-8 mb-6 animate-slide-up">
                    <div className="border-b border-gray-200 pb-6 mb-6">
                        <h2 className="text-2xl font-bold mb-2">Order Details</h2>
                        <p className="text-gray-600">
                            We've sent a confirmation email with your order details.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                                <p className="font-mono font-bold text-lg">#{orderId.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <Package className="w-8 h-8 text-blue-600" />
                        </div>

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                <p className="font-bold text-2xl text-green-600">฿{orderTotal?.toFixed(2)}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* What's Next */}
                <div className="card p-8 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                        <Truck className="w-6 h-6 text-blue-600" />
                        <span>What's Next?</span>
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold">1</span>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Order Processing</h4>
                                <p className="text-sm text-gray-600">
                                    We're preparing your items for shipment.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold">2</span>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Shipping Confirmation</h4>
                                <p className="text-sm text-gray-600">
                                    You'll receive a tracking number via email within 24 hours.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold">3</span>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Delivery</h4>
                                <p className="text-sm text-gray-600">
                                    Expected delivery in 3-5 business days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid sm:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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
                <div className="text-center mt-8">
                    <Link
                        to="/"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                        <Home className="w-5 h-5" />
                        <span>Back to Home</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
