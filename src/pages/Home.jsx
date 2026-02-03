import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ArrowRight, ShoppingBag, Truck, Shield, Headphones } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const features = [
    {
        icon: Truck,
        title: 'Free Shipping',
        description: 'On orders over ฿1,500'
    },
    {
        icon: Shield,
        title: 'Secure Payment',
        description: '100% secure transactions'
    },
    {
        icon: Headphones,
        title: '24/7 Support',
        description: 'Dedicated customer service'
    },
    {
        icon: ShoppingBag,
        title: 'Easy Returns',
        description: '30-day return policy'
    }
];

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch featured products from Firestore
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);
                // Fetch up to 4 products for the featured section
                const q = query(collection(db, 'products'), limit(4));
                const querySnapshot = await getDocs(q);
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setFeaturedProducts(productsData);
            } catch (error) {
                console.error('Error fetching featured products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-slide-up">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                                Discover Your
                                <span className="block text-gradient">Perfect Style</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Shop the latest trends in fashion, electronics, and lifestyle products.
                                Quality guaranteed with fast, free shipping.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/products" className="btn-primary inline-flex items-center space-x-2">
                                    <span>Shop Now</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/products" className="btn-secondary">
                                    Browse Categories
                                </Link>
                            </div>
                        </div>

                        <div className="relative animate-fade-in">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                            <img
                                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
                                alt="Shopping"
                                className="relative rounded-3xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="text-center p-6 rounded-2xl hover:bg-white transition-all duration-300 group animate-fade-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">
                            Featured <span className="text-gradient">Products</span>
                        </h2>
                        <p className="text-xl text-gray-600">
                            Handpicked items just for you
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                                {featuredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            <div className="text-center">
                                <Link to="/products" className="btn-primary inline-flex items-center space-x-2">
                                    <span>View All Products</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-700 mb-2">No products available</h3>
                            <p className="text-gray-600">Check back soon for amazing deals!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Start Shopping?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied customers and discover amazing deals on premium products.
                    </p>
                    <Link to="/products" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 inline-flex items-center space-x-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                        <span>Start Shopping</span>
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
