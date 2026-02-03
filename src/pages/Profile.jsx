import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Package, ShoppingBag, Camera } from 'lucide-react';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import Toast from '../components/Toast';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const [orderStats, setOrderStats] = useState({
        totalOrders: 0,
        totalSpent: 0
    });
    const [profileData, setProfileData] = useState({
        displayName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Thailand',
        photoURL: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchProfileData();
        fetchOrderStats();
    }, [user, navigate]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists()) {
                setProfileData({
                    displayName: userDoc.data().displayName || user.displayName || '',
                    email: user.email || '',
                    phone: userDoc.data().phone || '',
                    address: userDoc.data().address || '',
                    city: userDoc.data().city || '',
                    state: userDoc.data().state || '',
                    zipCode: userDoc.data().zipCode || '',
                    country: userDoc.data().country || 'Thailand',
                    photoURL: userDoc.data().photoURL || ''
                });
            } else {
                setProfileData({
                    displayName: user.displayName || '',
                    email: user.email || '',
                    phone: '',
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'Thailand',
                    photoURL: ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderStats = async () => {
        try {
            const ordersQuery = query(
                collection(db, 'orders'),
                where('userId', '==', user.uid)
            );

            const querySnapshot = await getDocs(ordersQuery);

            let totalOrders = 0;
            let totalSpent = 0;

            querySnapshot.forEach((doc) => {
                totalOrders++;
                const orderData = doc.data();
                totalSpent += orderData.total || 0;
            });

            setOrderStats({
                totalOrders,
                totalSpent
            });
        } catch (error) {
            console.error('Error fetching order stats:', error);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log('File selected:', file.name, file.type, file.size);

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setToast({ message: 'Please upload an image file', type: 'error' });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setToast({ message: 'Image size should be less than 5MB', type: 'error' });
            return;
        }

        try {
            setUploading(true);

            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_PROFILE_PRESET || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

            console.log('Cloudinary config:', { cloudName, uploadPreset });

            if (!cloudName || !uploadPreset) {
                setToast({ message: 'Cloudinary is not configured. Please check environment variables.', type: 'error' });
                setUploading(false);
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            // Note: folder is controlled by the upload preset in Cloudinary settings

            console.log('Uploading to Cloudinary with preset:', uploadPreset);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();

            console.log('Upload response:', data);

            if (data.secure_url) {
                // Update profile data with new photo URL
                const newPhotoURL = data.secure_url;
                console.log('New photo URL:', newPhotoURL);

                setProfileData(prev => ({
                    ...prev,
                    photoURL: newPhotoURL
                }));

                // Save to Firestore immediately
                await setDoc(doc(db, 'users', user.uid), {
                    photoURL: newPhotoURL,
                    updatedAt: new Date()
                }, { merge: true });

                console.log('Profile photo saved to Firestore');
                setToast({ message: 'Profile photo updated successfully!', type: 'success' });
            } else if (data.error) {
                console.error('Cloudinary error:', data.error);
                setToast({ message: `Upload failed: ${data.error.message}`, type: 'error' });
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            setToast({ message: 'Failed to upload photo. Please try again.', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await setDoc(doc(db, 'users', user.uid), {
                ...profileData,
                updatedAt: new Date()
            }, { merge: true });

            setIsEditing(false);
            setToast({ message: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error('Error saving profile:', error);
            setToast({ message: 'Failed to update profile. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        fetchProfileData();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header with Cover */}
                    <div className="relative mb-8 animate-fade-in">
                        {/* Cover Image */}
                        <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>

                        {/* Profile Avatar & Info */}
                        <div className="absolute -bottom-16 left-8 md:left-12">
                            <div className="relative">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center border-4 border-white">
                                    {profileData.photoURL ? (
                                        <img
                                            src={profileData.photoURL}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            {profileData.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    id="photoUpload"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="photoUpload"
                                    className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                                >
                                    <Camera className="w-5 h-5" />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Name & Actions */}
                    <div className="mt-20 mb-8 flex flex-col md:flex-row md:items-center md:justify-between px-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                {profileData.displayName || 'User'}
                            </h1>
                            <div className="flex items-center space-x-4 text-gray-600">
                                <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{profileData.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">
                                        Joined {new Date(user?.metadata?.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-4 md:mt-0 btn-primary inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Edit2 className="w-5 h-5" />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <div className="mt-4 md:mt-0 flex space-x-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn-primary inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <Save className="w-5 h-5" />
                                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                                >
                                    <X className="w-5 h-5 inline mr-2" />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Stats Cards */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Quick Stats */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                                <Package className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Total Orders</p>
                                                <p className="text-2xl font-bold text-gray-900">{orderStats.totalOrders}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                                                <ShoppingBag className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Total Spent</p>
                                                <p className="text-2xl font-bold text-gray-900">฿{orderStats.totalSpent.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Info */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Account Info</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Account Status</span>
                                        <span className="font-semibold text-green-600">Active</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Email Verified</span>
                                        <span className="font-semibold text-green-600">Yes</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Account Type</span>
                                        <span className="font-semibold text-blue-600">Customer</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Information Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Information */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-fade-in border border-gray-100">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="displayName"
                                            value={profileData.displayName}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                disabled
                                                className="input-field pl-10 bg-gray-50 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={profileData.phone}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={`input-field pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                                                placeholder="+66 XX XXX XXXX"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-fade-in border border-gray-100">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Shipping Address</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={profileData.address}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                                            placeholder="123 Main Street, Apt 4B"
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={profileData.city}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                                                placeholder="Bangkok"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                State / Province
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={profileData.state}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                                                placeholder="Bangkok"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                ZIP / Postal Code
                                            </label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={profileData.zipCode}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                                                placeholder="10110"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Country
                                            </label>
                                            <select
                                                name="country"
                                                value={profileData.country}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                                            >
                                                <option value="Thailand">Thailand</option>
                                                <option value="USA">United States</option>
                                                <option value="UK">United Kingdom</option>
                                                <option value="Singapore">Singapore</option>
                                                <option value="Malaysia">Malaysia</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
