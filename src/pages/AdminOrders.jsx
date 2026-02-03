import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Package, Truck, CheckCircle, Clock, Calendar, User, MapPin, Search, ShoppingCart } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [updating, setUpdating] = useState(null);

    // Real-time orders subscription
    useEffect(() => {
        const ordersRef = collection(db, 'orders');

        const unsubscribe = onSnapshot(ordersRef,
            (querySnapshot) => {
                const ordersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                    updatedAt: doc.data().updatedAt?.toDate()
                }));

                // Sort by date (newest first)
                ordersData.sort((a, b) => {
                    if (!a.createdAt) return 1;
                    if (!b.createdAt) return -1;
                    return b.createdAt - a.createdAt;
                });

                setOrders(ordersData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching orders:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setUpdating(orderId);
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                orderStatus: newStatus,
                updatedAt: serverTimestamp()
            });
            // Success feedback
            setTimeout(() => setUpdating(null), 1000);
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status');
            setUpdating(null);
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

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        all: orders.length,
        processing: orders.filter(o => o.orderStatus === 'processing').length,
        shipped: orders.filter(o => o.orderStatus === 'shipped').length,
        delivered: orders.filter(o => o.orderStatus === 'delivered').length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen p-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                            Order Management
                        </h1>
                        <p className="text-gray-600 text-lg">Manage and track all customer orders • Real-time updates</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Package className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-gray-100 text-sm font-medium mb-1">Total Orders</p>
                            <p className="text-4xl font-bold">{statusCounts.all}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Clock className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-yellow-100 text-sm font-medium mb-1">Processing</p>
                            <p className="text-4xl font-bold">{statusCounts.processing}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${(statusCounts.processing / statusCounts.all * 100) || 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Truck className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-blue-100 text-sm font-medium mb-1">Shipped</p>
                            <p className="text-4xl font-bold">{statusCounts.shipped}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${(statusCounts.shipped / statusCounts.all * 100) || 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-green-100 text-sm font-medium mb-1">Delivered</p>
                            <p className="text-4xl font-bold">{statusCounts.delivered}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${(statusCounts.delivered / statusCounts.all * 100) || 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer name, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'processing', 'shipped', 'delivered'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 ${filterStatus === status
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                <span className={`ml-1 text-xs ${filterStatus === status ? 'text-blue-100' : 'text-gray-500'}`}>
                                    ({statusCounts[status]})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Order
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <Package className="w-4 h-4 text-blue-600" />
                                                <span className="font-mono text-sm font-semibold">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {order.items?.length} item(s)
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start space-x-2">
                                                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-sm">{order.userName}</div>
                                                    <div className="text-xs text-gray-500">{order.userEmail}</div>
                                                    {order.shippingAddress && (
                                                        <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                                                            <div className="flex items-start">
                                                                <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                                                <div className="break-words">
                                                                    <div>{order.shippingAddress.address}</div>
                                                                    <div>
                                                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                                                    </div>
                                                                    <div>{order.shippingAddress.country}</div>
                                                                    {order.shippingAddress.phone && (
                                                                        <div className="mt-1">📞 {order.shippingAddress.phone}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {formatDate(order.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-blue-600">
                                                ฿{order.total?.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.paymentStatus === 'paid' && '✓ Paid'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.orderStatus}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                disabled={updating === order.id}
                                                className={`text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${updating === order.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                                    }`}
                                            >
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                            </select>
                                            {updating === order.id && (
                                                <div className="text-xs text-green-600 mt-1">✓ Updated</div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
