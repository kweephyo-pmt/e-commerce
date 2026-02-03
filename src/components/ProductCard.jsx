import { ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProductRating } from '../hooks/useProductRating';

const ProductCard = ({ product }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [showAddedMessage, setShowAddedMessage] = useState(false);
    const { addToCart, cartItems } = useCart();
    const navigate = useNavigate();
    const { rating, reviewCount } = useProductRating(product.id);

    // Get quantity of this product in cart
    const cartItem = cartItems.find(item => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product);
        setShowAddedMessage(true);
        setTimeout(() => setShowAddedMessage(false), 2000);
    };

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="card group cursor-pointer overflow-hidden transform hover:scale-105 transition-all duration-300 animate-fade-in relative"
        >
            {/* Wishlist Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                }}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform duration-200"
            >
                <Heart
                    className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'} transition-colors duration-200`}
                />
            </button>

            {/* Product Image */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {product.discount && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        -{product.discount}%
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-6">
                <div className="mb-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                        {product.category}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {product.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                </p>

                {/* Rating */}
                {reviewCount > 0 ? (
                    <div className="flex items-center mb-4">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                        }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                            {rating.toFixed(1)} ({reviewCount})
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center mb-4">
                        <span className="text-sm text-gray-400">No reviews yet</span>
                    </div>
                )}

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                    <div>
                        {product.discount ? (
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-gradient">
                                    ฿{(product.price * (1 - product.discount / 100)).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                    ฿{product.price.toFixed(2)}
                                </span>
                            </div>
                        ) : (
                            <span className="text-2xl font-bold text-gradient">
                                ฿{product.price.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 relative"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {quantityInCart > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                {quantityInCart}
                            </span>
                        )}
                    </button>
                </div>

                {/* Added to Cart Message */}
                {showAddedMessage && (
                    <div className="mt-3 text-center text-sm text-green-600 font-semibold animate-fade-in">
                        Added to cart!
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
