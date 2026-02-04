import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!user) {
            navigate('/login', { state: { from: '/checkout' } });
        } else {
            navigate('/checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
                        <ShoppingBag className="w-16 h-16 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-8">Add some products to get started!</p>
                    <Link to="/products" className="btn-primary inline-flex items-center space-x-2">
                        <span>Continue Shopping</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold mb-2">
                        Shopping <span className="text-gradient">Cart</span>
                    </h1>
                    <p className="text-gray-600">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="card p-6 flex flex-col sm:flex-row gap-6 animate-fade-in"
                            >
                                {/* Product Image */}
                                <div className="w-full sm:w-32 h-32 flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">{item.category}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-semibold">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.stock && item.quantity >= item.stock}
                                                className={`p-2 rounded-lg transition-colors duration-200 ${item.stock && item.quantity >= item.stock
                                                        ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Stock warning */}
                                        {item.stock && item.quantity >= item.stock && (
                                            <div className="text-xs text-orange-600 font-semibold">
                                                Max stock reached
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gradient">
                                                ฿{((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toFixed(2)}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {item.discount ? (
                                                    <>
                                                        <span className="text-red-600 font-semibold">฿{(item.price * (1 - item.discount / 100)).toFixed(2)}</span>
                                                        {' '}
                                                        <span className="line-through text-gray-400">฿{item.price.toFixed(2)}</span>
                                                        {' each'}
                                                    </>
                                                ) : (
                                                    `฿${item.price.toFixed(2)} each`
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Clear Cart Button */}
                        <button
                            onClick={clearCart}
                            className="text-red-600 hover:text-red-700 font-semibold flex items-center space-x-2 transition-colors duration-200"
                        >
                            <Trash2 className="w-5 h-5" />
                            <span>Clear Cart</span>
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-24 animate-fade-in">
                            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">฿{getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-green-600">FREE</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (estimated)</span>
                                    <span className="font-semibold">฿{(getCartTotal() * 0.07).toFixed(2)}</span>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold">Total</span>
                                        <span className="text-3xl font-bold text-gradient">
                                            ฿{(getCartTotal() * 1.07).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="btn-primary w-full mb-4"
                            >
                                Proceed to Checkout
                            </button>

                            <Link
                                to="/products"
                                className="btn-secondary w-full text-center block"
                            >
                                Continue Shopping
                            </Link>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t space-y-3">
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Secure checkout</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Free shipping on orders over ฿1,500</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>30-day return policy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
