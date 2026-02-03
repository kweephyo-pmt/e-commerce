import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, limit, addDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, ArrowLeft, Package, Truck, Shield, Star, MessageSquare, User } from 'lucide-react';
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
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [toast, setToast] = useState(null);

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const productData = { id: docSnap.id, ...docSnap.data() };
                    setProduct(productData);

                    // Fetch related products from the same category
                    if (productData.category) {
                        const q = query(
                            collection(db, 'products'),
                            where('category', '==', productData.category),
                            limit(4)
                        );
                        const querySnapshot = await getDocs(q);
                        const related = querySnapshot.docs
                            .map(doc => ({ id: doc.id, ...doc.data() }))
                            .filter(p => p.id !== id); // Exclude current product
                        setRelatedProducts(related);
                    }
                } else {
                    console.error('Product not found');
                    navigate('/products');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

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
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <Package className="w-24 h-24 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Product Not Found</h2>
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
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold">Back</span>
                    </button>

                    {/* Product Details */}
                    <div className="grid md:grid-cols-2 gap-12 mb-16">
                        {/* Product Image */}
                        <div className="animate-fade-in">
                            <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-xl">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-[500px] object-contain"
                                />
                                {product.discount > 0 && (
                                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                                        -{product.discount}%
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="animate-slide-up">
                            {/* Category Badge */}
                            <div className="inline-block bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                                {product.category}
                            </div>

                            {/* Product Name */}
                            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

                            {/* Rating */}
                            {product.rating > 0 && (
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-600">
                                        {product.rating.toFixed(1)} {product.reviews > 0 && `(${product.reviews} reviews)`}
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-center space-x-4">
                                    <span className="text-4xl font-bold text-blue-600">
                                        ฿{calculateDiscountedPrice().toFixed(2)}
                                    </span>
                                    {product.discount > 0 && (
                                        <span className="text-2xl text-gray-400 line-through">
                                            ฿{product.price.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-6">
                                {product.stock > 0 ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-green-600 font-semibold">
                                            In Stock ({product.stock} available)
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-red-600 font-semibold">Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            </div>

                            {/* Quantity Selector */}
                            {product.stock > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold mb-2">Quantity</label>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-blue-600 transition-colors font-bold"
                                        >
                                            -
                                        </button>
                                        <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-blue-600 transition-colors font-bold"
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

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                    <Truck className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <p className="font-semibold text-sm">Free Shipping</p>
                                        <p className="text-xs text-gray-600">On orders over ฿1,500</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <p className="font-semibold text-sm">Secure Payment</p>
                                        <p className="text-xs text-gray-600">100% protected</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews & Ratings Section */}
                    <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="flex items-center space-x-3 mb-8">
                            <MessageSquare className="w-8 h-8 text-blue-600" />
                            <h2 className="text-3xl font-bold">
                                Reviews & <span className="text-gradient">Ratings</span>
                            </h2>
                        </div>

                        {/* Rating Summary */}
                        {reviews.length > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-5xl font-bold text-blue-600">
                                                {product.rating?.toFixed(1) || '0.0'}
                                            </span>
                                            <div>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-6 h-6 ${i < Math.floor(product.rating || 0)
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
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
                            <div className="bg-gray-50 rounded-xl p-6 mb-8">
                                <h3 className="text-xl font-bold mb-4">Write a Review</h3>

                                {/* Star Rating Input */}
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Review Text */}
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Review
                                    </label>
                                    <textarea
                                        value={userReview}
                                        onChange={(e) => setUserReview(e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                                        placeholder="Share your thoughts about this product..."
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
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-center">
                                <p className="text-blue-800 font-medium">
                                    Please <Link to="/login" className="text-blue-600 font-bold hover:underline">login</Link> to write a review
                                </p>
                            </div>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold">Customer Reviews ({reviews.length})</h3>

                            {reviews.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 font-medium">No reviews yet</p>
                                    <p className="text-sm text-gray-500 mt-1">Be the first to review this product!</p>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                                        <div className="flex items-start space-x-4">
                                            {/* User Avatar */}
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-bold text-lg">
                                                    {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>

                                            {/* Review Content */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{review.userName}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-4 h-4 ${i < review.rating
                                                                            ? 'text-yellow-400 fill-yellow-400'
                                                                            : 'text-gray-300'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm text-gray-500">
                                                                {review.createdAt?.toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">{review.review}</p>
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
                            <h2 className="text-3xl font-bold mb-8">
                                Related <span className="text-gradient">Products</span>
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
        </>
    );
};

export default ProductDetails;
