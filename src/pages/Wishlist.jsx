import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Wishlist = () => {
    const { wishlist, toggleWishlist } = useWishlist();
    const { addToCart, cartItems } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch full product data for each wishlisted ID
    useEffect(() => {
        const fetchProducts = async () => {
            if (!wishlist.length) { setProducts([]); setLoading(false); return; }
            setLoading(true);
            try {
                const fetched = await Promise.all(
                    wishlist.map(async (id) => {
                        const snap = await getDoc(doc(db, 'products', id));
                        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
                    })
                );
                setProducts(fetched.filter(Boolean));
            } catch (err) {
                console.error('Error fetching wishlist products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [wishlist]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-gray-900 border-2 border-magenta-500/40 corner-clip flex items-center justify-center mx-auto"
                        style={{ boxShadow: '0 0 30px rgba(255,0,255,0.2)' }}>
                        <Heart className="w-10 h-10 text-magenta-400" style={{ filter: 'drop-shadow(0 0 8px rgba(255,0,255,0.8))' }} />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        Sign In Required
                    </h2>
                    <p className="text-gray-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Sign in to view and manage your wishlist
                    </p>
                    <Link to="/login" className="btn-primary inline-block">Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wide mb-6 transition-colors"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-900 border-2 border-magenta-500/50 corner-clip-sm flex items-center justify-center"
                        style={{ boxShadow: '0 0 20px rgba(255,0,255,0.2)' }}>
                        <Heart className="w-6 h-6 text-magenta-400 fill-magenta-400" style={{ filter: 'drop-shadow(0 0 5px rgba(255,0,255,0.5))' }} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-wide"
                            style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(255,0,255,0.4)' }}>
                            Wishlist
                        </h1>
                        <p className="text-magenta-400 font-bold text-sm uppercase tracking-widest"
                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                        </p>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-24">
                    <div className="w-12 h-12 border-4 border-magenta-500/30 border-t-magenta-400 rounded-full animate-spin"
                        style={{ boxShadow: '0 0 20px rgba(255,0,255,0.3)' }} />
                </div>
            )}

            {/* Empty */}
            {!loading && products.length === 0 && (
                <div className="text-center py-24 space-y-6">
                    <div className="w-24 h-24 bg-gray-900 border-2 border-gray-700 corner-clip flex items-center justify-center mx-auto">
                        <Heart className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-400 uppercase tracking-wide"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        Your wishlist is empty
                    </h3>
                    <p className="text-gray-500 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Browse products and click the ♥ to save items here
                    </p>
                    <Link to="/products" className="btn-primary inline-block">Browse Products</Link>
                </div>
            )}

            {/* Grid */}
            {!loading && products.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const cartItem = cartItems.find(i => i.id === product.id);
                        const inCart = cartItem?.quantity > 0;
                        const outOfStock = !product.stock || product.stock === 0;
                        const discountedPrice = product.discount
                            ? product.price * (1 - product.discount / 100)
                            : product.price;

                        return (
                            <div key={product.id}
                                className="bg-gray-900 border border-cyan-500/20 corner-clip overflow-hidden group animate-fade-in hover:border-cyan-500/50 transition-all duration-300"
                                style={{ boxShadow: '0 0 20px rgba(0,255,255,0.05)' }}>

                                {/* Image */}
                                <div className="relative h-52 overflow-hidden bg-gray-800 cursor-pointer"
                                    onClick={() => navigate(`/product/${product.id}`)}>
                                    <img src={product.image} alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    {product.discount > 0 && (
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-black px-2 py-1 corner-clip-sm">
                                            -{product.discount}%
                                        </div>
                                    )}
                                    {outOfStock && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-red-400 font-black uppercase tracking-widest text-sm border border-red-500/50 px-3 py-1 corner-clip-sm"
                                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>Out of Stock</span>
                                        </div>
                                    )}
                                    {/* Remove from wishlist */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center corner-clip-sm bg-gray-900/90 border border-magenta-500/60 text-magenta-400 hover:bg-red-500/20 hover:border-red-400 hover:text-red-400 transition-all duration-200"
                                        title="Remove from wishlist"
                                        style={{ boxShadow: '0 0 10px rgba(255,0,255,0.3)' }}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="p-4 space-y-3">
                                    <div>
                                        <span className="text-xs font-black text-cyan-400 uppercase tracking-widest"
                                            style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 8px rgba(0,255,255,0.5)' }}>
                                            {product.category}
                                        </span>
                                        <h3 className="text-white font-black text-sm mt-1 line-clamp-2 group-hover:text-cyan-400 transition-colors cursor-pointer"
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                            onClick={() => navigate(`/product/${product.id}`)}>
                                            {product.name}
                                        </h3>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-gradient">
                                            ฿{discountedPrice.toFixed(2)}
                                        </span>
                                        {product.discount > 0 && (
                                            <span className="text-sm text-gray-500 line-through">
                                                ฿{product.price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        onClick={() => !outOfStock && addToCart(product)}
                                        disabled={outOfStock}
                                        className={`w-full flex items-center justify-center gap-2 py-2.5 corner-clip-sm font-black text-sm uppercase tracking-wide transition-all duration-200 border-2
                                            ${outOfStock
                                                ? 'opacity-40 cursor-not-allowed bg-gray-700 border-gray-600 text-gray-400'
                                                : inCart
                                                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30'
                                                    : 'bg-gradient-to-r from-cyan-600 to-magenta-600 border-cyan-500/50 text-white hover:from-cyan-500 hover:to-magenta-500 hover:border-cyan-400'
                                            }`}
                                        style={!outOfStock ? { boxShadow: '0 0 15px rgba(0,255,255,0.3)', fontFamily: 'Rajdhani, sans-serif' } : { fontFamily: 'Rajdhani, sans-serif' }}
                                    >
                                        {inCart ? (
                                            <><Package className="w-4 h-4" /> In Cart ({cartItem.quantity})</>
                                        ) : (
                                            <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
