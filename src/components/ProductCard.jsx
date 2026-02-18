import { ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useProductRating } from '../hooks/useProductRating';

const ProductCard = ({ product }) => {
    const [showAddedMessage, setShowAddedMessage] = useState(false);
    const [heartPop, setHeartPop] = useState(false);
    const [showLoginTip, setShowLoginTip] = useState(false);
    const { addToCart, cartItems } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { rating, reviewCount } = useProductRating(product.id);

    const wishlisted = isWishlisted(product.id);

    // Get quantity of this product in cart
    const cartItem = cartItems.find(item => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!product.stock || product.stock === 0) return;
        if (quantityInCart >= product.stock) return;
        addToCart(product);
        setShowAddedMessage(true);
        setTimeout(() => setShowAddedMessage(false), 2000);
    };

    const handleWishlist = async (e) => {
        e.stopPropagation();
        if (!user) {
            setShowLoginTip(true);
            setTimeout(() => setShowLoginTip(false), 2000);
            return;
        }
        setHeartPop(true);
        setTimeout(() => setHeartPop(false), 300);
        await toggleWishlist(product.id);
    };

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="card group cursor-pointer overflow-hidden transform hover:scale-105 transition-all duration-300 animate-fade-in relative"
        >
            {/* Wishlist Button — always visible, solid bg so it shows on any image */}
            <div className="absolute top-3 right-3 z-10">
                <button
                    onClick={handleWishlist}
                    className={`relative w-10 h-10 flex items-center justify-center transition-all duration-200 ${heartPop ? 'scale-125' : 'scale-100'}`}
                    style={{
                        background: wishlisted
                            ? 'linear-gradient(135deg, rgba(180,0,180,0.9), rgba(100,0,100,0.9))'
                            : 'rgba(8,8,18,0.88)',
                        border: wishlisted ? '2px solid #ff00ff' : '2px solid rgba(0,255,255,0.6)',
                        clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
                        boxShadow: wishlisted
                            ? '0 0 18px rgba(255,0,255,0.8), inset 0 0 10px rgba(255,0,255,0.2)'
                            : '0 0 10px rgba(0,0,0,0.9), 0 0 6px rgba(0,255,255,0.2)',
                        backdropFilter: 'blur(12px)',
                    }}
                    title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart
                        className="w-5 h-5 transition-all duration-200"
                        style={{
                            fill: wishlisted ? '#ff00ff' : 'transparent',
                            color: wishlisted ? '#ff00ff' : '#00ffff',
                            filter: wishlisted
                                ? 'drop-shadow(0 0 6px rgba(255,0,255,1))'
                                : 'drop-shadow(0 0 4px rgba(0,255,255,0.8))',
                        }}
                    />
                </button>
                {/* Login tooltip */}
                {showLoginTip && (
                    <div className="absolute right-0 top-12 w-36 bg-gray-950 border border-cyan-500/50 px-3 py-2 text-xs text-cyan-400 font-bold uppercase tracking-wide whitespace-nowrap animate-fade-in"
                        style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            boxShadow: '0 0 15px rgba(0,255,255,0.2)',
                            clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)',
                        }}>
                        Sign in to save ♥
                    </div>
                )}
            </div>

            {/* Product Image */}
            <div className="relative h-48 sm:h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {product.discount && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-[10px] sm:text-sm font-bold shadow-lg">
                        -{product.discount}%
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 sm:p-6">
                <div className="mb-1 sm:mb-2">
                    <span className="text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                        {product.category}
                    </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors duration-200" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }}>
                    {product.name}
                </h3>

                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {product.description}
                </p>

                {/* Rating */}
                {reviewCount > 0 ? (
                    <div className="flex items-center mb-3 sm:mb-4">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(rating)
                                        ? 'text-cyan-400 fill-current'
                                        : 'text-gray-600'
                                        }`}
                                    style={i < Math.floor(rating) ? { filter: 'drop-shadow(0 0 3px rgba(0, 255, 255, 0.8))' } : {}}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="ml-2 text-sm text-cyan-300 font-semibold">
                            {rating.toFixed(1)} ({reviewCount})
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center mb-4">
                        <span className="text-sm text-gray-500">No reviews yet</span>
                    </div>
                )}

                {/* Price and Add to Cart */}
                <div className="space-y-3">
                    <div>
                        {product.discount ? (
                            <div className="flex items-center space-x-2">
                                <span className="text-xl sm:text-2xl font-bold text-gradient">
                                    ฿{(product.price * (1 - product.discount / 100)).toFixed(2)}
                                </span>
                                <span className="text-[10px] sm:text-sm text-gray-400 line-through">
                                    ฿{product.price.toFixed(2)}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xl sm:text-2xl font-bold text-gradient">
                                ฿{product.price.toFixed(2)}
                            </span>
                        )}
                        {/* Stock indicator */}
                        {product.stock !== undefined && (
                            <div className="mt-1">
                                {product.stock === 0 ? (
                                    <span className="text-xs text-red-400 font-bold uppercase tracking-wide" style={{ textShadow: '0 0 10px rgba(255, 0, 0, 0.8)' }}>Out of Stock</span>
                                ) : product.stock <= 5 ? (
                                    <span className="text-xs text-magenta-400 font-bold uppercase tracking-wide" style={{ textShadow: '0 0 10px rgba(255, 0, 255, 0.8)' }}>Only {product.stock} left</span>
                                ) : (
                                    <span className="text-xs text-cyan-400 font-bold uppercase tracking-wide" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.8)' }}>In Stock</span>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!product.stock || product.stock === 0 || quantityInCart >= product.stock}
                        className={`w-full relative corner-clip-sm py-2.5 sm:py-3.5 px-4 transition-all duration-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${!product.stock || product.stock === 0 || quantityInCart >= product.stock
                            ? 'opacity-50 cursor-not-allowed bg-gray-600 border-2 border-gray-500'
                            : 'bg-gradient-to-r from-cyan-600 to-magenta-600 hover:from-cyan-500 hover:to-magenta-500 border-2 border-cyan-500/50 hover:border-cyan-400 transform hover:scale-[1.02]'
                            }`}
                        style={!product.stock || product.stock === 0 || quantityInCart >= product.stock ? {} : { boxShadow: '0 0 25px rgba(0, 255, 255, 0.5), 0 0 50px rgba(255, 0, 255, 0.25)', fontFamily: 'Rajdhani, sans-serif', fontSize: '0.85rem sm:0.95rem' }}
                    >
                        <ShoppingCart className="w-4 h-4 sm:w-5 h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 1))' }} />
                        <span className="text-white" style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.5)' }}>Add to Cart</span>
                        {quantityInCart > 0 && (
                            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-500 to-magenta-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse border-2 border-white" style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 20px rgba(0, 255, 255, 1)' }}>
                                {quantityInCart}
                            </span>
                        )}
                    </button>
                </div>

                {/* Added to Cart Message */}
                {showAddedMessage && (
                    <div className="mt-3 text-center text-sm font-bold animate-fade-in uppercase tracking-wide" style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.8)', fontFamily: 'Rajdhani, sans-serif' }}>
                        Added to cart!
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
