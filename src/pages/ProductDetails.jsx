import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, onSnapshot, collection, getDocs, query, where, limit, addDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, ArrowLeft, Package, Truck, Shield, Star, MessageSquare, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Toast from '../components/Toast';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImageIdx, setActiveImageIdx] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [toast, setToast] = useState(null);

    // Real-time product listener
    useEffect(() => {
        setLoading(true);
        const docRef = doc(db, 'products', id);

        const unsubscribe = onSnapshot(
            docRef,
            async (docSnap) => {
                if (docSnap.exists()) {
                    const productData = { id: docSnap.id, ...docSnap.data() };
                    setProduct(productData);

                    // Fetch related products once per category (still one-shot is fine here)
                    if (productData.category) {
                        try {
                            const q = query(
                                collection(db, 'products'),
                                where('category', '==', productData.category),
                                limit(4)
                            );
                            const querySnapshot = await getDocs(q);
                            const related = querySnapshot.docs
                                .map(d => ({ id: d.id, ...d.data() }))
                                .filter(p => p.id !== id);
                            setRelatedProducts(related);
                        } catch (err) {
                            console.error('Error fetching related products:', err);
                        }
                    }
                } else {
                    // Product was deleted by admin
                    navigate('/products');
                }
                setLoading(false);
            },
            (error) => {
                console.error('Error listening to product:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [id, navigate]);

    // Reset active image when product changes
    useEffect(() => { setActiveImageIdx(0); setLightboxOpen(false); }, [id]);

    // Keyboard navigation — gallery always, lightbox takes priority when open
    useEffect(() => {
        if (!product) return;
        const imgs = product.images?.length
            ? product.images
            : product.image ? [product.image] : [];
        if (imgs.length <= 1) return; // nothing to navigate

        const handler = (e) => {
            if (e.key === 'Escape') {
                setLightboxOpen(false);
                return;
            }
            if (e.key === 'ArrowRight') {
                if (lightboxOpen) {
                    setLightboxIdx(i => Math.min(i + 1, imgs.length - 1));
                } else {
                    setActiveImageIdx(i => Math.min(i + 1, imgs.length - 1));
                }
            }
            if (e.key === 'ArrowLeft') {
                if (lightboxOpen) {
                    setLightboxIdx(i => Math.max(i - 1, 0));
                } else {
                    setActiveImageIdx(i => Math.max(i - 1, 0));
                }
            }
        };

        window.addEventListener('keydown', handler);
        if (lightboxOpen) document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [lightboxOpen, product]);

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const reviewsQuery = query(
                    collection(db, 'reviews'),
                    where('productId', '==', id),
                    orderBy('createdAt', 'desc')
                );
                const reviewsSnapshot = await getDocs(reviewsQuery);
                const reviewsData = reviewsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate()
                }));
                setReviews(reviewsData);

                // Calculate average rating
                if (reviewsData.length > 0) {
                    const avgRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
                    // Update product with calculated rating
                    if (product) {
                        setProduct(prev => ({
                            ...prev,
                            rating: avgRating,
                            reviews: reviewsData.length
                        }));
                    }
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        if (id) {
            fetchReviews();
        }
    }, [id, product?.id]);

    const handleSubmitReview = async () => {
        if (!user) {
            setToast({ message: 'Please login to submit a review', type: 'error' });
            return;
        }

        if (userRating === 0) {
            setToast({ message: 'Please select a rating', type: 'warning' });
            return;
        }

        if (!userReview.trim()) {
            setToast({ message: 'Please write a review', type: 'warning' });
            return;
        }

        try {
            setSubmittingReview(true);

            // Add review to Firestore
            await addDoc(collection(db, 'reviews'), {
                productId: id,
                userId: user.uid,
                userName: user.displayName || user.email,
                userEmail: user.email,
                rating: userRating,
                review: userReview,
                createdAt: new Date()
            });

            // Reset form
            setUserRating(0);
            setUserReview('');

            setToast({ message: 'Review submitted successfully!', type: 'success' });

            // Refresh reviews
            const reviewsQuery = query(
                collection(db, 'reviews'),
                where('productId', '==', id),
                orderBy('createdAt', 'desc')
            );
            const reviewsSnapshot = await getDocs(reviewsQuery);
            const reviewsData = reviewsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));
            setReviews(reviewsData);

            // Update average rating
            if (reviewsData.length > 0) {
                const avgRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
                setProduct(prev => ({
                    ...prev,
                    rating: avgRating,
                    reviews: reviewsData.length
                }));
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            setToast({ message: 'Failed to submit review. Please try again.', type: 'error' });
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
        }
    };

    const calculateDiscountedPrice = () => {
        if (product?.discount) {
            return product.price * (1 - product.discount / 100);
        }
        return product?.price || 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)' }}></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <Package className="w-24 h-24 text-cyan-400 mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.6))' }} />
                <h2 className="text-3xl font-bold text-cyan-400 mb-2 uppercase" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>Product Not Found</h2>
                <Link to="/products" className="btn-primary mt-4">
                    Back to Products
                </Link>
            </div>
        );
    }

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-all font-bold uppercase tracking-wide"
                        style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
                    >
                        <ArrowLeft className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' }} />
                        <span>Back</span>
                    </button>

                    {/* Product Details */}
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
                        {/* Product Image Gallery */}
                        <div className="animate-fade-in space-y-3">
                            {(() => {
                                // Support both multi-image (new) and single-image (legacy) products
                                const productImages = product.images?.length
                                    ? product.images
                                    : product.image
                                        ? [product.image]
                                        : [];
                                const safeIdx = Math.min(activeImageIdx, productImages.length - 1);

                                const goNext = (e) => { e.stopPropagation(); setActiveImageIdx(i => Math.min(i + 1, productImages.length - 1)); };
                                const goPrev = (e) => { e.stopPropagation(); setActiveImageIdx(i => Math.max(i - 1, 0)); };

                                return (
                                    <>
                                        {/* Main image */}
                                        <div
                                            className="relative corner-clip overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-cyan-500/50 group cursor-zoom-in"
                                            style={{ boxShadow: '0 0 40px rgba(0, 255, 255, 0.3)' }}
                                            onClick={() => { setLightboxIdx(safeIdx); setLightboxOpen(true); }}
                                        >
                                            <img
                                                key={safeIdx}
                                                src={productImages[safeIdx] || ''}
                                                alt={`${product.name} - view ${safeIdx + 1}`}
                                                className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-contain animate-fade-in transition-transform duration-300 group-hover:scale-105"
                                            />



                                            {/* Discount badge */}
                                            {product.discount > 0 && (
                                                <div className="absolute top-4 left-4 bg-gradient-to-r from-magenta-500 to-red-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 corner-clip-sm font-black uppercase text-sm sm:text-base pointer-events-none" style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 20px rgba(255, 0, 255, 0.8)' }}>
                                                    -{product.discount}%
                                                </div>
                                            )}

                                            {/* Prev arrow */}
                                            {productImages.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={goPrev}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-gray-900/80 hover:bg-gray-900 border-2 border-cyan-500/50 hover:border-cyan-400 corner-clip-sm text-cyan-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                                                    style={{ boxShadow: '0 0 15px rgba(0,255,255,0.3)' }}
                                                    aria-label="Previous image"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                            )}

                                            {/* Next arrow */}
                                            {productImages.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={goNext}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-gray-900/80 hover:bg-gray-900 border-2 border-cyan-500/50 hover:border-cyan-400 corner-clip-sm text-cyan-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                                                    style={{ boxShadow: '0 0 15px rgba(0,255,255,0.3)' }}
                                                    aria-label="Next image"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            )}

                                            {/* Counter */}
                                            {productImages.length > 1 && (
                                                <div className="absolute bottom-3 right-3 bg-gray-900/80 border border-cyan-500/40 corner-clip-sm px-2 py-0.5 pointer-events-none">
                                                    <span className="text-xs font-black text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                        {safeIdx + 1}/{productImages.length}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Thumbnail strip */}
                                        {productImages.length > 1 && (
                                            <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,255,255,0.5) rgba(255,255,255,0.05)' }}>
                                                {productImages.map((img, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setActiveImageIdx(idx)}
                                                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 corner-clip-sm overflow-hidden border-2 transition-all duration-200 ${idx === safeIdx
                                                            ? 'border-cyan-400 scale-105'
                                                            : 'border-gray-600 hover:border-cyan-500/60 opacity-60 hover:opacity-100'
                                                            }`}
                                                        style={idx === safeIdx ? { boxShadow: '0 0 12px rgba(0,255,255,0.6)' } : {}}
                                                    >
                                                        <img
                                                            src={img}
                                                            alt={`Thumbnail ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Product Info */}
                        <div className="animate-slide-up">
                            {/* Category Badge */}
                            <div className="inline-block bg-cyan-500/20 text-cyan-400 px-3 py-1 sm:px-4 corner-clip-sm text-xs sm:text-sm font-black mb-3 sm:mb-4 uppercase tracking-wider border-2 border-cyan-500/50" style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)' }}>
                                {product.category}
                            </div>

                            {/* Product Name */}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 md:mb-4 text-white uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 0.4)' }}>{product.name}</h1>

                            {/* Rating */}
                            {product.rating > 0 && (
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                    ? 'text-cyan-400 fill-cyan-400'
                                                    : 'text-gray-600'
                                                    }`}
                                                style={i < Math.floor(product.rating) ? { filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' } : {}}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        {product.rating.toFixed(1)} {product.reviews > 0 && `(${product.reviews} reviews)`}
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-4 md:mb-6">
                                <div className="flex items-center space-x-3 md:space-x-4">
                                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-gradient" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}>
                                        ฿{calculateDiscountedPrice().toFixed(2)}
                                    </span>
                                    {product.discount > 0 && (
                                        <span className="text-lg sm:text-xl md:text-2xl text-gray-500 line-through">
                                            ฿{product.price.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-6">
                                {product.stock > 0 ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-cyan-400 rounded-full" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.8)' }}></div>
                                        <span className="text-cyan-400 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                                            In Stock ({product.stock} available)
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-red-400 rounded-full" style={{ boxShadow: '0 0 10px rgba(255, 0, 0, 0.8)' }}></div>
                                        <span className="text-red-400 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(255, 0, 0, 0.5)' }}>Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h3 className="text-xl font-black mb-3 text-magenta-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(255, 0, 255, 0.5)' }}>Description</h3>
                                <p className="text-gray-300 leading-relaxed" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.05rem' }}>{product.description}</p>
                            </div>

                            {/* Quantity Selector */}
                            {product.stock > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-black mb-3 text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>Quantity</label>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 corner-clip-sm border-2 border-cyan-500/50 hover:border-cyan-400 transition-all font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
                                        >
                                            -
                                        </button>
                                        <span className="text-2xl font-black w-12 text-center text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-10 h-10 corner-clip-sm border-2 border-cyan-500/50 hover:border-cyan-400 transition-all font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="btn-primary w-full inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                            </button>


                        </div>
                    </div>

                    {/* Reviews & Ratings Section */}
                    <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 corner-clip p-8 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}>
                        <div className="flex items-center space-x-3 mb-8">
                            <MessageSquare className="w-8 h-8 text-cyan-400" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))' }} />
                            <h2 className="text-4xl font-black uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>Reviews</span>{' '}
                                <span className="text-magenta-400" style={{ textShadow: '0 0 20px rgba(255, 0, 255, 0.6)' }}>& Ratings</span>
                            </h2>
                        </div>

                        {/* Rating Summary */}
                        {reviews.length > 0 && (
                            <div className="bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 corner-clip-sm p-6 mb-8 border-2 border-cyan-500/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-6xl font-black text-gradient" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}>
                                                {product.rating?.toFixed(1) || '0.0'}
                                            </span>
                                            <div>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-6 h-6 ${i < Math.floor(product.rating || 0)
                                                                ? 'text-cyan-400 fill-cyan-400'
                                                                : 'text-gray-600'
                                                                }`}
                                                            style={i < Math.floor(product.rating || 0) ? { filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' } : {}}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-300 mt-1 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                    Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Write a Review */}
                        {user ? (
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 corner-clip-sm p-6 mb-8 border-2 border-magenta-500/30" style={{ boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)' }}>
                                <h3 className="text-2xl font-black mb-4 text-magenta-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(255, 0, 255, 0.6)' }}>Write a Review</h3>

                                {/* Star Rating Input */}
                                <div className="mb-4">
                                    <label className="block text-sm font-black text-cyan-400 mb-3 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                        Your Rating
                                    </label>
                                    <div className="flex space-x-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setUserRating(star)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${star <= userRating
                                                        ? 'text-cyan-400 fill-cyan-400'
                                                        : 'text-gray-600'
                                                        }`}
                                                    style={star <= userRating ? { filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 1))' } : {}}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Review Text */}
                                <div className="mb-4">
                                    <label className="block text-sm font-black text-cyan-400 mb-3 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                        Your Review
                                    </label>
                                    <textarea
                                        value={userReview}
                                        onChange={(e) => setUserReview(e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-3 border-2 border-cyan-500/50 corner-clip-sm focus:border-cyan-400 focus:outline-none resize-none bg-gray-900 text-gray-200 placeholder-gray-500"
                                        placeholder="Share your thoughts about this product..."
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submittingReview}
                                    className="btn-primary inline-flex items-center space-x-2"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="bg-cyan-500/10 border-2 border-cyan-500/50 corner-clip-sm p-6 mb-8 text-center">
                                <p className="text-cyan-300 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    Please <Link to="/login" className="text-cyan-400 font-black hover:text-cyan-300 transition-colors" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.8)' }}>login</Link> to write a review
                                </p>
                            </div>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>Customer Reviews ({reviews.length})</h3>

                            {reviews.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare className="w-16 h-16 text-cyan-400 mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.6))' }} />
                                    <p className="text-gray-300 font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>No reviews yet</p>
                                    <p className="text-sm text-gray-400 mt-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Be the first to review this product!</p>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="border-b border-cyan-500/30 pb-6 last:border-b-0">
                                        <div className="flex items-start space-x-4">
                                            {/* User Avatar */}
                                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-magenta-500 corner-clip-sm flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                                                <span className="text-white font-black text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                    {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>

                                            {/* Review Content */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="font-black text-white text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{review.userName}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-4 h-4 ${i < review.rating
                                                                            ? 'text-cyan-400 fill-cyan-400'
                                                                            : 'text-gray-600'
                                                                            }`}
                                                                        style={i < review.rating ? { filter: 'drop-shadow(0 0 3px rgba(0, 255, 255, 0.8))' } : {}}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm text-gray-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                {review.createdAt?.toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-gray-300 leading-relaxed" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.05rem' }}>{review.review}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <section className="mt-16">
                            <h2 className="text-4xl font-black mb-8 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>Related</span>{' '}
                                <span className="text-magenta-400" style={{ textShadow: '0 0 20px rgba(255, 0, 255, 0.6)' }}>Products</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {relatedProducts.map((relatedProduct) => (
                                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* ── Lightbox ─────────────────────────────────────────────────── */}
            {lightboxOpen && (() => {
                const productImages = product?.images?.length
                    ? product.images
                    : product?.image ? [product.image] : [];
                const safeLbIdx = Math.min(lightboxIdx, productImages.length - 1);
                const lbNext = () => setLightboxIdx(Math.min(safeLbIdx + 1, productImages.length - 1));
                const lbPrev = () => setLightboxIdx(Math.max(safeLbIdx - 1, 0));
                return (
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.95)' }}
                        onClick={() => setLightboxOpen(false)}
                    >
                        {/* Scanline overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-10"
                            style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,255,0.15) 2px,rgba(0,255,255,0.15) 4px)' }} />

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setLightboxOpen(false)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-gray-900/90 border-2 border-cyan-500/60 hover:border-cyan-400 corner-clip-sm text-cyan-400 hover:text-white transition-all"
                            style={{ boxShadow: '0 0 15px rgba(0,255,255,0.4)' }}
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Counter */}
                        {productImages.length > 1 && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/90 border border-cyan-500/40 corner-clip-sm px-4 py-1.5">
                                <span className="text-sm font-black text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                    {safeLbIdx + 1} / {productImages.length}
                                </span>
                            </div>
                        )}

                        {/* Prev arrow */}
                        {productImages.length > 1 && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); lbPrev(); }}
                                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center bg-gray-900/90 hover:bg-gray-800 border-2 border-cyan-500/60 hover:border-cyan-400 corner-clip-sm text-cyan-400 hover:text-white transition-all"
                                style={{ boxShadow: '0 0 20px rgba(0,255,255,0.4)' }}
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                            </button>
                        )}

                        {/* Main lightbox image */}
                        <div
                            className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                key={safeLbIdx}
                                src={productImages[safeLbIdx]}
                                alt={`${product.name} - ${safeLbIdx + 1}`}
                                className="max-w-full max-h-[85vh] object-contain corner-clip"
                                style={{ boxShadow: '0 0 60px rgba(0,255,255,0.25)', border: '2px solid rgba(0,255,255,0.3)' }}
                            />
                        </div>

                        {/* Next arrow */}
                        {productImages.length > 1 && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); lbNext(); }}
                                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center bg-gray-900/90 hover:bg-gray-800 border-2 border-cyan-500/60 hover:border-cyan-400 corner-clip-sm text-cyan-400 hover:text-white transition-all"
                                style={{ boxShadow: '0 0 20px rgba(0,255,255,0.4)' }}
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                            </button>
                        )}

                        {/* Thumbnail strip */}
                        {productImages.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] pb-1">
                                {productImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setLightboxIdx(idx); }}
                                        className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 corner-clip-sm overflow-hidden border-2 transition-all ${idx === safeLbIdx
                                            ? 'border-cyan-400 scale-110'
                                            : 'border-gray-600 opacity-50 hover:opacity-90 hover:border-cyan-500/60'
                                            }`}
                                        style={idx === safeLbIdx ? { boxShadow: '0 0 12px rgba(0,255,255,0.8)' } : {}}
                                    >
                                        <img src={img} alt={`lb-thumb-${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Keyboard hint */}
                        <div className="absolute bottom-4 right-4 text-xs text-gray-600 font-bold uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            ESC to close · ← → to navigate
                        </div>
                    </div>
                );
            })()}
        </>
    );
};

export default ProductDetails;
