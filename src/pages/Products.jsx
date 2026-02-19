import { useState, useEffect, Fragment } from 'react';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';

const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
];

const Products = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [productRatings, setProductRatings] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filters, setFilters] = useState({
        priceRange: { min: 0, max: 10000 },
        ratings: [],
        brands: [],
        inStockOnly: false,
        onSaleOnly: false
    });

    // Real-time products listener + one-time ratings fetch
    useEffect(() => {
        setLoading(true);

        // Fetch reviews once (ratings rarely change mid-session)
        const fetchRatings = async (productsData) => {
            try {
                const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
                const reviews = reviewsSnapshot.docs.map(doc => doc.data());
                const ratingsMap = {};
                productsData.forEach(product => {
                    const productReviews = reviews.filter(r => r.productId === product.id);
                    ratingsMap[product.id] = productReviews.length > 0
                        ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
                        : 0;
                });
                setProductRatings(ratingsMap);
            } catch (err) {
                console.error('Error fetching ratings:', err);
            }
        };

        // onSnapshot keeps the product list live — fires immediately on mount,
        // then again whenever a product is added, updated, or deleted.
        const unsubscribe = onSnapshot(
            collection(db, 'products'),
            (snapshot) => {
                const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllProducts(productsData);
                fetchRatings(productsData);
                setLoading(false);
            },
            (error) => {
                console.error('Error listening to products:', error);
                setLoading(false);
            }
        );

        // Clean up listener when component unmounts
        return () => unsubscribe();
    }, []);

    // Filter and sort products
    const filteredProducts = allProducts
        .filter(product => {
            // Category filter
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

            // Search filter
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());

            // Price range filter
            const matchesPrice = product.price >= filters.priceRange.min &&
                product.price <= filters.priceRange.max;

            // Rating filter - use the fetched ratings (exact match within 0.5 range)
            const productRating = productRatings[product.id] || 0;
            const matchesRating = filters.ratings.length === 0 ||
                filters.ratings.some(rating => {
                    // For exact star matching: 5 stars = 4.5-5.0, 4 stars = 3.5-4.49, etc.
                    const roundedRating = Math.round(productRating);
                    return roundedRating === rating;
                });

            // Brand filter
            const matchesBrand = filters.brands.length === 0 ||
                filters.brands.includes(product.brand);

            // Stock filter
            const matchesStock = !filters.inStockOnly || product.stock > 0;

            // Sale filter
            const matchesSale = !filters.onSaleOnly || product.discount > 0;

            return matchesCategory && matchesSearch && matchesPrice &&
                matchesRating && matchesBrand && matchesStock && matchesSale;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return (productRatings[b.id] || 0) - (productRatings[a.id] || 0);
                default:
                    return 0;
            }
        });

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Page Header */}
                <div className="mb-8 md:mb-12 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 md:mb-4 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        <span className="text-cyan-400" style={{ textShadow: '0 0 30px rgba(0, 255, 255, 0.8)' }}>Explore Our </span>
                        <span className="text-gradient" style={{ textShadow: '0 0 30px rgba(255, 0, 255, 0.6)' }}>Collection</span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Discover premium gaming gear and tech
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' }} />
                        <input
                            type="text"
                            placeholder="Search for gaming gear..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-12 text-lg"
                            style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}
                        />
                    </div>
                </div>

                {/* Mobile Sidebar Overlay - Only renders on mobile */}
                <FilterSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    products={allProducts}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    onFilterChange={setFilters}
                    mobileOnly={true}
                />

                {/* Main Content with Sidebar */}
                <div className="flex gap-8">
                    {/* Desktop Sidebar - Only visible on desktop */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <FilterSidebar
                            isOpen={true}
                            onClose={() => { }}
                            products={allProducts}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            onFilterChange={setFilters}
                        />
                    </div>

                    {/* Products Section */}
                    <div className="flex-1">
                        {/* Mobile Filter Button & Sort */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500/30 to-magenta-500/30 text-cyan-400 corner-clip-sm font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all border-2 border-cyan-500"
                                style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                                <span>Filters</span>
                            </button>

                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="input-field py-3 max-w-xs font-bold uppercase tracking-wide border-2 border-cyan-500/50 corner-clip-sm"
                                style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)' }}
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value} className="bg-[#1a1f3a] text-cyan-400">
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Results Count */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-cyan-400 font-bold uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                                Showing <span className="text-magenta-400">{filteredProducts.length}</span> products
                            </p>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)' }}></div>
                            </div>
                        ) : (
                            <Fragment>
                                {/* Products Grid */}
                                {filteredProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredProducts.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20">
                                        <Search className="w-24 h-24 mx-auto text-cyan-400 mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.6))' }} />
                                        <h3 className="text-3xl font-black text-cyan-400 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>No products found</h3>
                                        <p className="text-gray-400 text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Try adjusting your search or filters</p>
                                    </div>
                                )}
                            </Fragment>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
