import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, limit, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ArrowRight, ShoppingBag, Truck, Shield, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
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

    // Real-time listener for featured products
    useEffect(() => {
        setLoading(true);
        // Query up to 12 products marked as featured
        const q = query(
            collection(db, 'products'),
            where('isFeatured', '==', true),
            limit(12)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFeaturedProducts(productsData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching featured products:', error);
            setLoading(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, []);

    const sliderRef = useRef(null);

    const scroll = (direction) => {
        if (sliderRef.current) {
            const { scrollLeft, clientWidth } = sliderRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth / 2
                : scrollLeft + clientWidth / 2;

            sliderRef.current.scrollTo({
                left: scrollTo,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-32">
                {/* Gaming PC Background with Blur */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1920&h=1080&fit=crop')" }}></div>
                <div className="absolute inset-0 backdrop-blur-md bg-black/60"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-900/80"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div className="animate-slide-up text-center md:text-left">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 leading-tight uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                <span className="text-cyan-400" style={{ textShadow: '0 0 30px rgba(0, 255, 255, 0.8)' }}>Level Up Your</span>
                                <span className="block text-gradient mt-2" style={{ textShadow: '0 0 30px rgba(255, 0, 255, 0.6)' }}>Gaming Experience</span>
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Explore cutting-edge gaming gear, high-performance tech, and premium accessories.
                                Unleash your potential with lightning-fast delivery.
                            </p>
                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center md:justify-start">
                                <Link to="/products" className="btn-primary inline-flex items-center justify-center space-x-2">
                                    <span>Shop Now</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/products" className="btn-secondary">
                                    Browse Categories
                                </Link>
                            </div>
                        </div>

                        <div className="relative animate-fade-in hidden md:block">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-magenta-400 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
                            <div className="relative corner-clip-lg overflow-hidden border-4 border-cyan-500/50" style={{ boxShadow: '0 0 40px rgba(0, 255, 255, 0.4)' }}>
                                <img
                                    src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=600&fit=crop"
                                    alt="Gaming PC Setup"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Featured Products Section */}
            <section className="py-12 sm:py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 md:mb-4 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.8)' }}>Featured </span>
                            <span className="text-gradient" style={{ textShadow: '0 0 20px rgba(255, 0, 255, 0.6)' }}>Products</span>
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Handpicked items just for you
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)' }}></div>
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="space-y-8">
                            {/* Products Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                                {featuredProducts.map((product) => (
                                    <div key={product.id} className="animate-scale-in">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mt-8">
                                <Link to="/products" className="btn-primary inline-flex items-center justify-center space-x-2">
                                    <span>View All Products</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 md:py-20 bg-gray-900/50 corner-clip border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}>
                            <ShoppingBag className="w-16 h-16 md:w-24 md:h-24 mx-auto text-cyan-400 mb-4" style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.6))' }} />
                            <h3 className="text-2xl md:text-3xl font-black text-cyan-400 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>No products available</h3>
                            <p className="text-gray-400 text-base md:text-lg font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Check back soon for amazing deals!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-magenta-600 opacity-95"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 30px rgba(255, 255, 255, 0.5)' }}>
                        Ready to Start Shopping?
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-cyan-100 mb-6 md:mb-8 max-w-2xl mx-auto font-bold px-4" style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }}>
                        Join thousands of satisfied customers and discover amazing deals on premium products.
                    </p>
                    <Link to="/products" className="bg-white text-cyan-600 px-6 sm:px-8 py-3 sm:py-4 corner-clip-sm font-black text-base sm:text-lg hover:bg-gray-100 transition-all duration-300 inline-flex items-center justify-center space-x-2 border-4 border-white uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 40px rgba(255, 255, 255, 0.5), 0 10px 30px rgba(0, 0, 0, 0.3)', transform: 'translateY(0)', '&:hover': { transform: 'translateY(-4px)' } }}>
                        <span>Start Shopping</span>
                        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
