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
            const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            const usersSnapshot = await getDocs(usersQuery);

            const ordersSnapshot = await getDocs(collection(db, 'orders'));
            const ordersByUser = {};

            ordersSnapshot.forEach((doc) => {
                const order = doc.data();
                if (!ordersByUser[order.userId]) {
                    ordersByUser[order.userId] = { totalOrders: 0, totalSpent: 0 };
                }
                ordersByUser[order.userId].totalOrders++;
                ordersByUser[order.userId].totalSpent += order.total || 0;
            });

            const customersData = usersSnapshot.docs
                .filter(doc => !doc.data().isAdmin) // exclude admin accounts
                .map(doc => {
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
            <div className="flex items-center justify-center h-screen" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #0f172a 50%, #1a1f3a 100%)' }}>
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-cyan-500/30 corner-clip animate-spin"
                            style={{ borderTopColor: 'rgba(0,255,255,0.9)', boxShadow: '0 0 20px rgba(0,255,255,0.5)' }}></div>
                        <div className="absolute inset-3 border-2 border-purple-500/50 corner-clip animate-ping"
                            style={{ borderColor: 'rgba(147,51,234,0.6)' }}></div>
                    </div>
                    <p className="text-cyan-400 uppercase tracking-widest font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Loading Customers...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #0f172a 50%, #1a1f3a 100%)' }}>

            {/* Header — hidden on mobile (shown in AdminDashboard top bar) */}
            <div className="hidden md:block bg-gray-900 corner-clip p-8 border-2 border-purple-500/40 relative overflow-hidden"
                style={{ boxShadow: '0 0 40px rgba(147, 51, 234, 0.25)' }}>
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(147,51,234,0.15) 2px, rgba(147,51,234,0.15) 4px)' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent" />
                <div className="flex items-center space-x-4 relative z-10">
                    <div className="w-16 h-16 border-2 border-purple-500/50 corner-clip flex items-center justify-center"
                        style={{ boxShadow: '0 0 25px rgba(147, 51, 234, 0.3)' }}>
                        <Users className="w-8 h-8 text-purple-400" style={{ filter: 'drop-shadow(0 0 5px rgba(147, 51, 234, 0.5))' }} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-1"
                            style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(147, 51, 234, 0.9)' }}>
                            Customers
                        </h1>
                        <p className="text-purple-300/70 text-lg font-bold uppercase tracking-wide"
                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Manage &amp; View Your Customer Base
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">

                {/* Total Customers — Cyan */}
                <div className="bg-gray-900 corner-clip p-4 md:p-6 border-2 border-cyan-500/40 relative overflow-hidden hover:border-cyan-400/60 transition-all"
                    style={{ boxShadow: '0 0 20px rgba(0,255,255,0.15)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 relative z-10 gap-2">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-cyan-500/20 corner-clip-sm flex items-center justify-center border border-cyan-500/40 flex-shrink-0">
                            <Users className="w-5 h-5 md:w-7 md:h-7 text-cyan-400" style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,255,0.8))' }} />
                        </div>
                        <div className="sm:text-right">
                            <p className="text-cyan-400/70 text-[10px] md:text-xs font-black uppercase tracking-wide mb-0.5 md:mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Customers</p>
                            <p className="text-2xl sm:text-3xl md:text-5xl font-black text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0,255,255,0.8)' }}>{stats.total}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-gray-700 overflow-hidden relative z-10">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400" style={{ width: '100%', boxShadow: '0 0 8px rgba(0,255,255,0.6)' }}></div>
                    </div>
                </div>

                {/* Active — Green */}
                <div className="bg-gray-900 corner-clip p-4 md:p-6 border-2 border-green-500/40 relative overflow-hidden hover:border-green-400/60 transition-all"
                    style={{ boxShadow: '0 0 20px rgba(0,255,0,0.15)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 relative z-10 gap-2">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-green-500/20 corner-clip-sm flex items-center justify-center border border-green-500/40 flex-shrink-0">
                            <ShoppingBag className="w-5 h-5 md:w-7 md:h-7 text-green-400" style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,0,0.8))' }} />
                        </div>
                        <div className="sm:text-right">
                            <p className="text-green-400/70 text-[10px] md:text-xs font-black uppercase tracking-wide mb-0.5 md:mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Active Customers</p>
                            <p className="text-2xl sm:text-3xl md:text-5xl font-black text-green-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0,255,0,0.8)' }}>{stats.active}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-gray-700 overflow-hidden relative z-10">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                            style={{ width: `${(stats.active / (stats.total || 1) * 100)}%`, boxShadow: '0 0 8px rgba(0,255,0,0.6)' }}></div>
                    </div>
                </div>

                {/* Inactive — Gray */}
                <div className="bg-gray-900 corner-clip p-4 md:p-6 border-2 border-gray-500/40 relative overflow-hidden hover:border-gray-400/60 transition-all"
                    style={{ boxShadow: '0 0 20px rgba(150,150,150,0.1)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 relative z-10 gap-2">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-500/20 corner-clip-sm flex items-center justify-center border border-gray-500/40 flex-shrink-0">
                            <Users className="w-5 h-5 md:w-7 md:h-7 text-gray-400" style={{ filter: 'drop-shadow(0 0 5px rgba(200,200,200,0.5))' }} />
                        </div>
                        <div className="sm:text-right">
                            <p className="text-gray-400/70 text-[10px] md:text-xs font-black uppercase tracking-wide mb-0.5 md:mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Inactive</p>
                            <p className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-300" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(200,200,200,0.4)' }}>{stats.inactive}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-gray-700 overflow-hidden relative z-10">
                        <div className="h-full bg-gradient-to-r from-gray-500 to-gray-400"
                            style={{ width: `${(stats.inactive / (stats.total || 1) * 100)}%`, boxShadow: '0 0 8px rgba(200,200,200,0.3)' }}></div>
                    </div>
                </div>

                {/* Total Revenue — Purple */}
                <div className="bg-gray-900 corner-clip p-4 md:p-6 border-2 border-purple-500/40 relative overflow-hidden hover:border-purple-400/60 transition-all"
                    style={{ boxShadow: '0 0 20px rgba(147,51,234,0.15)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 relative z-10 gap-2">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-purple-500/20 corner-clip-sm flex items-center justify-center border border-purple-500/40 flex-shrink-0">
                            <DollarSign className="w-5 h-5 md:w-7 md:h-7 text-purple-400" style={{ filter: 'drop-shadow(0 0 5px rgba(147,51,234,0.8))' }} />
                        </div>
                        <div className="sm:text-right">
                            <p className="text-purple-400/70 text-[10px] md:text-xs font-black uppercase tracking-wide mb-0.5 md:mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Revenue</p>
                            <p className="text-2xl sm:text-3xl md:text-5xl font-black text-purple-400 truncate" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(147,51,234,0.8)' }}>
                                ฿{(stats.totalRevenue / 1000).toFixed(1)}K
                            </p>
                        </div>
                    </div>
                    <div className="h-1 bg-gray-700 overflow-hidden relative z-10">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400" style={{ width: '100%', boxShadow: '0 0 8px rgba(147,51,234,0.6)' }}></div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-900 corner-clip p-6 border-2 border-purple-500/30 relative overflow-hidden"
                style={{ boxShadow: '0 0 20px rgba(147,51,234,0.1)' }}>
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(147,51,234,0.15) 2px, rgba(147,51,234,0.15) 4px)' }}></div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">

                    {/* Search */}
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-purple-400"
                            style={{ filter: 'drop-shadow(0 0 5px rgba(147,51,234,0.6))' }} />
                        <input
                            type="text"
                            placeholder="SEARCH BY NAME OR EMAIL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-800 border-2 border-purple-500/50 corner-clip-sm text-white text-xs md:text-sm placeholder-purple-300/30 focus:outline-none focus:border-purple-400 transition-all uppercase tracking-widest"
                            style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 15px rgba(147,51,234,0.15)' }}
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible">
                        {[
                            { key: 'all', label: 'All', icon: Users },
                            { key: 'active', label: 'Active', icon: ShoppingBag },
                            { key: 'inactive', label: 'Inactive', icon: Calendar }
                        ].map(({ key, label, icon: Icon }) => {
                            const isActive = filterStatus === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setFilterStatus(key)}
                                    className={`inline-flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 corner-clip-sm font-black text-xs md:text-sm uppercase tracking-wide border-2 transition-all whitespace-nowrap flex-shrink-0 ${isActive
                                        ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                                        : 'border-purple-600/30 text-purple-600 hover:border-purple-500'
                                        }`}
                                    style={{
                                        fontFamily: 'Rajdhani, sans-serif',
                                        boxShadow: isActive ? '0 0 15px rgba(147,51,234,0.4)' : 'none'
                                    }}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Customers — Table on desktop, Cards on mobile */}
            <div className="bg-gray-900 corner-clip overflow-hidden border-2 border-purple-500/30 relative"
                style={{ boxShadow: '0 0 30px rgba(147,51,234,0.2)' }}>
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(147,51,234,0.15) 2px, rgba(147,51,234,0.15) 4px)' }} />

                {filteredCustomers.length === 0 ? (
                    <div className="px-6 py-12 text-center relative z-10">
                        <Users className="w-12 h-12 text-purple-500/40 mx-auto mb-3" />
                        <p className="text-gray-300 font-black uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>No customers found</p>
                        <p className="text-sm text-gray-400 mt-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto relative z-10">
                            <table className="w-full">
                                <thead className="bg-gray-800/80 border-b-2 border-purple-500/50">
                                    <tr>
                                        {['Customer', 'Contact', 'Location', 'Joined', 'Orders', 'Total Spent', 'Status'].map(h => (
                                            <th key={h} className="px-6 py-4 text-left text-xs font-black text-purple-400 uppercase tracking-widest"
                                                style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 8px rgba(147,51,234,0.6)' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-500/10">
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-purple-500/5 transition-colors border-b border-purple-500/10">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 border border-purple-500/50 corner-clip-sm flex items-center justify-center flex-shrink-0"
                                                        style={{ boxShadow: '0 0 12px rgba(147,51,234,0.2)' }}>
                                                        <span className="text-purple-400 font-black text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                            {customer.displayName?.charAt(0)?.toUpperCase() || customer.email?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{customer.displayName || 'No Name'}</p>
                                                        <p className="text-sm text-gray-300">{customer.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2 text-sm text-gray-200">
                                                        <Mail className="w-4 h-4 text-purple-400" />
                                                        <span className="truncate max-w-[200px]">{customer.email}</span>
                                                    </div>
                                                    {customer.phone && (
                                                        <div className="flex items-center space-x-2 text-sm text-gray-200">
                                                            <Phone className="w-4 h-4 text-purple-400" />
                                                            <span>{customer.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {customer.city || customer.country ? (
                                                    <div className="flex items-center space-x-2 text-sm text-gray-200">
                                                        <MapPin className="w-4 h-4 flex-shrink-0 text-purple-400" />
                                                        <span>{customer.city || ''}{customer.city && customer.country ? ', ' : ''}{customer.country || ''}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Not provided</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2 text-sm text-gray-200">
                                                    <Calendar className="w-4 h-4 text-purple-400" />
                                                    <span style={{ fontFamily: 'Rajdhani, sans-serif' }}>{customer.joinDate.toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 corner-clip-sm text-sm font-black border border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                                                    style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 8px rgba(0,255,255,0.2)' }}>
                                                    {customer.totalOrders} orders
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-black text-green-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 8px rgba(0,255,0,0.5)' }}>
                                                    ฿{customer.totalSpent.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {customer.totalOrders > 0 ? (
                                                    <span className="inline-flex items-center px-3 py-1 corner-clip-sm text-xs font-black uppercase border border-green-500/50 bg-green-500/10 text-green-400"
                                                        style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 10px rgba(0,255,0,0.3)' }}>Active</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 corner-clip-sm text-xs font-black uppercase border border-gray-500/40 bg-gray-500/10 text-gray-400"
                                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>Inactive</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-purple-500/10 relative z-10">
                            {filteredCustomers.map((customer) => (
                                <div key={customer.id} className="flex items-center gap-3 p-4 hover:bg-purple-500/5 transition-colors">
                                    <div className="w-11 h-11 border border-purple-500/50 corner-clip-sm flex items-center justify-center flex-shrink-0"
                                        style={{ boxShadow: '0 0 10px rgba(147,51,234,0.2)' }}>
                                        <span className="text-purple-400 font-black text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                            {customer.displayName?.charAt(0)?.toUpperCase() || customer.email?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-white text-sm truncate" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{customer.displayName || 'No Name'}</p>
                                        <p className="text-xs text-gray-400 truncate">{customer.email}</p>
                                        {(customer.phone || customer.city) && (
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                {customer.phone && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                                        <Phone className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                                {(customer.city || customer.country) && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                                        <MapPin className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                                        <span className="truncate">{customer.city || ''}{customer.city && customer.country ? ', ' : ''}{customer.country || ''}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <span className="text-xs px-2 py-0.5 border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 corner-clip-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{customer.totalOrders} orders</span>
                                            <span className="text-xs font-black text-green-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>฿{customer.totalSpent.toFixed(0)}</span>
                                            {customer.totalOrders > 0 ? (
                                                <span className="text-xs px-2 py-0.5 border border-green-500/50 bg-green-500/10 text-green-400 corner-clip-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Active</span>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5 border border-gray-500/40 bg-gray-500/10 text-gray-400 corner-clip-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Inactive</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Summary Footer */}
            <div className="bg-gray-900/80 corner-clip-sm p-5 border-2 border-purple-500/20 relative overflow-hidden"
                style={{ boxShadow: '0 0 15px rgba(147,51,234,0.1)' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent"></div>
                <p className="text-sm text-gray-300 font-black uppercase relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    Showing{' '}
                    <span className="font-black text-purple-400 text-lg" style={{ textShadow: '0 0 8px rgba(147,51,234,0.6)' }}>
                        {filteredCustomers.length}
                    </span>
                    {' '}of{' '}
                    <span className="font-black text-purple-400 text-lg" style={{ textShadow: '0 0 8px rgba(147,51,234,0.6)' }}>
                        {customers.length}
                    </span>
                    {' '}customers
                </p>
            </div>
        </div>
    );
};

export default AdminCustomers;
