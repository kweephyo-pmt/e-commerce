import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logActivity } from '../utils/logActivity';
import { Package, Truck, CheckCircle, Clock, Calendar, User, MapPin, Mail, Phone, Search, ShoppingCart, ChevronDown, ChevronRight, Banknote, XCircle, Eye, X, AlertCircle, Filter, LayoutList } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [updating, setUpdating] = useState(null);
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [slipModal, setSlipModal] = useState(null); // URL of slip to show full-screen
    const [paymentUpdating, setPaymentUpdating] = useState(null);

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

    const toggleOrderExpansion = (orderId) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setUpdating(orderId);
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { orderStatus: newStatus, updatedAt: serverTimestamp() });
            await logActivity({
                type: 'order', icon: 'ShoppingCart',
                title: 'Order Status Updated',
                description: `Order #${orderId.slice(0, 8).toUpperCase()} → ${newStatus}`,
                color: 'green'
            });
            setTimeout(() => setUpdating(null), 1000);
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status');
            setUpdating(null);
        }
    };

    const confirmPayment = async (orderId, orderData) => {
        try {
            setPaymentUpdating(orderId);
            await updateDoc(doc(db, 'orders', orderId), {
                paymentStatus: 'paid',
                orderStatus: 'processing',
                paymentConfirmedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            await logActivity({
                type: 'order', icon: 'ShoppingCart',
                title: 'Payment Confirmed',
                description: `Order #${orderId.slice(0, 8).toUpperCase()} · ฿${orderData.total?.toFixed(2)} — Payment verified`,
                color: 'green'
            });
        } catch (e) {
            console.error('Error confirming payment:', e);
            alert('Failed to confirm payment');
        } finally {
            setPaymentUpdating(null);
        }
    };

    const rejectPayment = async (orderId) => {
        if (!window.confirm('Reject this payment? The order will be marked as payment rejected.')) return;
        try {
            setPaymentUpdating(orderId);
            await updateDoc(doc(db, 'orders', orderId), {
                paymentStatus: 'rejected',
                orderStatus: 'cancelled',
                updatedAt: serverTimestamp(),
            });
            await logActivity({
                type: 'order', icon: 'ShoppingCart',
                title: 'Payment Rejected',
                description: `Order #${orderId.slice(0, 8).toUpperCase()} — Payment slip rejected`,
                color: 'red'
            });
        } catch (e) {
            console.error('Error rejecting payment:', e);
            alert('Failed to reject payment');
        } finally {
            setPaymentUpdating(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'processing': return { className: 'border-yellow-500/60 text-yellow-400 bg-yellow-500/10', glow: '0 0 10px rgba(234,179,8,0.4)' };
            case 'shipped': return { className: 'border-cyan-500/60 text-cyan-400 bg-cyan-500/10', glow: '0 0 10px rgba(0,255,255,0.4)' };
            case 'delivered': return { className: 'border-green-500/60 text-green-400 bg-green-500/10', glow: '0 0 10px rgba(0,255,0,0.4)' };
            case 'pending': return { className: 'border-orange-500/60 text-orange-400 bg-orange-500/10', glow: '0 0 10px rgba(255,165,0,0.4)' };
            case 'cancelled': return { className: 'border-red-500/60 text-red-400 bg-red-500/10', glow: '0 0 10px rgba(255,0,0,0.4)' };
            default: return { className: 'border-gray-500/60 text-gray-400 bg-gray-500/10', glow: 'none' };
        }
    };

    const getPaymentBadge = (paymentStatus) => {
        switch (paymentStatus) {
            case 'paid': return { label: '✓ PAID', cls: 'text-green-400' };
            case 'pending_verification': return { label: '⏳ PENDING', cls: 'text-yellow-400 animate-pulse' };
            case 'rejected': return { label: '✗ REJECTED', cls: 'text-red-400' };
            default: return null;
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

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'pending_verification' ? order.paymentStatus === 'pending_verification' : order.orderStatus === filterStatus);
        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        all: orders.length,
        pending_verification: orders.filter(o => o.paymentStatus === 'pending_verification').length,
        processing: orders.filter(o => o.orderStatus === 'processing').length,
        shipped: orders.filter(o => o.orderStatus === 'shipped').length,
        delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-cyan-500/30 corner-clip animate-spin"
                            style={{ borderTopColor: 'rgba(0,255,255,0.9)', boxShadow: '0 0 20px rgba(0,255,255,0.5)' }}></div>
                        <div className="absolute inset-3 border-2 border-magenta-500/50 corner-clip animate-ping"
                            style={{ borderColor: 'rgba(255,0,255,0.6)' }}></div>
                    </div>
                    <p className="text-cyan-400 uppercase tracking-widest font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Loading Orders...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6 min-h-screen p-4 md:p-6" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #0f172a 50%, #1a1f3a 100%)' }}>

            {/* Header — hidden on mobile (shown in AdminDashboard top bar) */}
            <div className="hidden md:block bg-gray-900 corner-clip p-8 border-2 border-cyan-500/30 relative overflow-hidden"
                style={{ boxShadow: '0 0 40px rgba(0, 255, 255, 0.2)' }}>
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)' }} />
                <div className="flex items-center space-x-4 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 corner-clip flex items-center justify-center"
                        style={{ boxShadow: '0 0 25px rgba(0, 255, 255, 0.6)' }}>
                        <ShoppingCart className="w-8 h-8 text-white" style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.8))' }} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-1"
                            style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 0.8)' }}>
                            Order Management
                        </h1>
                        <p className="text-cyan-300/70 text-lg font-bold uppercase tracking-wide"
                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Track &amp; Manage All Customer Orders • Real-Time Updates
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {/* Total Orders */}
                <div className="bg-gray-900 corner-clip p-4 md:p-6 border-2 border-gray-500/40 relative overflow-hidden group hover:border-gray-400/60 transition-all"
                    style={{ boxShadow: '0 0 20px rgba(150,150,150,0.15)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 relative z-10 gap-2">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-500/20 corner-clip-sm flex items-center justify-center border border-gray-500/40 flex-shrink-0">
                            <Package className="w-5 h-5 md:w-7 md:h-7 text-gray-300" style={{ filter: 'drop-shadow(0 0 5px rgba(200,200,200,0.6))' }} />
                        </div>
                        <div className="sm:text-right">
                            <p className="text-gray-400 text-[10px] md:text-xs font-black uppercase tracking-wide mb-0.5 md:mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Orders</p>
                            <p className="text-2xl sm:text-3xl md:text-5xl font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(200,200,200,0.5)' }}>{statusCounts.all}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-gray-700 overflow-hidden relative z-10">
                        <div className="h-full bg-gradient-to-r from-gray-400 to-gray-300" style={{ width: '100%', boxShadow: '0 0 8px rgba(200,200,200,0.6)' }}></div>
                    </div>
                </div>

                {/* Processing */}
                <div className="bg-gray-900 corner-clip p-4 md:p-6 border-2 border-yellow-500/40 relative overflow-hidden group hover:border-yellow-400/60 transition-all"
                    style={{ boxShadow: '0 0 20px rgba(234,179,8,0.15)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 relative z-10 gap-2">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-yellow-500/20 corner-clip-sm flex items-center justify-center border border-yellow-500/40 flex-shrink-0">
                            <Clock className="w-5 h-5 md:w-7 md:h-7 text-yellow-400" style={{ filter: 'drop-shadow(0 0 5px rgba(234,179,8,0.8))' }} />
                        </div>
                        <div className="sm:text-right">
                            <p className="text-yellow-400/70 text-[10px] md:text-xs font-black uppercase tracking-wide mb-0.5 md:mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Processing</p>
                            <p className="text-2xl sm:text-3xl md:text-5xl font-black text-yellow-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(234,179,8,0.8)' }}>{statusCounts.processing}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-gray-700 overflow-hidden relative z-10">
                        <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-400"
                            style={{ width: `${(statusCounts.processing / (statusCounts.all || 1) * 100)}%`, boxShadow: '0 0 8px rgba(234,179,8,0.6)' }}></div>
                    </div>
                </div>

                {/* Shipped */}
                <div className="bg-gray-900 corner-clip p-4 md:p-6 border-2 border-cyan-500/40 relative overflow-hidden group hover:border-cyan-400/60 transition-all"
                    style={{ boxShadow: '0 0 20px rgba(0,255,255,0.15)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 relative z-10 gap-2">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-cyan-500/20 corner-clip-sm flex items-center justify-center border border-cyan-500/40 flex-shrink-0">
                            <Truck className="w-5 h-5 md:w-7 md:h-7 text-cyan-400" style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,255,0.8))' }} />
                        </div>
                        <div className="sm:text-right">
                            <p className="text-cyan-400/70 text-[10px] md:text-xs font-black uppercase tracking-wide mb-0.5 md:mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Shipped</p>
                            <p className="text-2xl sm:text-3xl md:text-5xl font-black text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0,255,255,0.8)' }}>{statusCounts.shipped}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-gray-700 overflow-hidden relative z-10">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400"
                            style={{ width: `${(statusCounts.shipped / (statusCounts.all || 1) * 100)}%`, boxShadow: '0 0 8px rgba(0,255,255,0.6)' }}></div>
                    </div>
                </div>

                {/* Delivered */}
                <div className="bg-gray-900 corner-clip p-4 md:p-6 border-2 border-green-500/40 relative overflow-hidden group hover:border-green-400/60 transition-all"
                    style={{ boxShadow: '0 0 20px rgba(0,255,0,0.15)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 relative z-10 gap-2">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-green-500/20 corner-clip-sm flex items-center justify-center border border-green-500/40 flex-shrink-0">
                            <CheckCircle className="w-5 h-5 md:w-7 md:h-7 text-green-400" style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,0,0.8))' }} />
                        </div>
                        <div className="sm:text-right">
                            <p className="text-green-400/70 text-[10px] md:text-xs font-black uppercase tracking-wide mb-0.5 md:mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Delivered</p>
                            <p className="text-2xl sm:text-3xl md:text-5xl font-black text-green-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0,255,0,0.8)' }}>{statusCounts.delivered}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-gray-700 overflow-hidden relative z-10">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                            style={{ width: `${(statusCounts.delivered / (statusCounts.all || 1) * 100)}%`, boxShadow: '0 0 8px rgba(0,255,0,0.6)' }}></div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-900 corner-clip p-4 md:p-6 border-2 border-cyan-500/30 relative overflow-hidden"
                style={{ boxShadow: '0 0 20px rgba(0,255,255,0.1)' }}>
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)' }}></div>
                <div className="flex flex-col md:flex-row gap-4 relative z-10">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4 md:w-5 md:h-5"
                            style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,255,0.6))' }} />
                        <input
                            type="text"
                            placeholder="SEARCH BY ORDER ID, NAME..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-800 border-2 border-cyan-500/50 corner-clip-sm text-white text-xs md:text-sm placeholder-cyan-300/30 focus:outline-none focus:border-cyan-400 transition-all uppercase tracking-widest"
                            style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 15px rgba(0,255,255,0.15)' }}
                        />
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible">
                        {[
                            { key: 'all', label: 'All Orders', color: 'gray', icon: LayoutList },
                            { key: 'pending_verification', label: 'Awaiting Slip', color: 'orange', icon: Clock },
                            { key: 'processing', label: 'Processing', color: 'yellow', icon: AlertCircle },
                            { key: 'shipped', label: 'Shipped', color: 'cyan', icon: Truck },
                            { key: 'delivered', label: 'Delivered', color: 'green', icon: CheckCircle }
                        ].map(({ key, label, color, icon: Icon }) => {
                            const colorMap = {
                                gray: { active: 'border-gray-400 bg-gray-500/20 text-gray-200', inactive: 'border-gray-600/40 text-gray-500 hover:border-gray-500', glow: 'rgba(150,150,150,0.4)' },
                                orange: { active: 'border-orange-400 bg-orange-500/20 text-orange-300', inactive: 'border-orange-600/30 text-orange-600 hover:border-orange-500', glow: 'rgba(255,165,0,0.4)' },
                                yellow: { active: 'border-yellow-400 bg-yellow-500/20 text-yellow-300', inactive: 'border-yellow-600/30 text-yellow-600 hover:border-yellow-500', glow: 'rgba(234,179,8,0.4)' },
                                cyan: { active: 'border-cyan-400 bg-cyan-500/20 text-cyan-300', inactive: 'border-cyan-600/30 text-cyan-600 hover:border-cyan-500', glow: 'rgba(0,255,255,0.4)' },
                                green: { active: 'border-green-400 bg-green-500/20 text-green-300', inactive: 'border-green-600/30 text-green-600 hover:border-green-500', glow: 'rgba(0,255,0,0.4)' },
                            };
                            const c = colorMap[color];
                            const isActive = filterStatus === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setFilterStatus(key)}
                                    className={`inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 corner-clip-sm font-black text-xs md:text-sm uppercase tracking-wide border-2 transition-all whitespace-nowrap flex-shrink-0 ${isActive ? c.active : c.inactive}`}
                                    style={{
                                        fontFamily: 'Rajdhani, sans-serif',
                                        boxShadow: isActive ? `0 0 15px ${c.glow}` : 'none'
                                    }}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                    <span className="ml-1 text-[10px] md:text-xs opacity-70">({statusCounts[key]})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Orders — Table on desktop, Cards on mobile */}
            <div className="bg-gray-900 corner-clip overflow-hidden border-2 border-cyan-500/30 relative"
                style={{ boxShadow: '0 0 30px rgba(0,255,255,0.2)' }}>
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)' }} />

                {filteredOrders.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-400 relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        No orders found
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto relative z-10">
                            <table className="w-full">
                                <thead className="bg-gray-800/80 border-b-2 border-cyan-500/50">
                                    <tr>
                                        {['Order', 'Customer', 'Date', 'Total', 'Status', 'Actions'].map(h => (
                                            <th key={h} className="px-6 py-4 text-left text-xs font-black text-cyan-400 uppercase tracking-widest"
                                                style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 8px rgba(0,255,255,0.6)' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cyan-500/10">
                                    {filteredOrders.map((order) => {
                                        const statusStyle = getStatusStyle(order.orderStatus);
                                        return (
                                            <>
                                                <tr
                                                    key={order.id}
                                                    className="hover:bg-cyan-500/5 transition-colors cursor-pointer border-b border-cyan-500/10"
                                                    onClick={() => toggleOrderExpansion(order.id)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Package className="w-4 h-4 text-cyan-400" style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.6))' }} />
                                                            <span className="font-black text-white text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1 flex items-center" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            {order.items?.length} item(s)
                                                            {expandedOrders.has(order.id) ? <ChevronDown className="w-4 h-4 ml-2 text-cyan-400" /> : <ChevronRight className="w-4 h-4 ml-2 text-cyan-400" />}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-8 h-8 bg-cyan-500/20 corner-clip-sm flex items-center justify-center flex-shrink-0 border border-cyan-500/40 mt-0.5">
                                                                <User className="w-4 h-4 text-cyan-400" />
                                                            </div>
                                                            <div className="min-w-0 space-y-1">
                                                                <div className="font-black text-white text-base leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{order.userName}</div>
                                                                <div className="text-sm text-gray-300 flex items-center gap-1">
                                                                    <Mail className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />{order.userEmail}
                                                                </div>
                                                                {order.shippingAddress && (
                                                                    <div className="mt-2 pt-2 border-t border-cyan-500/10 text-sm text-gray-300 space-y-1">
                                                                        <div className="flex items-start gap-1.5">
                                                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-400" />
                                                                            <div className="leading-snug">
                                                                                <div className="text-white font-bold">{order.shippingAddress.address}</div>
                                                                                <div>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress.zipCode}</div>
                                                                                <div>{order.shippingAddress.country}</div>
                                                                            </div>
                                                                        </div>
                                                                        {order.shippingAddress.phone && (
                                                                            <div className="flex items-center gap-1.5 text-gray-300">
                                                                                <Phone className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />{order.shippingAddress.phone}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-sm text-gray-200" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            <Calendar className="w-4 h-4 mr-1 text-cyan-400" />{formatDate(order.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-black text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 8px rgba(0,255,255,0.5)' }}>฿{order.total?.toFixed(2)}</div>
                                                        {(() => { const pb = getPaymentBadge(order.paymentStatus); return pb ? <div className={`text-xs font-black mt-1 ${pb.cls}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>{pb.label}</div> : null; })()}
                                                        {order.paymentMethod === 'bank_transfer' && (
                                                            <div className="text-xs text-gray-500 font-bold mt-0.5 flex items-center gap-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}><Banknote className="w-3 h-3" /> Bank Transfer</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 corner-clip-sm text-xs font-black uppercase tracking-wide border ${statusStyle.className}`}
                                                            style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: statusStyle.glow }}>{order.orderStatus}</span>
                                                    </td>
                                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                        <select
                                                            value={order.orderStatus}
                                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                            disabled={updating === order.id}
                                                            className={`text-sm bg-gray-800 border-2 border-cyan-500/40 corner-clip-sm text-white px-3 py-1.5 focus:outline-none focus:border-cyan-400 transition-all ${updating === order.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                                        >
                                                            <option value="processing" className="bg-gray-900">Processing</option>
                                                            <option value="shipped" className="bg-gray-900">Shipped</option>
                                                            <option value="delivered" className="bg-gray-900">Delivered</option>
                                                        </select>
                                                        {updating === order.id && <div className="text-xs text-green-400 font-black mt-1 uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>✓ Updated</div>}
                                                    </td>
                                                </tr>
                                                {expandedOrders.has(order.id) && (
                                                    <tr key={`${order.id}-items`} className="bg-cyan-500/5">
                                                        <td colSpan="6" className="px-6 py-4">
                                                            <div className="bg-gray-800/80 corner-clip-sm p-4 border-2 border-cyan-500/20" style={{ boxShadow: '0 0 15px rgba(0,255,255,0.1)' }}>
                                                                <h4 className="font-black text-cyan-400 mb-4 flex items-center uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 8px rgba(0,255,255,0.5)' }}>
                                                                    <ShoppingCart className="w-4 h-4 mr-2" style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.6))' }} />Order Items
                                                                </h4>
                                                                <div className="space-y-3">
                                                                    {order.items?.map((item, index) => (
                                                                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-900/80 corner-clip-sm border border-cyan-500/20">
                                                                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover corner-clip border-2 border-cyan-500/30" style={{ boxShadow: '0 0 10px rgba(0,255,255,0.2)' }} />
                                                                            <div className="flex-1">
                                                                                <div className="font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.name}</div>
                                                                                <div className="mt-1"><span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 corner-clip-sm text-xs font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.category}</span></div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="text-sm text-gray-200 font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Qty: {item.quantity}</div>
                                                                                <div className="font-black text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 8px rgba(0,255,255,0.5)' }}>฿{(item.price * item.quantity).toFixed(2)}</div>
                                                                                {item.discount > 0 && <div className="text-xs text-red-400 font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>-{item.discount}% off</div>}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {order.paymentMethod === 'bank_transfer' && (
                                                                    <div className="mt-4 pt-4 border-t-2 border-magenta-500/20">
                                                                        <h4 className="font-black text-magenta-400 mb-3 flex items-center gap-2 uppercase tracking-wide text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}><Banknote className="w-4 h-4" /> Payment Slip</h4>
                                                                        {order.slipUrl ? (
                                                                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                                                                <div className="relative group cursor-pointer" onClick={() => setSlipModal(order.slipUrl)}>
                                                                                    <img src={order.slipUrl} alt="Payment slip" className="w-40 h-40 object-cover corner-clip-sm border-2 border-magenta-500/40 hover:border-magenta-400 transition-all" style={{ boxShadow: '0 0 15px rgba(255,0,255,0.2)' }} />
                                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity corner-clip-sm flex items-center justify-center"><Eye className="w-8 h-8 text-white" /></div>
                                                                                </div>
                                                                                <div className="space-y-3">
                                                                                    <div>
                                                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Payment Status</p>
                                                                                        {order.paymentStatus === 'pending_verification' && (
                                                                                            <span className="inline-flex items-center gap-1.5 text-yellow-400 font-black text-sm animate-pulse" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                                                <Clock className="w-4 h-4" /> Awaiting Verification
                                                                                            </span>
                                                                                        )}
                                                                                        {order.paymentStatus === 'paid' && (
                                                                                            <span className="inline-flex items-center gap-1.5 text-green-400 font-black text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                                                <CheckCircle className="w-4 h-4" /> Payment Confirmed
                                                                                            </span>
                                                                                        )}
                                                                                        {order.paymentStatus === 'rejected' && (
                                                                                            <span className="inline-flex items-center gap-1.5 text-red-400 font-black text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                                                <XCircle className="w-4 h-4" /> Payment Rejected
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {order.paymentStatus === 'pending_verification' && (
                                                                                        <div className="flex gap-2">
                                                                                            <button onClick={(e) => { e.stopPropagation(); confirmPayment(order.id, order); }} disabled={paymentUpdating === order.id} className="flex items-center gap-1.5 px-4 py-2 bg-green-500/20 border-2 border-green-500/60 text-green-400 hover:bg-green-500/30 hover:border-green-400 corner-clip-sm font-black text-sm uppercase tracking-wide transition-all disabled:opacity-50" style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 10px rgba(0,255,0,0.2)' }}>
                                                                                                <CheckCircle className="w-4 h-4" />{paymentUpdating === order.id ? 'Confirming...' : 'Confirm Payment'}
                                                                                            </button>
                                                                                            <button onClick={(e) => { e.stopPropagation(); rejectPayment(order.id); }} disabled={paymentUpdating === order.id} className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 border-2 border-red-500/60 text-red-400 hover:bg-red-500/30 hover:border-red-400 corner-clip-sm font-black text-sm uppercase tracking-wide transition-all disabled:opacity-50" style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 10px rgba(255,0,0,0.2)' }}>
                                                                                                <XCircle className="w-4 h-4" /> Reject
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-gray-500 text-sm font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>No slip uploaded yet</p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <div className="mt-4 pt-4 border-t-2 border-cyan-500/20">
                                                                    <div className="flex justify-end space-x-8 text-sm">
                                                                        <div className="space-y-1 text-gray-300 font-black uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                            <div>Subtotal:</div><div>Shipping:</div><div>Tax:</div><div className="text-white">Total:</div>
                                                                        </div>
                                                                        <div className="space-y-1 text-right font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                                            <div className="text-gray-300">฿{order.subtotal?.toFixed(2)}</div>
                                                                            <div className="text-gray-300">฿{order.shipping?.toFixed(2)}</div>
                                                                            <div className="text-gray-300">฿{order.tax?.toFixed(2)}</div>
                                                                            <div className="text-cyan-400" style={{ textShadow: '0 0 10px rgba(0,255,255,0.7)' }}>฿{order.total?.toFixed(2)}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-cyan-500/10 relative z-10">
                            {filteredOrders.map((order) => {
                                const statusStyle = getStatusStyle(order.orderStatus);
                                const isExpanded = expandedOrders.has(order.id);
                                return (
                                    <div key={order.id}>
                                        {/* Card header — tap to expand */}
                                        <div
                                            className="flex items-start gap-3 p-4 hover:bg-cyan-500/5 transition-colors cursor-pointer"
                                            onClick={() => toggleOrderExpansion(order.id)}
                                        >
                                            <div className="w-9 h-9 bg-cyan-500/20 corner-clip-sm flex items-center justify-center flex-shrink-0 border border-cyan-500/40">
                                                <Package className="w-4 h-4 text-cyan-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-black text-white text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                                                    <span className={`px-2 py-0.5 corner-clip-sm text-[10px] font-black uppercase border ${statusStyle.className}`}
                                                        style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: statusStyle.glow }}>{order.orderStatus}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 truncate mt-0.5">{order.userName} • {order.userEmail}</p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="font-black text-cyan-400 text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>฿{order.total?.toFixed(2)}</span>
                                                    {(() => { const pb = getPaymentBadge(order.paymentStatus); return pb ? <span className={`text-[10px] font-black ${pb.cls}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>{pb.label}</span> : null; })()}
                                                    <span className="text-[10px] text-gray-500" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{order.items?.length} item(s)</span>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" /> : <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />}
                                        </div>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4">
                                                <div className="bg-gray-800/80 corner-clip-sm p-3 border-2 border-cyan-500/20 space-y-3" style={{ boxShadow: '0 0 10px rgba(0,255,255,0.08)' }}>
                                                    {/* Status update */}
                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <span className="text-xs text-gray-400 font-black uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Update:</span>
                                                        <select
                                                            value={order.orderStatus}
                                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                            disabled={updating === order.id}
                                                            className="flex-1 text-sm bg-gray-900 border-2 border-cyan-500/40 corner-clip-sm text-white px-2 py-1 focus:outline-none focus:border-cyan-400 transition-all"
                                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                                        >
                                                            <option value="processing" className="bg-gray-900">Processing</option>
                                                            <option value="shipped" className="bg-gray-900">Shipped</option>
                                                            <option value="delivered" className="bg-gray-900">Delivered</option>
                                                        </select>
                                                        {updating === order.id && <span className="text-xs text-green-400 font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>✓</span>}
                                                    </div>

                                                    {/* Shipping Address */}
                                                    {order.shippingAddress && (
                                                        <div className="pt-2 border-t border-cyan-500/10 space-y-1.5">
                                                            <div className="flex items-start gap-2">
                                                                <MapPin className="w-3.5 h-3.5 mt-0.5 text-cyan-400 flex-shrink-0" />
                                                                <div className="text-[11px] text-gray-300 leading-tight">
                                                                    <div className="text-white font-bold">{order.shippingAddress.address}</div>
                                                                    <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                                                                    <div>{order.shippingAddress.country}</div>
                                                                </div>
                                                            </div>
                                                            {order.shippingAddress.phone && (
                                                                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                                                                    <Phone className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                                                                    {order.shippingAddress.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Items */}
                                                    <div className="space-y-2">
                                                        {order.items?.map((item, index) => (
                                                            <div key={index} className="flex items-center gap-3 p-2 bg-gray-900/80 corner-clip-sm border border-cyan-500/15">
                                                                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover corner-clip border border-cyan-500/30 flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-black text-white text-xs truncate" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.name}</p>
                                                                    <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                                                                </div>
                                                                <span className="font-black text-cyan-400 text-xs flex-shrink-0" style={{ fontFamily: 'Orbitron, sans-serif' }}>฿{(item.price * item.quantity).toFixed(0)}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Order total summary */}
                                                    <div className="flex justify-between text-xs pt-2 border-t border-cyan-500/20">
                                                        <span className="text-gray-400 font-black uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total</span>
                                                        <span className="font-black text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 8px rgba(0,255,255,0.6)' }}>฿{order.total?.toFixed(2)}</span>
                                                    </div>

                                                    {/* Payment slip actions */}
                                                    {order.paymentMethod === 'bank_transfer' && order.slipUrl && (
                                                        <div className="pt-2 border-t border-cyan-500/20 space-y-2">
                                                            <button onClick={() => setSlipModal(order.slipUrl)} className="flex items-center gap-2 text-xs text-magenta-400 font-black uppercase border border-magenta-500/40 px-3 py-1.5 corner-clip-sm hover:bg-magenta-500/10 transition-all" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                <Eye className="w-3.5 h-3.5" /> View Slip
                                                            </button>
                                                            {order.paymentStatus === 'pending_verification' && (
                                                                <div className="flex gap-2">
                                                                    <button onClick={(e) => { e.stopPropagation(); confirmPayment(order.id, order); }} disabled={paymentUpdating === order.id} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500/20 border border-green-500/60 text-green-400 corner-clip-sm font-black text-xs uppercase transition-all disabled:opacity-50" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                        <CheckCircle className="w-3.5 h-3.5" />{paymentUpdating === order.id ? '...' : 'Confirm'}
                                                                    </button>
                                                                    <button onClick={(e) => { e.stopPropagation(); rejectPayment(order.id); }} disabled={paymentUpdating === order.id} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500/20 border border-red-500/60 text-red-400 corner-clip-sm font-black text-xs uppercase transition-all disabled:opacity-50" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Slip Full-Screen Modal */}
            {slipModal && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSlipModal(null)}>
                    <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSlipModal(null)}
                            className="absolute -top-10 right-0 text-white hover:text-red-400 transition-colors flex items-center gap-2 font-bold"
                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            <X className="w-5 h-5" /> Close
                        </button>
                        <img src={slipModal} alt="Payment slip full view"
                            className="w-full max-h-[80vh] object-contain corner-clip border-2 border-magenta-500/50"
                            style={{ boxShadow: '0 0 40px rgba(255,0,255,0.3)' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
