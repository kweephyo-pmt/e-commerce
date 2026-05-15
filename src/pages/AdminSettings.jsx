import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Settings as SettingsIcon, Users, Mail, Crown, UserX, RefreshCw, Shield, Lock, Truck, Save, Gamepad2, Image, DollarSign, ArrowRightLeft } from 'lucide-react';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../utils/logActivity';

const AdminSettings = () => {
    const [toast, setToast] = useState(null);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { userProfile } = useAuth();
    const adminInfo = { uid: userProfile?.uid, name: userProfile?.displayName, email: userProfile?.email };

    // Shipping settings
    const [shippingForm, setShippingForm] = useState({ flatFee: 100, freeThreshold: 1500 });
    const [shippingLoading, setShippingLoading] = useState(false);
    const [shippingSaving, setShippingSaving] = useState(false);

    // Currency / exchange rate settings
    const [currencyForm, setCurrencyForm] = useState({ thbToMmk: 130 });
    const [currencyLoading, setCurrencyLoading] = useState(false);
    const [currencySaving, setCurrencySaving] = useState(false);

    // Footer settings
    const [footerForm, setFooterForm] = useState({
        description: 'Your ultimate portal to the future of gaming gear. We provide high-performance tech with a cyberpunk edge for elite players and digital enthusiasts.',
        address: 'Level 99, Cyber District, BKK',
        phone: '+66 81 234 5678',
        email: 'support@techno-world.io',
        facebook: '',
        instagram: ''
    });
    const [footerLoading, setFooterLoading] = useState(false);
    const [footerSaving, setFooterSaving] = useState(false);

    // Hero banner settings
    const [heroForm, setHeroForm] = useState({
        titleLine1: 'Level Up Your',
        titleLine2: 'Gaming Experience',
        subtitle: 'Explore cutting-edge gaming gear, high-performance tech, and premium accessories. Unleash your potential with lightning-fast delivery.',
        bgImageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1920&h=1080&fit=crop',
        heroImageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=600&fit=crop',
    });
    const [heroLoading, setHeroLoading] = useState(false);
    const [heroSaving, setHeroSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchShippingSettings();
        fetchCurrencySettings();
        fetchFooterSettings();
        fetchHeroSettings();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
            setToast({ message: 'Failed to load users', type: 'error' });
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchHeroSettings = async () => {
        setHeroLoading(true);
        try {
            const snap = await getDoc(doc(db, 'settings', 'hero'));
            if (snap.exists()) setHeroForm(prev => ({ ...prev, ...snap.data() }));
        } catch (e) {
            console.error('Failed to load hero settings:', e);
        } finally {
            setHeroLoading(false);
        }
    };

    const saveHeroSettings = async () => {
        setHeroSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'hero'), heroForm, { merge: true });
            await logActivity({
                type: 'settings', icon: 'Settings',
                title: 'Hero Banner Updated',
                description: 'Homepage hero banner content and images modified',
                color: 'cyan',
                admin: adminInfo
            });
            setToast({ message: 'Hero banner saved!', type: 'success' });
        } catch (e) {
            console.error('Failed to save hero settings:', e);
            setToast({ message: 'Failed to save hero banner', type: 'error' });
        } finally {
            setHeroSaving(false);
        }
    };

    const fetchFooterSettings = async () => {
        setFooterLoading(true);
        try {
            const snap = await getDoc(doc(db, 'settings', 'footer'));
            if (snap.exists()) {
                setFooterForm(prev => ({ ...prev, ...snap.data() }));
            }
        } catch (e) {
            console.error('Failed to load footer settings:', e);
        } finally {
            setFooterLoading(false);
        }
    };

    const saveFooterSettings = async () => {
        setFooterSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'footer'), footerForm, { merge: true });
            await logActivity({
                type: 'settings', icon: 'Settings',
                title: 'Footer Settings Updated',
                description: 'Footer brand info and contact details modified',
                color: 'magenta',
                admin: adminInfo
            });
            setToast({ message: 'Footer settings saved!', type: 'success' });
        } catch (e) {
            console.error('Failed to save footer settings:', e);
            setToast({ message: 'Failed to save footer settings', type: 'error' });
        } finally {
            setFooterSaving(false);
        }
    };

    const fetchShippingSettings = async () => {
        setShippingLoading(true);
        try {
            const snap = await getDoc(doc(db, 'settings', 'shipping'));
            if (snap.exists()) {
                const d = snap.data();
                setShippingForm({
                    flatFee: d.flatFee ?? 100,
                    freeThreshold: d.freeThreshold ?? 1500,
                });
            }
        } catch (e) {
            console.error('Failed to load shipping settings:', e);
        } finally {
            setShippingLoading(false);
        }
    };

    const saveShippingSettings = async () => {
        const flatFee = parseFloat(shippingForm.flatFee);
        const freeThreshold = parseFloat(shippingForm.freeThreshold);
        if (isNaN(flatFee) || flatFee < 0) {
            setToast({ message: 'Flat fee must be a valid non-negative number', type: 'error' });
            return;
        }
        if (isNaN(freeThreshold) || freeThreshold < 0) {
            setToast({ message: 'Free shipping threshold must be a valid non-negative number', type: 'error' });
            return;
        }
        setShippingSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'shipping'), { flatFee, freeThreshold }, { merge: true });
            setShippingForm({ flatFee, freeThreshold });
            await logActivity({
                type: 'settings', icon: 'Settings',
                title: 'Shipping Settings Updated',
                description: `Flat fee: ฿${flatFee} · Free shipping above ฿${freeThreshold}`,
                color: 'yellow',
                admin: adminInfo
            });
            setToast({ message: 'Shipping settings saved!', type: 'success' });
        } catch (e) {
            console.error('Failed to save shipping settings:', e);
            setToast({ message: 'Failed to save shipping settings', type: 'error' });
        } finally {
            setShippingSaving(false);
        }
    };

    const fetchCurrencySettings = async () => {
        setCurrencyLoading(true);
        try {
            const snap = await getDoc(doc(db, 'settings', 'currency'));
            if (snap.exists()) {
                const d = snap.data();
                setCurrencyForm({ thbToMmk: d.thbToMmk ?? 130 });
            }
        } catch (e) {
            console.error('Failed to load currency settings:', e);
        } finally {
            setCurrencyLoading(false);
        }
    };

    const saveCurrencySettings = async () => {
        const rate = parseFloat(currencyForm.thbToMmk);
        if (isNaN(rate) || rate <= 0) {
            setToast({ message: 'Exchange rate must be a positive number', type: 'error' });
            return;
        }
        setCurrencySaving(true);
        try {
            await setDoc(doc(db, 'settings', 'currency'), { thbToMmk: rate }, { merge: true });
            setCurrencyForm({ thbToMmk: rate });
            await logActivity({
                type: 'settings', icon: 'Settings',
                title: 'Exchange Rate Updated',
                description: `THB → MMK rate set to ${rate}`,
                color: 'cyan',
                admin: adminInfo
            });
            setToast({ message: 'Exchange rate saved!', type: 'success' });
        } catch (e) {
            console.error('Failed to save currency settings:', e);
            setToast({ message: 'Failed to save exchange rate', type: 'error' });
        } finally {
            setCurrencySaving(false);
        }
    };

    const toggleAdminAccess = async (userId, currentStatus) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { isAdmin: !currentStatus });
            const targetUser = users.find(u => u.id === userId);
            setUsers(users.map(user =>
                user.id === userId ? { ...user, isAdmin: !currentStatus } : user
            ));
            await logActivity({
                type: 'settings', icon: 'Settings',
                title: !currentStatus ? 'Admin Access Granted' : 'Admin Access Revoked',
                description: `${targetUser?.displayName || targetUser?.email || userId} — admin ${!currentStatus ? 'granted' : 'revoked'}`,
                color: !currentStatus ? 'cyan' : 'red',
                admin: adminInfo
            });
            setToast({
                message: `Admin access ${!currentStatus ? 'granted' : 'revoked'} successfully!`,
                type: 'success'
            });
        } catch (error) {
            console.error('Error updating admin access:', error);
            setToast({ message: 'Failed to update admin access', type: 'error' });
        }
    };

    const filtered = users.filter(u =>
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const adminCount = users.filter(u => u.isAdmin).length;

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="space-y-4 md:space-y-6">

                {/* ── Header — hidden on mobile (shown in AdminDashboard top bar) */}
                <div className="hidden md:block bg-gray-900 corner-clip p-8 border-2 border-cyan-500/30 relative overflow-hidden"
                    style={{ boxShadow: '0 0 40px rgba(0,255,255,0.2)' }}>
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 border-2 border-cyan-500/50 corner-clip flex items-center justify-center"
                                style={{ boxShadow: '0 0 25px rgba(0,255,255,0.2)' }}>
                                <SettingsIcon className="w-8 h-8 text-cyan-400" style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,255,0.5))' }} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-1"
                                    style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0,255,255,0.8)' }}>
                                    Settings
                                </h1>
                                <p className="text-cyan-300/70 text-lg font-bold uppercase tracking-wide"
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    User Management &amp; Admin Access Control
                                </p>
                            </div>
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={fetchUsers}
                            disabled={loadingUsers}
                            className="inline-flex items-center space-x-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 text-cyan-300 font-black uppercase tracking-wide corner-clip-sm border-2 border-cyan-500/40 hover:border-cyan-400 transition-all disabled:opacity-50"
                            style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 12px rgba(0,255,255,0.2)' }}
                        >
                            <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* ── Stats Row ───────────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 px-1 md:px-0">
                    {[
                        { label: 'Total Users', value: users.length, color: 'cyan', glow: 'rgba(0,255,255,0.4)' },
                        { label: 'Admins', value: adminCount, color: 'yellow', glow: 'rgba(234,179,8,0.4)' },
                        { label: 'Customers', value: users.length - adminCount, color: 'purple', glow: 'rgba(147,51,234,0.4)' },
                    ].map(({ label, value, color, glow }) => (
                        <div key={label}
                            className={`bg-gray-900 corner-clip-sm p-4 md:p-5 border-2 border-${color}-500/30 relative overflow-hidden`}
                            style={{ boxShadow: `0 0 20px ${glow}20` }}>
                            <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent`}></div>
                            <p className={`text-2xl md:text-3xl font-black text-${color}-400 relative z-10`}
                                style={{ fontFamily: 'Orbitron, sans-serif', textShadow: `0 0 15px ${glow}` }}>
                                {value}
                            </p>
                            <p className="text-gray-400 text-[10px] md:text-sm font-black uppercase tracking-wide relative z-10"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                {label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── User Management Panel ───────────────────────────────── */}
                <div className="bg-gray-900 corner-clip border-2 border-purple-500/30 relative overflow-hidden"
                    style={{ boxShadow: '0 0 30px rgba(147,51,234,0.15)' }}>
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(147,51,234,0.1) 2px, rgba(147,51,234,0.1) 4px)' }}></div>

                    {/* Panel Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 md:px-8 py-5 border-b-2 border-purple-500/20 relative z-10 bg-gray-800/40 gap-4">
                        <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-purple-400" style={{ filter: 'drop-shadow(0 0 6px rgba(147,51,234,0.8))' }} />
                            <h2 className="text-xl font-black text-purple-400 uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(147,51,234,0.6)' }}>
                                User Management
                            </h2>
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-64">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-800 border-2 border-purple-500/30 corner-clip-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition-all text-sm font-bold"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="relative z-10">
                        {loadingUsers ? (
                            <div className="text-center py-16">
                                <div className="relative w-16 h-16 mx-auto mb-4">
                                    <div className="absolute inset-0 border-4 border-purple-500/30 corner-clip animate-spin"
                                        style={{ borderTopColor: 'rgba(147,51,234,0.9)', boxShadow: '0 0 20px rgba(147,51,234,0.5)' }}></div>
                                </div>
                                <p className="text-purple-400 uppercase tracking-widest font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    Loading Users...
                                </p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-16">
                                <Users className="w-12 h-12 text-purple-500/30 mx-auto mb-3" />
                                <p className="text-gray-400 font-black uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    {searchQuery ? 'No users match your search' : 'No users found'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {/* Desktop Tablet View */}
                                <table className="w-full hidden md:table">
                                    <thead className="bg-gray-800/60 border-b border-purple-500/20">
                                        <tr>
                                            {['User', 'Email', 'Role', 'Actions'].map(h => (
                                                <th key={h} className="px-6 py-4 text-left text-xs font-black text-purple-400 uppercase tracking-widest"
                                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-purple-500/10">
                                        {filtered.map((user) => (
                                            <tr key={user.id} className="hover:bg-purple-500/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 border border-purple-500/50 corner-clip-sm flex items-center justify-center flex-shrink-0"
                                                            style={{ boxShadow: '0 0 12px rgba(147,51,234,0.2)' }}>
                                                            <span className="text-purple-400 font-black text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                                {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                        <p className="font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            {user.displayName || <span className="text-gray-500 italic">No Name</span>}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                        <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                                        <span style={{ fontFamily: 'Rajdhani, sans-serif' }}>{user.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.isAdmin ? (
                                                        <span className="inline-flex items-center space-x-1 px-3 py-1 corner-clip-sm text-xs font-black border border-yellow-500/60 bg-yellow-500/10 text-yellow-300 uppercase"
                                                            style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 10px rgba(234,179,8,0.3)' }}>
                                                            <Crown className="w-3 h-3" />
                                                            <span>Admin</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1 corner-clip-sm text-xs font-black border border-gray-600/40 bg-gray-700/30 text-gray-400 uppercase"
                                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            Customer
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {(() => {
                                                        const isSelf = user.id === userProfile?.uid;
                                                        return (
                                                            <div className="relative group/btn inline-block">
                                                                <button
                                                                    onClick={() => !isSelf && toggleAdminAccess(user.id, user.isAdmin)}
                                                                    disabled={isSelf}
                                                                    className={`inline-flex items-center space-x-2 px-4 py-2 corner-clip-sm font-black text-sm uppercase tracking-wide border-2 transition-all ${isSelf
                                                                        ? 'border-gray-600/40 bg-gray-700/20 text-gray-500 cursor-not-allowed opacity-50'
                                                                        : user.isAdmin
                                                                            ? 'border-red-500/60 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-400'
                                                                            : 'border-green-500/60 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:border-green-400'
                                                                        }`}
                                                                    style={{
                                                                        fontFamily: 'Rajdhani, sans-serif',
                                                                        boxShadow: isSelf ? 'none' : user.isAdmin ? '0 0 10px rgba(239,68,68,0.2)' : '0 0 10px rgba(0,255,0,0.2)'
                                                                    }}
                                                                >
                                                                    {isSelf ? (
                                                                        <><Lock className="w-4 h-4" /><span>You</span></>
                                                                    ) : user.isAdmin ? (
                                                                        <><UserX className="w-4 h-4" /><span>Revoke Admin</span></>
                                                                    ) : (
                                                                        <><Crown className="w-4 h-4" /><span>Make Admin</span></>
                                                                    )}
                                                                </button>
                                                                {isSelf && (
                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 border border-gray-600 corner-clip-sm text-xs text-gray-300 font-bold whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10"
                                                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                        Can't revoke your own access
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Mobile Card View */}
                                <div className="md:hidden divide-y divide-purple-500/10">
                                    {filtered.map((user) => (
                                        <div key={user.id} className="p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 text-left">
                                                    <div className="w-10 h-10 border border-purple-500/50 corner-clip-sm flex items-center justify-center flex-shrink-0"
                                                        style={{ boxShadow: '0 0 12px rgba(147,51,234,0.2)' }}>
                                                        <span className="text-purple-400 font-black text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                            {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            {user.displayName || <span className="text-gray-500 italic">No Name</span>}
                                                        </p>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                                                            <Mail className="w-3 h-3 text-purple-400" />
                                                            <span style={{ fontFamily: 'Rajdhani, sans-serif' }} className="truncate max-w-[150px]">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    {user.isAdmin ? (
                                                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 corner-clip-sm text-[10px] font-black border border-yellow-500/60 bg-yellow-500/10 text-yellow-300 uppercase"
                                                            style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 10px rgba(234,179,8,0.3)' }}>
                                                            <Crown className="w-2.5 h-2.5" />
                                                            <span>Admin</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 corner-clip-sm text-[10px] font-black border border-gray-600/40 bg-gray-700/30 text-gray-400 uppercase"
                                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            Customer
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                {(() => {
                                                    const isSelf = user.id === userProfile?.uid;
                                                    return (
                                                        <button
                                                            onClick={() => !isSelf && toggleAdminAccess(user.id, user.isAdmin)}
                                                            disabled={isSelf}
                                                            className={`w-full inline-flex items-center justify-center space-x-2 px-4 py-2 corner-clip-sm font-black text-xs uppercase tracking-wide border-2 transition-all ${isSelf
                                                                ? 'border-gray-600/40 bg-gray-700/20 text-gray-500 cursor-not-allowed opacity-50'
                                                                : user.isAdmin
                                                                    ? 'border-red-500/60 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-400'
                                                                    : 'border-green-500/60 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:border-green-400'
                                                                }`}
                                                            style={{
                                                                fontFamily: 'Rajdhani, sans-serif',
                                                                boxShadow: isSelf ? 'none' : user.isAdmin ? '0 0 10px rgba(239,68,68,0.1)' : '0 0 10px rgba(0,255,0,0.1)'
                                                            }}
                                                        >
                                                            {isSelf ? (
                                                                <><Lock className="w-3.5 h-3.5" /><span>You (System Admin)</span></>
                                                            ) : user.isAdmin ? (
                                                                <><UserX className="w-3.5 h-3.5" /><span>Revoke Admin Access</span></>
                                                            ) : (
                                                                <><Crown className="w-3.5 h-3.5" /><span>Grant Admin Access</span></>
                                                            )}
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!loadingUsers && filtered.length > 0 && (
                        <div className="px-8 py-4 border-t border-purple-500/10 bg-gray-800/20 relative z-10">
                            <p className="text-xs text-gray-500 font-bold uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Showing <span className="text-purple-400">{filtered.length}</span> of <span className="text-purple-400">{users.length}</span> users
                                &nbsp;·&nbsp; <span className="text-yellow-400">{adminCount}</span> admin{adminCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Shipping Settings ───────────────────────────────────── */}
                <div className="bg-gray-900 corner-clip border-2 border-cyan-500/30 relative overflow-hidden"
                    style={{ boxShadow: '0 0 30px rgba(0,255,255,0.1)' }}>
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)' }}></div>

                    {/* Panel Header */}
                    <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b-2 border-cyan-500/20 relative z-10 bg-gray-800/40">
                        <div className="flex items-center space-x-3">
                            <Truck className="w-5 h-5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.8))' }} />
                            <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0,255,255,0.6)' }}>
                                Shipping Settings
                            </h2>
                        </div>
                    </div>

                    <div className="px-6 md:px-8 py-6 relative z-10 space-y-6">
                        {shippingLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {/* Flat Fee */}
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2"
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            Flat Shipping Fee (฿)
                                        </label>
                                        <p className="text-xs text-gray-500 font-bold mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            Charged when order is below the free threshold.
                                        </p>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 font-black text-lg">฿</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={shippingForm.flatFee}
                                                onChange={e => setShippingForm(prev => ({ ...prev, flatFee: e.target.value }))}
                                                className="w-full pl-9 pr-4 py-3 bg-gray-800 border-2 border-cyan-500/30 corner-clip-sm text-white font-black text-lg focus:outline-none focus:border-cyan-400 transition-all"
                                                style={{ fontFamily: 'Orbitron, sans-serif' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Free Threshold */}
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2"
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            Free Shipping Threshold (฿)
                                        </label>
                                        <p className="text-xs text-gray-500 font-bold mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            Orders at or above this amount get free shipping.
                                        </p>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 font-black text-lg">฿</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={shippingForm.freeThreshold}
                                                onChange={e => setShippingForm(prev => ({ ...prev, freeThreshold: e.target.value }))}
                                                className="w-full pl-9 pr-4 py-3 bg-gray-800 border-2 border-cyan-500/30 corner-clip-sm text-white font-black text-lg focus:outline-none focus:border-cyan-400 transition-all"
                                                style={{ fontFamily: 'Orbitron, sans-serif' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="p-4 bg-cyan-500/5 corner-clip-sm border border-cyan-500/20 text-sm font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    <span className="text-gray-400">Preview: </span>
                                    <span className="text-cyan-400">
                                        Orders under ฿{parseFloat(shippingForm.freeThreshold) || 0} → ฿{parseFloat(shippingForm.flatFee) || 0} shipping fee.
                                        Orders ฿{parseFloat(shippingForm.freeThreshold) || 0}+ → FREE shipping.
                                    </span>
                                </div>

                                <button
                                    onClick={saveShippingSettings}
                                    disabled={shippingSaving}
                                    className="flex items-center gap-2 px-6 py-3 bg-cyan-500/20 text-cyan-400 font-black uppercase tracking-widest corner-clip-sm border-2 border-cyan-500/60 hover:bg-cyan-500/30 transition-all disabled:opacity-50"
                                    style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 15px rgba(0,255,255,0.2)' }}>
                                    <Save className="w-4 h-4" />
                                    {shippingSaving ? 'Saving...' : 'Save Shipping Settings'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Currency Exchange Rate ───────────────────────────────── */}
                <div className="bg-gray-900 corner-clip border-2 border-yellow-500/30 relative overflow-hidden"
                    style={{ boxShadow: '0 0 30px rgba(234,179,8,0.1)' }}>
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(234,179,8,0.1) 2px, rgba(234,179,8,0.1) 4px)' }}></div>

                    {/* Panel Header */}
                    <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b-2 border-yellow-500/20 relative z-10 bg-gray-800/40">
                        <div className="flex items-center space-x-3">
                            <ArrowRightLeft className="w-5 h-5 text-yellow-400" style={{ filter: 'drop-shadow(0 0 6px rgba(234,179,8,0.8))' }} />
                            <h2 className="text-xl font-black text-yellow-400 uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(234,179,8,0.6)' }}>
                                Currency Exchange Rate
                            </h2>
                        </div>
                    </div>

                    <div className="px-6 md:px-8 py-6 relative z-10 space-y-6">
                        {currencyLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
                            </div>
                        ) : (
                            <>
                                {/* Rate input */}
                                <div className="max-w-sm">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        1 THB (฿) = ? MMK (K)
                                    </label>
                                    <p className="text-xs text-gray-500 font-bold mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        This rate is applied globally. Changes take effect immediately for all users.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/60 border-2 border-yellow-500/20 corner-clip-sm">
                                            <span className="text-yellow-400 font-black text-lg">฿</span>
                                            <span className="text-white font-black text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>1</span>
                                        </div>
                                        <ArrowRightLeft className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 font-black text-lg">K</span>
                                            <input
                                                type="number"
                                                min="1"
                                                step="0.1"
                                                value={currencyForm.thbToMmk}
                                                onChange={e => setCurrencyForm({ thbToMmk: e.target.value })}
                                                className="w-full pl-9 pr-4 py-3 bg-gray-800 border-2 border-yellow-500/30 corner-clip-sm text-white font-black text-lg focus:outline-none focus:border-yellow-400 transition-all"
                                                style={{ fontFamily: 'Orbitron, sans-serif' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Live preview */}
                                <div className="p-4 bg-yellow-500/5 corner-clip-sm border border-yellow-500/20 text-sm font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    <span className="text-gray-400">Preview: </span>
                                    <span className="text-yellow-400">
                                        ฿100 THB → K{Math.round(100 * (parseFloat(currencyForm.thbToMmk) || 0)).toLocaleString('en-US')} MMK
                                        &nbsp;·&nbsp;
                                        ฿1,000 THB → K{Math.round(1000 * (parseFloat(currencyForm.thbToMmk) || 0)).toLocaleString('en-US')} MMK
                                    </span>
                                </div>

                                <button
                                    onClick={saveCurrencySettings}
                                    disabled={currencySaving}
                                    className="flex items-center gap-2 px-6 py-3 bg-yellow-500/20 text-yellow-400 font-black uppercase tracking-widest corner-clip-sm border-2 border-yellow-500/60 hover:bg-yellow-500/30 transition-all disabled:opacity-50"
                                    style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 15px rgba(234,179,8,0.2)' }}>
                                    <Save className="w-4 h-4" />
                                    {currencySaving ? 'Saving...' : 'Save Exchange Rate'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Footer Settings ─────────────────────────────────────── */}
                <div className="bg-gray-900 corner-clip border-2 border-magenta-500/30 relative overflow-hidden"
                    style={{ boxShadow: '0 0 30px rgba(255,0,255,0.1)' }}>
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,255,0.1) 2px, rgba(255,0,255,0.1) 4px)' }}></div>

                    <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b-2 border-magenta-500/20 relative z-10 bg-gray-800/40">
                        <div className="flex items-center space-x-3">
                            <Gamepad2 className="w-5 h-5 text-magenta-400" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }} />
                            <h2 className="text-xl font-black text-magenta-400 uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(255,0,255,0.6)' }}>
                                Footer Management
                            </h2>
                        </div>
                    </div>

                    <div className="px-6 md:px-8 py-6 relative z-10 space-y-6 text-left">
                        {footerLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-magenta-500 mx-auto"></div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {/* Brand Description */}
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Brand Description</label>
                                        <textarea
                                            value={footerForm.description}
                                            onChange={e => setFooterForm(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full bg-gray-800 border-2 border-magenta-500/30 corner-clip-sm text-white px-4 py-3 focus:outline-none focus:border-magenta-400 transition-all font-bold text-sm resize-none"
                                            rows={3}
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Address */}
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Address</label>
                                            <input
                                                type="text"
                                                value={footerForm.address}
                                                onChange={e => setFooterForm(prev => ({ ...prev, address: e.target.value }))}
                                                className="w-full bg-gray-800 border-2 border-magenta-500/30 corner-clip-sm text-white px-4 py-3 focus:outline-none focus:border-magenta-400 transition-all font-bold text-sm"
                                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                            />
                                        </div>
                                        {/* Phone */}
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Phone</label>
                                            <input
                                                type="text"
                                                value={footerForm.phone}
                                                onChange={e => setFooterForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full bg-gray-800 border-2 border-magenta-500/30 corner-clip-sm text-white px-4 py-3 focus:outline-none focus:border-magenta-400 transition-all font-bold text-sm"
                                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                            />
                                        </div>
                                        {/* Email */}
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Email</label>
                                            <input
                                                type="email"
                                                value={footerForm.email}
                                                onChange={e => setFooterForm(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full bg-gray-800 border-2 border-magenta-500/30 corner-clip-sm text-white px-4 py-3 focus:outline-none focus:border-magenta-400 transition-all font-bold text-sm"
                                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {/* Facebook */}
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Facebook URL</label>
                                            <input
                                                type="text"
                                                value={footerForm.facebook}
                                                onChange={e => setFooterForm(prev => ({ ...prev, facebook: e.target.value }))}
                                                placeholder="https://facebook.com/..."
                                                className="w-full bg-gray-800 border-2 border-magenta-500/30 corner-clip-sm text-white px-4 py-3 focus:outline-none focus:border-magenta-400 transition-all font-bold text-sm"
                                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                            />
                                        </div>
                                        {/* Instagram */}
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Instagram URL</label>
                                            <input
                                                type="text"
                                                value={footerForm.instagram}
                                                onChange={e => setFooterForm(prev => ({ ...prev, instagram: e.target.value }))}
                                                placeholder="https://instagram.com/..."
                                                className="w-full bg-gray-800 border-2 border-magenta-500/30 corner-clip-sm text-white px-4 py-3 focus:outline-none focus:border-magenta-400 transition-all font-bold text-sm"
                                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={saveFooterSettings}
                                    disabled={footerSaving}
                                    className="flex items-center gap-2 px-6 py-3 bg-magenta-500/20 text-magenta-400 font-black uppercase tracking-widest corner-clip-sm border-2 border-magenta-500/60 hover:bg-magenta-500/30 transition-all disabled:opacity-50"
                                    style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 15px rgba(255,0,255,0.2)' }}>
                                    <Save className="w-4 h-4" />
                                    {footerSaving ? 'Saving...' : 'Save Footer Settings'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {/* ── Hero Banner Settings ─────────────────────────────────── */}
                <div className="bg-gray-900 corner-clip border-2 border-cyan-500/30 relative overflow-hidden"
                    style={{ boxShadow: '0 0 30px rgba(0,255,255,0.1)' }}>
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)' }}></div>

                    <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b-2 border-cyan-500/20 relative z-10 bg-gray-800/40">
                        <div className="flex items-center space-x-3">
                            <Image className="w-5 h-5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.8))' }} />
                            <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(0,255,255,0.6)' }}>
                                Hero Banner
                            </h2>
                        </div>
                    </div>

                    <div className="px-6 md:px-8 py-6 relative z-10 space-y-5 text-left">
                        {heroLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
                            </div>
                        ) : (
                            <>
                                {/* Title Lines */}
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            Title — Line 1 <span className="text-cyan-400">(cyan)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={heroForm.titleLine1}
                                            onChange={e => setHeroForm(prev => ({ ...prev, titleLine1: e.target.value }))}
                                            className="w-full bg-gray-800 border-2 border-cyan-500/30 corner-clip-sm text-white px-4 py-3 focus:outline-none focus:border-cyan-400 transition-all font-bold text-sm"
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            Title — Line 2 <span className="text-magenta-400">(gradient)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={heroForm.titleLine2}
                                            onChange={e => setHeroForm(prev => ({ ...prev, titleLine2: e.target.value }))}
                                            className="w-full bg-gray-800 border-2 border-cyan-500/30 corner-clip-sm text-white px-4 py-3 focus:outline-none focus:border-cyan-400 transition-all font-bold text-sm"
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                        />
                                    </div>
                                </div>

                                {/* Subtitle */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Subtitle / Description</label>
                                    <textarea
                                        value={heroForm.subtitle}
                                        onChange={e => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
                                        className="w-full bg-gray-800 border-2 border-cyan-500/30 corner-clip-sm text-white px-4 py-3 focus:outline-none focus:border-cyan-400 transition-all font-bold text-sm resize-none"
                                        rows={3}
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                    />
                                </div>

                                {/* Image URLs */}
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Background Image URL</label>
                                        <input
                                            type="text"
                                            value={heroForm.bgImageUrl}
                                            onChange={e => setHeroForm(prev => ({ ...prev, bgImageUrl: e.target.value }))}
                                            placeholder="https://..."
                                            className="w-full bg-gray-800 border-2 border-cyan-500/30 corner-clip-sm text-white px-4 py-3 focus:outline-none focus:border-cyan-400 transition-all font-bold text-sm"
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                        />
                                        {heroForm.bgImageUrl && (
                                            <div className="mt-2 w-full bg-gray-900 border border-cyan-500/20 corner-clip-sm overflow-hidden">
                                                <img src={heroForm.bgImageUrl} alt="bg preview" className="w-full h-auto max-h-48 object-contain opacity-80" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Hero Image URL</label>
                                        <input
                                            type="text"
                                            value={heroForm.heroImageUrl}
                                            onChange={e => setHeroForm(prev => ({ ...prev, heroImageUrl: e.target.value }))}
                                            placeholder="https://..."
                                            className="w-full bg-gray-800 border-2 border-cyan-500/30 corner-clip-sm text-white px-4 py-3 focus:outline-none focus:border-cyan-400 transition-all font-bold text-sm"
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                        />
                                        {heroForm.heroImageUrl && (
                                            <div className="mt-2 w-full bg-gray-900 border border-cyan-500/20 corner-clip-sm overflow-hidden">
                                                <img src={heroForm.heroImageUrl} alt="hero preview" className="w-full h-auto max-h-48 object-contain" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={saveHeroSettings}
                                    disabled={heroSaving}
                                    className="flex items-center gap-2 px-6 py-3 bg-cyan-500/20 text-cyan-400 font-black uppercase tracking-widest corner-clip-sm border-2 border-cyan-500/60 hover:bg-cyan-500/30 transition-all disabled:opacity-50"
                                    style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 15px rgba(0,255,255,0.2)' }}>
                                    <Save className="w-4 h-4" />
                                    {heroSaving ? 'Saving...' : 'Save Hero Banner'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
};

export default AdminSettings;
