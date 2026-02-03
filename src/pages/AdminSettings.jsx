import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Settings as SettingsIcon, Store, Bell, Shield, Palette, Users, Mail, Save, Crown, UserX } from 'lucide-react';
import Toast from '../components/Toast';

const AdminSettings = () => {
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('store');
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [settings, setSettings] = useState({
        // Store Settings
        storeName: 'ShopAdmin',
        storeEmail: 'admin@shopadmin.com',
        storePhone: '+66 XX XXX XXXX',
        storeAddress: 'Bangkok, Thailand',
        currency: 'THB',

        // Notifications
        emailNotifications: true,
        orderNotifications: true,
        lowStockAlerts: true,
        customerSignups: false,

        // Security
        twoFactorAuth: false,
        sessionTimeout: '30',

        // Appearance
        theme: 'light',
        primaryColor: '#2563eb'
    });

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

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
            await updateDoc(userRef, {
                isAdmin: !currentStatus
            });

            // Update local state
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

    const handleChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real app, you would save to Firestore or your backend
            console.log('Saving settings:', settings);

            setToast({ message: 'Settings saved successfully!', type: 'success' });
        } catch (error) {
            console.error('Error saving settings:', error);
            setToast({ message: 'Failed to save settings. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'store', label: 'Store Info', icon: Store },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'appearance', label: 'Appearance', icon: Palette }
    ];

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <SettingsIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                                    Settings
                                </h1>
                                <p className="text-gray-600 text-lg">Manage your store configuration and preferences</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary inline-flex items-center space-x-2"
                        >
                            <Save className="w-5 h-5" />
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-8">
                        {/* Store Settings */}
                        {activeTab === 'store' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Store Name
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.storeName}
                                            onChange={(e) => handleChange('storeName', e.target.value)}
                                            className="input-field"
                                            placeholder="Your Store Name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Store Email
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.storeEmail}
                                            onChange={(e) => handleChange('storeEmail', e.target.value)}
                                            className="input-field"
                                            placeholder="store@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={settings.storePhone}
                                            onChange={(e) => handleChange('storePhone', e.target.value)}
                                            className="input-field"
                                            placeholder="+66 XX XXX XXXX"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Currency
                                        </label>
                                        <select
                                            value={settings.currency}
                                            onChange={(e) => handleChange('currency', e.target.value)}
                                            className="input-field"
                                        >
                                            <option value="THB">THB (฿)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Store Address
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.storeAddress}
                                            onChange={(e) => handleChange('storeAddress', e.target.value)}
                                            className="input-field"
                                            placeholder="Full store address"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Management */}
                        {activeTab === 'users' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">User Management</h3>
                                        <p className="text-gray-600 mt-1">Grant or revoke admin access to users</p>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Total Users: <span className="font-bold text-blue-600">{users.length}</span>
                                    </div>
                                </div>

                                {loadingUsers ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                                        <p className="mt-4 text-gray-600">Loading users...</p>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {users.map((user) => (
                                                    <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                                                                    <span className="text-white font-bold text-sm">
                                                                        {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">
                                                                        {user.displayName || 'No Name'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                                <Mail className="w-4 h-4" />
                                                                <span>{user.email}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {user.isAdmin ? (
                                                                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                                                    <Crown className="w-3 h-3" />
                                                                    <span>Admin</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                                                    Customer
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => toggleAdminAccess(user.id, user.isAdmin)}
                                                                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${user.isAdmin
                                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                    }`}
                                                            >
                                                                {user.isAdmin ? (
                                                                    <>
                                                                        <UserX className="w-4 h-4" />
                                                                        <span>Revoke Admin</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Crown className="w-4 h-4" />
                                                                        <span>Make Admin</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notifications */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div>
                                        <p className="font-semibold text-gray-900">Email Notifications</p>
                                        <p className="text-sm text-gray-600">Receive email updates about your store</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.emailNotifications}
                                            onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div>
                                        <p className="font-semibold text-gray-900">Order Notifications</p>
                                        <p className="text-sm text-gray-600">Get notified when new orders are placed</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.orderNotifications}
                                            onChange={(e) => handleChange('orderNotifications', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div>
                                        <p className="font-semibold text-gray-900">Low Stock Alerts</p>
                                        <p className="text-sm text-gray-600">Alert when products are running low</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.lowStockAlerts}
                                            onChange={(e) => handleChange('lowStockAlerts', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div>
                                        <p className="font-semibold text-gray-900">Customer Signups</p>
                                        <p className="text-sm text-gray-600">Notify when new customers register</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.customerSignups}
                                            onChange={(e) => handleChange('customerSignups', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Security */}
                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div>
                                        <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.twoFactorAuth}
                                            onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Session Timeout (minutes)
                                    </label>
                                    <select
                                        value={settings.sessionTimeout}
                                        onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                                        className="input-field max-w-xs"
                                    >
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="120">2 hours</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Appearance */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Theme
                                        </label>
                                        <select
                                            value={settings.theme}
                                            onChange={(e) => handleChange('theme', e.target.value)}
                                            className="input-field"
                                        >
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="auto">Auto</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Primary Color
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="color"
                                                value={settings.primaryColor}
                                                onChange={(e) => handleChange('primaryColor', e.target.value)}
                                                className="h-10 w-20 rounded-lg cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={settings.primaryColor}
                                                onChange={(e) => handleChange('primaryColor', e.target.value)}
                                                className="input-field flex-1"
                                                placeholder="#2563eb"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminSettings;
