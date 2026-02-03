import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Users, Search, Mail, Phone, MapPin, Calendar, ShoppingBag, DollarSign, Filter } from 'lucide-react';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);

            // Fetch all users
            const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            const usersSnapshot = await getDocs(usersQuery);

            // Fetch all orders to calculate customer stats
            const ordersSnapshot = await getDocs(collection(db, 'orders'));
            const ordersByUser = {};

            ordersSnapshot.forEach((doc) => {
                const order = doc.data();
                if (!ordersByUser[order.userId]) {
                    ordersByUser[order.userId] = {
                        totalOrders: 0,
                        totalSpent: 0
                    };
                }
                ordersByUser[order.userId].totalOrders++;
                ordersByUser[order.userId].totalSpent += order.total || 0;
            });

            // Combine user data with order stats
            const customersData = usersSnapshot.docs.map(doc => {
                const userData = doc.data();
                const stats = ordersByUser[doc.id] || { totalOrders: 0, totalSpent: 0 };

                return {
                    id: doc.id,
                    ...userData,
                    ...stats,
                    joinDate: userData.createdAt?.toDate() || new Date()
                };
            });

            setCustomers(customersData);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch =
            customer.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'active' && customer.totalOrders > 0) ||
            (filterStatus === 'inactive' && customer.totalOrders === 0);

        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: customers.length,
        active: customers.filter(c => c.totalOrders > 0).length,
        inactive: customers.filter(c => c.totalOrders === 0).length,
        totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading customers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                            Customers
                        </h1>
                        <p className="text-gray-600 text-lg">Manage and view your customer base</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-blue-100 text-sm font-medium mb-1">Total Customers</p>
                            <p className="text-4xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-green-100 text-sm font-medium mb-1">Active Customers</p>
                            <p className="text-4xl font-bold">{stats.active}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${(stats.active / stats.total * 100) || 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-gray-100 text-sm font-medium mb-1">Inactive</p>
                            <p className="text-4xl font-bold">{stats.inactive}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${(stats.inactive / stats.total * 100) || 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <DollarSign className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-purple-100 text-sm font-medium mb-1">Total Revenue</p>
                            <p className="text-4xl font-bold">฿{(stats.totalRevenue / 1000).toFixed(1)}K</p>
                        </div>
                    </div>
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Filter */}
                    <div className="flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        >
                            <option value="all">All Customers</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Orders</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Total Spent</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600 font-medium">No customers found</p>
                                        <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-bold text-sm">
                                                        {customer.displayName?.charAt(0)?.toUpperCase() || customer.email?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {customer.displayName || 'No Name'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Mail className="w-4 h-4" />
                                                    <span className="truncate max-w-[200px]">{customer.email}</span>
                                                </div>
                                                {customer.phone && (
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{customer.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.city || customer.country ? (
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                                    <span>{customer.city || ''}{customer.city && customer.country ? ', ' : ''}{customer.country || ''}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Not provided</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>{customer.joinDate.toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                                {customer.totalOrders} orders
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-green-600">
                                                ฿{customer.totalSpent.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.totalOrders > 0 ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 shadow-lg">
                <p className="text-sm text-blue-900 font-medium">
                    Showing <span className="font-bold text-blue-600 text-lg">{filteredCustomers.length}</span> of <span className="font-bold text-blue-600 text-lg">{customers.length}</span> customers
                </p>
            </div>
        </div>
    );
};

export default AdminCustomers;
