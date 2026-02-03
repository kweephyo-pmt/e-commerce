import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Package, Truck, CheckCircle, Clock, Calendar, User, MapPin, Search } from 'lucide-react';

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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold mb-2">Order Management</h2>
                <p className="text-gray-600">Manage and track all customer orders • Real-time updates</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold">{statusCounts.all}</p>
                        </div>
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Processing</p>
                            <p className="text-2xl font-bold text-yellow-600">{statusCounts.processing}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-400" />
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Shipped</p>
                            <p className="text-2xl font-bold text-blue-600">{statusCounts.shipped}</p>
                        </div>
                        <Truck className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Delivered</p>
                            <p className="text-2xl font-bold text-green-600">{statusCounts.delivered}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer name, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-10 w-full"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2">
                        {['all', 'processing', 'shipped', 'delivered'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${filterStatus === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                <span className="ml-1 text-xs">({statusCounts[status]})</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                                                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <div className="font-semibold text-sm">{order.userName}</div>
                                                    <div className="text-xs text-gray-500">{order.userEmail}</div>
                                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {order.shippingAddress?.city}
                                                    </div>
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
