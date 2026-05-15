import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Package, Truck, CheckCircle, Clock, ShoppingBag, ChevronDown, ChevronUp, Calendar, MapPin, CreditCard, Search, Filter, X, Banknote, AlertCircle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const { formatPrice } = useCurrency();

    // Filters and search
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

    // Real-time order updates using onSnapshot
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('userId', '==', user.uid)
        );

        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const ordersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                    updatedAt: doc.data().updatedAt?.toDate()
                }));

                // Sort by date on the client side (newest first)
                ordersData.sort((a, b) => {
                    if (!a.createdAt) return 1;
                    if (!b.createdAt) return -1;
                    return b.createdAt - a.createdAt;
                });

                setOrders(ordersData);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders. Please try again.');
                setLoading(false);
            }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [user]);

    // Order Progress Timeline Component
    const OrderProgress = ({ status }) => {
        const steps = [
            { key: 'processing', label: 'Processing', icon: Clock },
            { key: 'shipped', label: 'Shipped', icon: Truck },
            { key: 'delivered', label: 'Delivered', icon: CheckCircle }
        ];

        const currentStepIndex = steps.findIndex(step => step.key === status);

        return (
            <div className="py-6">
                <h4 className="font-black mb-4 text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>Order Progress</h4>
                <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-700">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-magenta-400 transition-all duration-500"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%`, boxShadow: '0 0 10px rgba(0, 255, 255, 0.8)' }}
                        ></div>
                    </div>

                    {/* Steps */}
                    <div className="relative flex justify-between">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <div key={step.key} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 corner-clip-sm flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                        ? 'bg-cyan-500 border-cyan-400 text-white'
                                        : 'bg-gray-800 border-gray-600 text-gray-500'
                                        } ${isCurrent ? 'ring-4 ring-cyan-500/30' : ''}`} style={isCompleted ? { boxShadow: '0 0 15px rgba(0, 255, 255, 0.6)' } : {}}>
                                        <StepIcon className="w-5 h-5" />
                                    </div>
                                    <span className={`mt-2 text-xs font-bold uppercase tracking-wide ${isCompleted ? 'text-cyan-400' : 'text-gray-500'
                                        }`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processing':
                return <Clock className="w-4 h-4" />;
            case 'shipped':
                return <Truck className="w-4 h-4" />;
            case 'delivered':
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'processing':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'shipped':
                return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
            case 'delivered':
                return 'bg-magenta-500/20 text-magenta-400 border-magenta-500/50';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.userName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    // Status counts
    const statusCounts = {
        all: orders.length,
        processing: orders.filter(o => o.orderStatus === 'processing').length,
        shipped: orders.filter(o => o.orderStatus === 'shipped').length,
        delivered: orders.filter(o => o.orderStatus === 'delivered').length
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center animate-fade-in max-w-md">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-900 border-2 border-cyan-500/50 corner-clip mb-6" style={{ boxShadow: '0 0 40px rgba(0, 255, 255, 0.2)' }}>
                        <Package className="w-16 h-16 text-cyan-400" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }} />
                    </div>
                    <h2 className="text-4xl font-black mb-4 text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>Please Log In</h2>
                    <p className="text-gray-400 mb-8 text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        You need to be logged in to view your orders.
                    </p>
                    <Link to="/login" className="btn-primary inline-block">
                        Log In to Continue
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mx-auto" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)' }}></div>
                    <p className="mt-4 text-cyan-400 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-6xl font-black mb-2 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.8)' }}>My</span>{' '}
                        <span className="text-gradient">Orders</span>
                    </h1>
                    <p className="text-cyan-400 uppercase tracking-widest font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                        {orders.length} {orders.length === 1 ? 'order' : 'orders'} total • Real-time updates
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/50 corner-clip-sm text-red-400 animate-fade-in font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)' }}>
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-20 animate-fade-in bg-gradient-to-br from-gray-900 to-gray-800 corner-clip border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}>
                        <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-900 border-2 border-cyan-500/50 corner-clip mb-6" style={{ boxShadow: '0 0 40px rgba(0, 255, 255, 0.2)' }}>
                            <ShoppingBag className="w-16 h-16 text-cyan-400" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }} />
                        </div>
                        <h2 className="text-4xl font-black mb-4 text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>No Orders Yet</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            You haven't placed any orders yet. Start shopping to see your orders here!
                        </p>
                        <Link to="/products" className="btn-primary inline-block">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Filters & Search */}
                        <div className="mb-6 space-y-4">
                            {/* Search Bar */}
                            <div className="card p-4 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)' }}>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' }} />
                                        <input
                                            type="text"
                                            placeholder="Search by order ID or customer name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="input-field pl-10 w-full"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <Filter className="w-4 h-4" />
                                        <span>Filters</span>
                                        {statusFilter !== 'all' && (
                                            <span className="bg-cyan-500 text-white text-xs corner-clip-sm w-5 h-5 flex items-center justify-center font-bold" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.8)' }}>
                                                1
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Filter Options */}
                                {showFilters && (
                                    <div className="mt-4 pt-4 border-t border-cyan-500/30 animate-fade-in">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-sm font-black text-cyan-400 self-center mr-2 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>Status:</span>
                                            {['all', 'processing', 'shipped', 'delivered'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => setStatusFilter(status)}
                                                    className={`px-4 py-2 corner-clip-sm text-sm font-bold uppercase tracking-wide transition-all ${statusFilter === status
                                                        ? 'bg-cyan-500 text-white border-2 border-cyan-400'
                                                        : 'bg-gray-800 text-gray-400 border-2 border-gray-600 hover:border-cyan-500/50'
                                                        }`}
                                                    style={statusFilter === status ? { boxShadow: '0 0 15px rgba(0, 255, 255, 0.6)', fontFamily: 'Rajdhani, sans-serif' } : { fontFamily: 'Rajdhani, sans-serif' }}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    <span className="ml-1.5 text-xs opacity-75">
                                                        ({statusCounts[status]})
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Active Filters Summary */}
                            {(searchQuery || statusFilter !== 'all') && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-cyan-400 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Active filters:</span>
                                    {searchQuery && (
                                        <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 corner-clip-sm flex items-center gap-1 border border-cyan-500/50 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            Search: "{searchQuery}"
                                            <button onClick={() => setSearchQuery('')} className="hover:text-cyan-300">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {statusFilter !== 'all' && (
                                        <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 corner-clip-sm flex items-center gap-1 border border-cyan-500/50 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            Status: {statusFilter}
                                            <button onClick={() => setStatusFilter('all')} className="hover:text-cyan-300">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setStatusFilter('all');
                                        }}
                                        className="text-cyan-400 hover:text-cyan-300 font-bold ml-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}

                            {/* Results Count */}
                            <div className="text-sm text-cyan-400 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Showing {currentOrders.length} of {filteredOrders.length} orders
                                {filteredOrders.length !== orders.length && ` (filtered from ${orders.length} total)`}
                            </div>
                        </div>

                        {/* Orders List */}
                        {filteredOrders.length === 0 ? (
                            <div className="card p-12 text-center border-2 border-cyan-500/30" style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)' }}>
                                <Search className="w-16 h-16 mx-auto text-cyan-400 mb-4" style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.6))' }} />
                                <h3 className="text-2xl font-black text-cyan-400 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>No orders found</h3>
                                <p className="text-gray-400 mb-4 text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Try adjusting your search or filters</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('all');
                                    }}
                                    className="btn-secondary"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {currentOrders.map((order, index) => (
                                        <div
                                            key={order.id}
                                            className="card hover:shadow-lg transition-all duration-300 animate-fade-in overflow-hidden border-2 border-cyan-500/30"
                                            style={{ animationDelay: `${index * 0.05}s`, boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)' }}
                                        >
                                            {/* Compact Order Header */}
                                            <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800">
                                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                    {/* Left: Order Info */}
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-12 h-12 bg-cyan-500/20 corner-clip-sm flex items-center justify-center flex-shrink-0 border-2 border-cyan-500/50" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)' }}>
                                                            <Package className="w-6 h-6 text-cyan-400" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-black text-cyan-400 truncate uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                                                                #{order.id.slice(0, 8).toUpperCase()}
                                                            </h3>
                                                            <div className="flex items-center text-xs text-gray-400 mt-0.5 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                {formatDate(order.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>


                                                    {/* Right: Total & Action */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-400 uppercase tracking-wide font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total</p>
                                                            <p className="text-2xl font-black text-gradient" style={{ textShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                                                                {formatPrice(order.total)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleOrderDetails(order.id)}
                                                            className="btn-secondary px-3 py-2 text-sm flex items-center gap-1.5 hover:bg-gray-100 transition-colors flex-shrink-0"
                                                        >
                                                            <span className="hidden sm:inline">{expandedOrder === order.id ? 'Hide' : 'View'}</span>
                                                            {expandedOrder === order.id ? (
                                                                <ChevronUp className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Items Preview */}
                                            <div className="px-4 py-3 bg-gray-900/80 border-t border-cyan-500/30">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 text-sm font-bold flex-1 min-w-0" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                        <ShoppingBag className="w-4 h-4 text-cyan-400 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' }} />
                                                        <span className="text-cyan-400 uppercase tracking-wide flex-shrink-0">{order.items?.length} item(s)</span>
                                                        <span className="text-cyan-400/30 flex-shrink-0">•</span>
                                                        <span className="text-gray-400 truncate">{order.items?.[0]?.name}{order.items?.length > 1 && `, +${order.items.length - 1} more`}</span>
                                                    </div>
                                                    {/* Payment status badge */}
                                                    {order.paymentMethod === 'bank_transfer' ? (
                                                        order.paymentStatus === 'pending_verification' ? (
                                                            <span className="px-3 py-1.5 corner-clip-sm text-xs font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 flex items-center gap-1.5 uppercase tracking-wide whitespace-nowrap flex-shrink-0 animate-pulse" style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 10px rgba(255,200,0,0.3)' }}>
                                                                <Clock className="w-3.5 h-3.5" />
                                                                <span className="hidden sm:inline">Awaiting Verification</span>
                                                                <span className="sm:hidden">Pending</span>
                                                            </span>
                                                        ) : order.paymentStatus === 'rejected' ? (
                                                            <span className="px-3 py-1.5 corner-clip-sm text-xs font-black bg-red-500/20 text-red-400 border border-red-500/50 flex items-center gap-1.5 uppercase tracking-wide whitespace-nowrap flex-shrink-0" style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 10px rgba(255,0,0,0.3)' }}>
                                                                <AlertCircle className="w-3.5 h-3.5" />
                                                                <span className="hidden sm:inline">Payment Rejected</span>
                                                                <span className="sm:hidden">Rejected</span>
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1.5 corner-clip-sm text-xs font-black bg-green-500/20 text-green-400 border border-green-500/50 flex items-center gap-1.5 uppercase tracking-wide whitespace-nowrap flex-shrink-0" style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 10px rgba(0,255,0,0.3)' }}>
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                <span className="hidden sm:inline">Payment Verified</span>
                                                                <span className="sm:hidden">Verified</span>
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="px-3 py-1.5 corner-clip-sm text-xs font-black bg-magenta-500/20 text-magenta-400 border border-magenta-500/50 flex items-center gap-1.5 uppercase tracking-wide whitespace-nowrap flex-shrink-0" style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 10px rgba(255, 0, 255, 0.3)' }}>
                                                            <CheckCircle className="w-3.5 h-3.5" style={{ filter: 'drop-shadow(0 0 3px rgba(255, 0, 255, 0.8))' }} />
                                                            <span className="hidden sm:inline">Payment Successful</span>
                                                            <span className="sm:hidden">Paid</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {expandedOrder === order.id && (
                                                <div className="animate-fade-in border-t border-cyan-500/30">
                                                    {/* Order Progress Timeline */}
                                                    <div className="px-6 py-6 bg-gradient-to-r from-gray-900 to-gray-800">
                                                        <OrderProgress status={order.orderStatus} />
                                                    </div>

                                                    {/* Order Items */}
                                                    <div className="p-6 bg-gray-900 border-t border-cyan-500/30">
                                                        <h4 className="font-black mb-4 flex items-center gap-2 text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                                                            <ShoppingBag className="w-4 h-4 text-cyan-400" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' }} />
                                                            <span>Order Items</span>
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {order.items?.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-800/50 corner-clip-sm border border-cyan-500/20">
                                                                    <img
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        className="w-16 h-16 object-cover corner-clip-sm"
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <h5 className="font-bold truncate text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.name}</h5>
                                                                        <p className="text-sm text-gray-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                            Qty: {item.quantity} × {formatPrice(item.price)}
                                                                        </p>
                                                                    </div>
                                                                    <p className="font-black text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                                                                        {formatPrice(item.quantity * item.price)}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Shipping & Payment Info */}
                                                    <div className="p-6 border-t border-cyan-500/30 bg-gray-800/50">
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            {/* Shipping Address */}
                                                            <div>
                                                                <h4 className="font-black mb-3 flex items-center gap-2 text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                                                                    <MapPin className="w-4 h-4 text-cyan-400" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' }} />
                                                                    <span>Shipping Address</span>
                                                                </h4>
                                                                <div className="text-sm text-gray-300 space-y-1 bg-gray-900 p-4 corner-clip-sm border border-cyan-500/20" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                    <p className="font-bold text-white">{order.userName}</p>
                                                                    <p>{order.shippingAddress?.address}</p>
                                                                    <p>
                                                                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                                                                    </p>
                                                                    <p>{order.shippingAddress?.country}</p>
                                                                    {order.shippingAddress?.phone && (
                                                                        <p className="pt-2 border-t border-cyan-500/30">
                                                                            📞 {order.shippingAddress.phone}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Payment Summary */}
                                                            <div>
                                                                <h4 className="font-black mb-3 flex items-center gap-2 text-magenta-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(255, 0, 255, 0.5)' }}>
                                                                    {order.paymentMethod === 'bank_transfer' ? (
                                                                        <Banknote className="w-4 h-4 text-magenta-400" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 0, 255, 0.8))' }} />
                                                                    ) : (
                                                                        <CreditCard className="w-4 h-4 text-magenta-400" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 0, 255, 0.8))' }} />
                                                                    )}
                                                                    <span>Payment Summary</span>
                                                                </h4>
                                                                <div className="text-sm space-y-2 bg-gray-900 p-4 corner-clip-sm border border-magenta-500/20" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                    {order.paymentMethod === 'bank_transfer' && (
                                                                        <div className="flex justify-between items-center pb-2 border-b border-magenta-500/20">
                                                                            <span className="text-gray-400 font-bold">Method</span>
                                                                            <span className="font-bold text-magenta-400 flex items-center gap-1"><Banknote className="w-3.5 h-3.5" /> Bank Transfer</span>
                                                                        </div>
                                                                    )}
                                                                    {order.paymentMethod === 'bank_transfer' && order.slipUrl && (
                                                                        <div className="pb-2 border-b border-magenta-500/20">
                                                                            <p className="text-gray-400 font-bold mb-2">Payment Slip</p>
                                                                            <a href={order.slipUrl} target="_blank" rel="noopener noreferrer">
                                                                                <img src={order.slipUrl} alt="Payment slip" className="w-24 h-24 object-cover corner-clip-sm border border-magenta-500/40 hover:border-magenta-400 transition-all" />
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400 font-bold">Subtotal</span>
                                                                        <span className="font-bold text-white">{formatPrice(order.subtotal)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400 font-bold">Shipping</span>
                                                                        <span className="font-bold text-white">
                                                                            {order.shipping === 0 ? (
                                                                                <span className="text-magenta-400">FREE</span>
                                                                            ) : (
                                                                                formatPrice(order.shipping)
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400 font-bold">Tax (7%)</span>
                                                                        <span className="font-bold text-white">{formatPrice(order.tax)}</span>
                                                                    </div>
                                                                    <div className="border-t border-cyan-500/30 pt-2 flex justify-between items-center">
                                                                        <span className="font-black text-cyan-400 uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>Total</span>
                                                                        <span className="font-black text-2xl text-gradient" style={{ textShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                                                                            {formatPrice(order.total)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 corner-clip-sm border-2 border-cyan-500/50 text-cyan-400 font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500/20 transition-colors"
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                        >
                                            Previous
                                        </button>

                                        <div className="flex gap-1">
                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;
                                                // Show first, last, current, and adjacent pages
                                                if (
                                                    pageNumber === 1 ||
                                                    pageNumber === totalPages ||
                                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <button
                                                            key={pageNumber}
                                                            onClick={() => paginate(pageNumber)}
                                                            className={`w-10 h-10 corner-clip-sm font-black transition-all ${currentPage === pageNumber
                                                                ? 'bg-cyan-500 text-white border-2 border-cyan-400'
                                                                : 'border-2 border-gray-600 text-gray-400 hover:border-cyan-500/50'
                                                                }`}
                                                            style={currentPage === pageNumber ? { boxShadow: '0 0 15px rgba(0, 255, 255, 0.6)', fontFamily: 'Orbitron, sans-serif' } : { fontFamily: 'Orbitron, sans-serif' }}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    );
                                                } else if (
                                                    pageNumber === currentPage - 2 ||
                                                    pageNumber === currentPage + 2
                                                ) {
                                                    return <span key={pageNumber} className="px-2 py-2 text-cyan-400/50 font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>

                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 corner-clip-sm border-2 border-cyan-500/50 text-cyan-400 font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500/20 transition-colors"
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Back to Shopping */}
                        <div className="text-center mt-8">
                            <Link
                                to="/products"
                                className="text-cyan-400 hover:text-cyan-300 font-black uppercase tracking-wide inline-flex items-center gap-2 transition-colors duration-200"
                                style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
                            >
                                <ShoppingBag className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' }} />
                                <span>Continue Shopping</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Orders;
