import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Settings as SettingsIcon, Users, Mail, Crown, UserX, RefreshCw, Shield, Lock } from 'lucide-react';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const AdminSettings = () => {
    const [toast, setToast] = useState(null);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
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

    const toggleAdminAccess = async (userId, currentStatus) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { isAdmin: !currentStatus });
            setUsers(users.map(user =>
                user.id === userId ? { ...user, isAdmin: !currentStatus } : user
            ));
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {[
                        { label: 'Total Users', value: users.length, color: 'cyan', glow: 'rgba(0,255,255,0.4)' },
                        { label: 'Admins', value: adminCount, color: 'yellow', glow: 'rgba(234,179,8,0.4)' },
                        { label: 'Customers', value: users.length - adminCount, color: 'purple', glow: 'rgba(147,51,234,0.4)' },
                    ].map(({ label, value, color, glow }) => (
                        <div key={label}
                            className={`bg-gray-900 corner-clip-sm p-5 border-2 border-${color}-500/30 relative overflow-hidden`}
                            style={{ boxShadow: `0 0 20px ${glow}20` }}>
                            <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent`}></div>
                            <p className={`text-3xl font-black text-${color}-400 relative z-10`}
                                style={{ fontFamily: 'Orbitron, sans-serif', textShadow: `0 0 15px ${glow}` }}>
                                {value}
                            </p>
                            <p className="text-gray-400 text-sm font-black uppercase tracking-wide relative z-10"
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
                    <div className="flex items-center justify-between px-8 py-5 border-b-2 border-purple-500/20 relative z-10 bg-gray-800/40">
                        <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-purple-400" style={{ filter: 'drop-shadow(0 0 6px rgba(147,51,234,0.8))' }} />
                            <h2 className="text-xl font-black text-purple-400 uppercase tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(147,51,234,0.6)' }}>
                                User Management
                            </h2>
                        </div>

                        {/* Search */}
                        <div className="relative w-64">
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
                            <table className="w-full">
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
                                                    const isSelf = user.id === currentUser?.uid;
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
            </div>
        </>
    );
};

export default AdminSettings;
