import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Package, Truck, Shield, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

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
    );
};

export default ProductDetails;
