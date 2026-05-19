import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { X, SlidersHorizontal, Star, DollarSign, Tag, TrendingUp } from 'lucide-react';

const FilterSidebar = ({
    isOpen,
    onClose,
    products = [],
    onFilterChange,
    selectedCategory,
    onCategoryChange,
    mobileOnly = false
}) => {
    const [categories, setCategories] = useState(['All']);

    // Calculate price range from products
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [selectedPriceRange, setSelectedPriceRange] = useState({ min: 0, max: 10000 });
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [onSaleOnly, setOnSaleOnly] = useState(false);

    // Real-time categories from Firestore
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'categories'),
            (snapshot) => {
                const fetched = snapshot.docs.map(d => d.data().name).filter(Boolean);
                setCategories(['All', ...fetched]);
            },
            (error) => console.error('Error loading categories:', error)
        );
        return () => unsubscribe();
    }, []);

    // Calculate actual price range and brands from products
    useEffect(() => {
        if (products.length > 0) {
            const prices = products.map(p => p.price || 0);
            const minPrice = Math.floor(Math.min(...prices));
            const maxPrice = Math.ceil(Math.max(...prices));
            setPriceRange({ min: minPrice, max: maxPrice });
            setSelectedPriceRange({ min: minPrice, max: maxPrice });
        }
    }, [products]);

    // Get unique brands from products
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];

    // Handle filter changes
    useEffect(() => {
        const filters = {
            priceRange: selectedPriceRange,
            ratings: selectedRatings,
            brands: selectedBrands,
            inStockOnly,
            onSaleOnly
        };
        onFilterChange?.(filters);
    }, [selectedPriceRange, selectedRatings, selectedBrands, inStockOnly, onSaleOnly]);

    const handleRatingToggle = (rating) => {
        setSelectedRatings(prev =>
            prev.includes(rating)
                ? prev.filter(r => r !== rating)
                : [...prev, rating]
        );
    };

    const handleBrandToggle = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand)
                ? prev.filter(b => b !== brand)
                : [...prev, brand]
        );
    };

    const clearAllFilters = () => {
        setSelectedPriceRange(priceRange);
        setSelectedRatings([]);
        setSelectedBrands([]);
        setInStockOnly(false);
        setOnSaleOnly(false);
        onCategoryChange?.('All');
    };



    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:sticky top-0 left-0 h-screen lg:h-auto
                w-80 bg-gradient-to-b from-[#0f172a] to-[#1a1f3a]
                corner-clip shadow-2xl border-2 border-cyan-500/30
                transform transition-all duration-300 ease-in-out
                z-50 lg:z-0
                overflow-hidden
                ${mobileOnly ? 'lg:hidden' : ''}
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `} style={{ boxShadow: '0 0 40px rgba(0, 255, 255, 0.3), inset 0 0 60px rgba(0, 255, 255, 0.05)' }}>
                <div className="h-full overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-cyan-500/20 via-purple-600/20 to-magenta-500/20 backdrop-blur-md border-b-2 border-cyan-500/50 text-cyan-400 p-6 z-10" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)' }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-cyan-500/20 corner-clip-sm border border-cyan-500/50" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)' }}>
                                    <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-wider uppercase" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.8)' }}>Filters</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="lg:hidden p-2 hover:bg-cyan-500/20 corner-clip-sm transition-all hover:scale-110 border border-transparent hover:border-cyan-500/50"
                                style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)' }}
                            >
                                <X className="w-6 h-6 text-cyan-400" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Categories */}
                        <div className="filter-section">
                            <div className="flex items-center space-x-2 mb-4 pb-2 border-b-2 border-cyan-500/30">
                                <div className="p-1.5 bg-cyan-500/20 corner-clip-sm border border-cyan-500/40" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }}>
                                    <Tag className="w-4 h-4 text-cyan-400" />
                                </div>
                                <h3 className="font-bold text-lg text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>Categories</h3>
                            </div>
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => onCategoryChange?.(category)}
                                        className={`
                                        w-full text-left px-4 py-3 corner-clip-sm font-bold uppercase tracking-wide
                                        transition-all duration-200 transform
                                        ${selectedCategory === category
                                                ? 'bg-gradient-to-r from-cyan-500/30 to-magenta-500/30 text-cyan-400 border-2 border-cyan-500 scale-105'
                                                : 'bg-[#1a1f3a]/60 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-400 border-2 border-cyan-500/20 hover:border-cyan-500/50'
                                            }
                                    `}
                                        style={selectedCategory === category ? { boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.1)' } : { boxShadow: '0 0 10px rgba(0, 255, 255, 0.1)' }}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="filter-section pt-6 border-t-2 border-cyan-500/20">
                            <div className="flex items-center space-x-2 mb-4 pb-2 border-b-2 border-cyan-500/30">
                                <div className="p-1.5 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 corner-clip-sm border-2 border-cyan-500/50" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)' }}>
                                    <DollarSign className="w-4 h-4 text-cyan-400" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 1))' }} />
                                </div>
                                <h3 className="font-black text-lg text-cyan-400 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0, 255, 255, 0.8)' }}>Price Range</h3>
                            </div>
                            <div className="space-y-4 p-4 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 corner-clip-sm border-2 border-cyan-500/20" style={{ boxShadow: 'inset 0 0 20px rgba(0, 255, 255, 0.1)' }}>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Min</label>
                                        <div className="px-3 py-2 bg-gray-900/80 text-cyan-400 border-2 border-cyan-500/50 font-black text-sm corner-clip-sm" style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)' }}>
                                            K{selectedPriceRange.min}
                                        </div>
                                    </div>
                                    <span className="text-cyan-400 font-bold text-xl mt-5" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.8)' }}>—</span>
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Max</label>
                                        <div className="px-3 py-2 bg-gray-900/80 text-cyan-400 border-2 border-cyan-500/50 font-black text-sm corner-clip-sm" style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)' }}>
                                            K{selectedPriceRange.max}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min={priceRange.min}
                                            max={priceRange.max}
                                            value={selectedPriceRange.min}
                                            onChange={(e) => setSelectedPriceRange(prev => ({
                                                ...prev,
                                                min: Math.min(Number(e.target.value), prev.max - 100)
                                            }))}
                                            className="w-full slider"
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min={priceRange.min}
                                            max={priceRange.max}
                                            value={selectedPriceRange.max}
                                            onChange={(e) => setSelectedPriceRange(prev => ({
                                                ...prev,
                                                max: Math.max(Number(e.target.value), prev.min + 100)
                                            }))}
                                            className="w-full slider"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ratings */}
                        <div className="filter-section pt-6 border-t-2 border-cyan-500/20">
                            <div className="flex items-center space-x-2 mb-4 pb-2 border-b-2 border-cyan-500/30">
                                <div className="p-1.5 bg-cyan-500/20 corner-clip-sm border border-cyan-500/40" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }}>
                                    <Star className="w-4 h-4 text-cyan-400 fill-cyan-400" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 255, 255, 0.8))' }} />
                                </div>
                                <h3 className="font-bold text-lg text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>Customer Ratings</h3>
                            </div>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <label
                                        key={rating}
                                        className="flex items-center space-x-3 p-3 corner-clip-sm hover:bg-cyan-500/10 cursor-pointer transition-all border-2 border-transparent hover:border-cyan-500/30"
                                        style={selectedRatings.includes(rating) ? { backgroundColor: 'rgba(0, 255, 255, 0.1)', borderColor: 'rgba(0, 255, 255, 0.5)', boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)' } : {}}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRatings.includes(rating)}
                                            onChange={() => handleRatingToggle(rating)}
                                        />
                                        <div className="flex items-center space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < rating
                                                        ? 'text-cyan-400 fill-cyan-400'
                                                        : 'text-gray-600'
                                                        }`}
                                                    style={i < rating ? { filter: 'drop-shadow(0 0 3px rgba(0, 255, 255, 0.8))' } : {}}
                                                />
                                            ))}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Brands */}
                        {brands.length > 0 && (
                            <div className="filter-section pt-6 border-t-2 border-cyan-500/20">
                                <div className="flex items-center space-x-2 mb-4 pb-2 border-b-2 border-purple-100">
                                    <div className="p-1.5 bg-purple-50 rounded-lg">
                                        <TrendingUp className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <h3 className="font-bold text-lg text-magenta-400 uppercase tracking-wide">Brands</h3>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                    {brands.map((brand) => (
                                        <label
                                            key={brand}
                                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 cursor-pointer transition-all border border-transparent hover:border-purple-200"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedBrands.includes(brand)}
                                                onChange={() => handleBrandToggle(brand)}
                                                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                            />
                                            <span className="text-gray-300 font-medium">{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Filters */}
                        <div className="filter-section pt-6 border-t-2 border-cyan-500/20">
                            <div className="flex items-center space-x-2 mb-4 pb-2 border-b-2 border-purple-500/30">
                                <div className="p-1.5 bg-purple-500/20 corner-clip-sm border border-purple-500/40" style={{ boxShadow: '0 0 10px rgba(138, 43, 226, 0.3)' }}>
                                    <TrendingUp className="w-4 h-4 text-purple-400" />
                                </div>
                                <h3 className="font-bold text-lg text-purple-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(138, 43, 226, 0.5)' }}>Quick Filters</h3>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-4 corner-clip-sm cursor-pointer hover:bg-cyan-500/10 transition-all border-2 border-cyan-500/30 hover:border-cyan-500/60" style={inStockOnly ? { backgroundColor: 'rgba(0, 255, 255, 0.2)', borderColor: 'rgba(0, 255, 255, 0.8)', boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' } : {}}>
                                    <span className="font-bold text-cyan-300 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        In Stock Only
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={inStockOnly}
                                        onChange={(e) => setInStockOnly(e.target.checked)}
                                    />
                                </label>
                                <label className="flex items-center justify-between p-4 corner-clip-sm cursor-pointer hover:bg-cyan-500/10 transition-all border-2 border-cyan-500/30 hover:border-cyan-500/60" style={onSaleOnly ? { backgroundColor: 'rgba(0, 255, 255, 0.2)', borderColor: 'rgba(0, 255, 255, 0.8)', boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' } : {}}>
                                    <span className="font-bold text-cyan-300 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        On Sale
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={onSaleOnly}
                                        onChange={(e) => setOnSaleOnly(e.target.checked)}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FilterSidebar;
