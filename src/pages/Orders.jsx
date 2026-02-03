import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Package, Truck, CheckCircle, Clock, ShoppingBag, ChevronDown, ChevronUp, Calendar, MapPin, CreditCard, Search, Filter, X } from 'lucide-react';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);

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
                <h4 className="font-semibold mb-4">Order Progress</h4>
                <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
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
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                        } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                                        <StepIcon className="w-5 h-5" />
                                    </div>
                                    <span className={`mt-2 text-xs font-medium ${isCompleted ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
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
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'shipped':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
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
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
                        <Package className="w-16 h-16 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Please Log In</h2>
                    <p className="text-gray-600 mb-8">
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
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold mb-2">
                        My <span className="text-gradient">Orders</span>
                    </h1>
                    <p className="text-gray-600">
                        {orders.length} {orders.length === 1 ? 'order' : 'orders'} total • Real-time updates
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 animate-fade-in">
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-20 animate-fade-in bg-white rounded-xl shadow-sm">
                        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
                            <ShoppingBag className="w-16 h-16 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">No Orders Yet</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
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
                            <div className="card p-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                1
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Filter Options */}
                                {showFilters && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-sm font-semibold text-gray-700 self-center mr-2">Status:</span>
                                            {['all', 'processing', 'shipped', 'delivered'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => setStatusFilter(status)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === status
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
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
                                    <span className="text-gray-600">Active filters:</span>
                                    {searchQuery && (
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1">
                                            Search: "{searchQuery}"
                                            <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {statusFilter !== 'all' && (
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1">
                                            Status: {statusFilter}
                                            <button onClick={() => setStatusFilter('all')} className="hover:text-blue-900">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setStatusFilter('all');
                                        }}
                                        className="text-blue-600 hover:text-blue-700 font-semibold ml-2"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}

                            {/* Results Count */}
                            <div className="text-sm text-gray-600">
                                Showing {currentOrders.length} of {filteredOrders.length} orders
                                {filteredOrders.length !== orders.length && ` (filtered from ${orders.length} total)`}
                            </div>
                        </div>

                        {/* Orders List */}
                        {filteredOrders.length === 0 ? (
                            <div className="card p-12 text-center">
                                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No orders found</h3>
                                <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
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
                                            className="card hover:shadow-lg transition-all duration-300 animate-fade-in overflow-hidden"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            {/* Compact Order Header */}
                                            <div className="p-4 bg-white">
                                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                    {/* Left: Order Info */}
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Package className="w-6 h-6 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-gray-900 truncate">
                                                                #{order.id.slice(0, 8).toUpperCase()}
                                                            </h3>
                                                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                {formatDate(order.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>


                                                    {/* Middle: Payment Status */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 flex items-center gap-2 shadow-sm">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Payment Successful</span>
                                                        </span>
                                                    </div>

                                                    {/* Right: Total & Action */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500">Total</p>
                                                            <p className="text-xl font-bold text-blue-600">
                                                                ฿{order.total?.toFixed(2)}
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
                                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <ShoppingBag className="w-4 h-4" />
                                                    <span className="font-medium">{order.items?.length} item(s)</span>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="truncate">{order.items?.[0]?.name}{order.items?.length > 1 && `, +${order.items.length - 1} more`}</span>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {expandedOrder === order.id && (
                                                <div className="animate-fade-in border-t border-gray-200">
                                                    {/* Order Progress Timeline */}
                                                    <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                                                        <OrderProgress status={order.orderStatus} />
                                                    </div>

                                                    {/* Order Items */}
                                                    <div className="p-6 bg-white border-t border-gray-200">
                                                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                                                            <ShoppingBag className="w-4 h-4 text-gray-600" />
                                                            <span>Order Items</span>
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {order.items?.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                                                    <img
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        className="w-16 h-16 object-cover rounded-lg"
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <h5 className="font-semibold truncate">{item.name}</h5>
                                                                        <p className="text-sm text-gray-600">
                                                                            Qty: {item.quantity} × ฿{item.price?.toFixed(2)}
                                                                        </p>
                                                                    </div>
                                                                    <p className="font-bold text-blue-600">
                                                                        ฿{(item.quantity * item.price)?.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Shipping & Payment Info */}
                                                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            {/* Shipping Address */}
                                                            <div>
                                                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                                    <MapPin className="w-4 h-4 text-blue-600" />
                                                                    <span>Shipping Address</span>
                                                                </h4>
                                                                <div className="text-sm text-gray-700 space-y-1 bg-white p-4 rounded-lg">
                                                                    <p className="font-semibold">{order.userName}</p>
                                                                    <p>{order.shippingAddress?.address}</p>
                                                                    <p>
                                                                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                                                                    </p>
                                                                    <p>{order.shippingAddress?.country}</p>
                                                                    {order.shippingAddress?.phone && (
                                                                        <p className="pt-2 border-t border-gray-200">
                                                                            📞 {order.shippingAddress.phone}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Payment Summary */}
                                                            <div>
                                                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                                    <CreditCard className="w-4 h-4 text-green-600" />
                                                                    <span>Payment Summary</span>
                                                                </h4>
                                                                <div className="text-sm space-y-2 bg-white p-4 rounded-lg">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Subtotal</span>
                                                                        <span className="font-semibold">฿{order.subtotal?.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Shipping</span>
                                                                        <span className="font-semibold">
                                                                            {order.shipping === 0 ? (
                                                                                <span className="text-green-600">FREE</span>
                                                                            ) : (
                                                                                `฿${order.shipping?.toFixed(2)}`
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Tax (7%)</span>
                                                                        <span className="font-semibold">฿{order.tax?.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                                                                        <span className="font-bold">Total</span>
                                                                        <span className="font-bold text-xl text-blue-600">
                                                                            ฿{order.total?.toFixed(2)}
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
                                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
                                                            className={`w-10 h-10 rounded-lg font-semibold transition-all ${currentPage === pageNumber
                                                                ? 'bg-blue-600 text-white shadow-md'
                                                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    );
                                                } else if (
                                                    pageNumber === currentPage - 2 ||
                                                    pageNumber === currentPage + 2
                                                ) {
                                                    return <span key={pageNumber} className="px-2 py-2 text-gray-400">...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>

                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
                                className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-2 transition-colors duration-200"
                            >
                                <ShoppingBag className="w-5 h-5" />
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
