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
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 corner-clip mb-6 border-2 border-cyan-500/50" style={{ boxShadow: '0 0 40px rgba(0, 255, 255, 0.3)' }}>
                        <ShoppingBag className="w-16 h-16 text-cyan-400" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))' }} />
                    </div>
                    <h2 className="text-4xl font-bold mb-4 text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>Your cart is empty</h2>
                    <p className="text-gray-400 mb-8 text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Add some products to get started!</p>
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
                    <h1 className="text-5xl font-black mb-3 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.8)' }}>Shopping</span>{' '}
                        <span className="text-magenta-400" style={{ textShadow: '0 0 20px rgba(255, 0, 255, 0.8)' }}>Cart</span>
                    </h1>
                    <p className="text-cyan-300 text-lg font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="card p-6 flex flex-col sm:flex-row gap-6 animate-fade-in border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all"
                                style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)' }}
                            >
                                {/* Product Image */}
                                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 mx-auto sm:mx-0">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover corner-clip-sm border-2 border-cyan-500/30"
                                        style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)' }}
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }}>
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-cyan-400 uppercase tracking-wide font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.category}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 corner-clip-sm transition-all duration-200 border-2 border-transparent hover:border-red-500/50"
                                            style={{ boxShadow: '0 0 10px rgba(255, 0, 0, 0.2)' }}
                                        >
                                            <Trash2 className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 3px rgba(255, 0, 0, 0.8))' }} />
                                        </button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 corner-clip-sm bg-cyan-500/20 hover:bg-cyan-500/30 transition-all duration-200 border-2 border-cyan-500/50"
                                            >
                                                <Minus className="w-4 h-4 text-cyan-400" />
                                            </button>
                                            <span className="w-12 text-center font-bold text-cyan-400 text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.stock && item.quantity >= item.stock}
                                                className={`p-2 corner-clip-sm transition-all duration-200 border-2 ${item.stock && item.quantity >= item.stock
                                                    ? 'bg-gray-600 opacity-50 cursor-not-allowed border-gray-500'
                                                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/50'
                                                    }`}
                                            >
                                                <Plus className="w-4 h-4 text-cyan-400" />
                                            </button>
                                        </div>

                                        {/* Stock warning */}
                                        {item.stock && item.quantity >= item.stock && (
                                            <div className="text-xs text-magenta-400 font-bold uppercase tracking-wide" style={{ textShadow: '0 0 10px rgba(255, 0, 255, 0.8)' }}>
                                                Max stock reached
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gradient">
                                                ฿{((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toFixed(2)}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {item.discount ? (
                                                    <>
                                                        <span className="text-magenta-400 font-bold">฿{(item.price * (1 - item.discount / 100)).toFixed(2)}</span>
                                                        {' '}
                                                        <span className="line-through text-gray-500">฿{item.price.toFixed(2)}</span>
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
                            className="text-red-400 hover:text-red-300 font-bold flex items-center space-x-2 transition-all duration-200 uppercase tracking-wide"
                            style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(255, 0, 0, 0.5)' }}
                        >
                            <Trash2 className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 0, 0, 0.8))' }} />
                            <span>Clear Cart</span>
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-24 animate-fade-in border-2 border-magenta-500/30" style={{ boxShadow: '0 0 30px rgba(255, 0, 255, 0.2)' }}>
                            <h2 className="text-3xl font-black mb-6 text-magenta-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(255, 0, 255, 0.6)' }}>Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-300">
                                    <span className="font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Subtotal</span>
                                    <span className="font-bold text-cyan-400">฿{getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span className="font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Shipping</span>
                                    <span className="font-bold text-cyan-400">FREE</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span className="font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Tax (estimated)</span>
                                    <span className="font-bold text-cyan-400">฿{(getCartTotal() * 0.07).toFixed(2)}</span>
                                </div>

                                <div className="border-t border-cyan-500/30 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-black text-magenta-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>Total</span>
                                        <span className="text-3xl font-black text-gradient" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
