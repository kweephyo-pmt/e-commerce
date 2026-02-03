import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import CloudinaryUpload from '../components/CloudinaryUpload';
import AdminOrders from './AdminOrders';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Search,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Menu,
    ChevronLeft,
    Image as ImageIcon
} from 'lucide-react';


const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discount: '',
        image: '',
        category: '',
        rating: '',
        reviews: '',
        stock: ''
    });

    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    // Toast notification helper
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Fetch products from Firestore
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'products'));
            const productsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast('Failed to fetch products', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Add new product
    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                discount: formData.discount ? parseInt(formData.discount) : 0,
                rating: formData.rating ? parseFloat(formData.rating) : 0,
                reviews: formData.reviews ? parseInt(formData.reviews) : 0,
                stock: formData.stock ? parseInt(formData.stock) : 0
            };

            await addDoc(collection(db, 'products'), productData);
            showToast('Product added successfully!', 'success');
            setShowAddForm(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            showToast('Failed to add product', 'error');
        }
    };

    // Update existing product
    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                discount: formData.discount ? parseInt(formData.discount) : 0,
                rating: formData.rating ? parseFloat(formData.rating) : 0,
                reviews: formData.reviews ? parseInt(formData.reviews) : 0,
                stock: formData.stock ? parseInt(formData.stock) : 0
            };

            await updateDoc(doc(db, 'products', editingProduct.id), productData);
            showToast('Product updated successfully!', 'success');
            setEditingProduct(null);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            showToast('Failed to update product', 'error');
        }
    };

    // Delete product
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'products', productId));
            showToast('Product deleted successfully!', 'success');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('Failed to delete product', 'error');
        }
    };

    // Start editing a product
    const startEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            discount: product.discount?.toString() || '',
            image: product.image,
            category: product.category,
            rating: product.rating?.toString() || '',
            reviews: product.reviews?.toString() || '',
            stock: product.stock?.toString() || ''
        });
        setShowAddForm(false);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            discount: '',
            image: '',
            category: '',
            rating: '',
            reviews: '',
            stock: ''
        });
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingProduct(null);
        setShowAddForm(false);
        resetForm();
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/admin');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Filter products based on search
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate stats
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStockProducts = products.filter(p => p.stock < 10).length;

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'products', icon: Package, label: 'Products' },
        { id: 'orders', icon: ShoppingCart, label: 'Orders' },
        { id: 'customers', icon: Users, label: 'Customers' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border-2 ${toast.type === 'success'
                        ? 'bg-green-50 border-green-500 text-green-800'
                        : 'bg-red-50 border-red-500 text-red-800'
                        }`}>
                        {toast.type === 'success' ? (
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        )}
                        <p className="font-semibold">{toast.message}</p>
                        <button
                            onClick={() => setToast({ show: false, message: '', type: '' })}
                            className="ml-2 hover:opacity-70 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex h-screen bg-gray-50 overflow-hidden">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-600 to-indigo-700 text-white transition-all duration-300 flex flex-col`}>
                    {/* Logo */}
                    <div className="p-6 flex items-center justify-between border-b border-blue-500">
                        {sidebarOpen && (
                            <div>
                                <h1 className="text-2xl font-bold">ShopAdmin</h1>
                                <p className="text-blue-200 text-sm">Dashboard</p>
                            </div>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
                        >
                            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-white text-blue-600 shadow-lg'
                                    : 'text-blue-100 hover:bg-blue-500'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </button>
                        ))}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-blue-500 space-y-2">
                        {sidebarOpen && (
                            <div className="mb-3 px-3 py-3 bg-blue-500 bg-opacity-50 rounded-lg flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-bold text-sm">
                                        {user?.email?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-blue-200 mb-0.5">Admin</p>
                                    <p className="font-medium text-white text-sm truncate">
                                        {user?.displayName || user?.email?.split('@')[0] || 'Admin'}
                                    </p>
                                </div>
                            </div>
                        )}
                        {!sidebarOpen && (
                            <div className="mb-3 flex justify-center">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-sm">
                                        {user?.email?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-blue-100 hover:bg-red-500 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span className="font-medium">Logout</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {/* Header */}
                    <header className="bg-white shadow-sm sticky top-0 z-10">
                        <div className="px-8 py-6">
                            <h2 className="text-3xl font-bold text-gray-900">
                                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                            </h2>
                            <p className="text-gray-600 mt-1">Manage your store efficiently</p>
                        </div>
                    </header>

                    {/* Content Area */}
                    <div className="p-8">
                        {/* Dashboard View */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-100 text-sm font-medium">Total Products</p>
                                                <h3 className="text-4xl font-bold mt-2">{totalProducts}</h3>
                                            </div>
                                            <div className="p-4 bg-white bg-opacity-20 rounded-xl">
                                                <Package className="w-8 h-8" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-100 text-sm font-medium">Inventory Value</p>
                                                <h3 className="text-4xl font-bold mt-2">฿{totalValue.toFixed(0)}</h3>
                                            </div>
                                            <div className="p-4 bg-white bg-opacity-20 rounded-xl">
                                                <DollarSign className="w-8 h-8" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-orange-100 text-sm font-medium">Low Stock Items</p>
                                                <h3 className="text-4xl font-bold mt-2">{lowStockProducts}</h3>
                                            </div>
                                            <div className="p-4 bg-white bg-opacity-20 rounded-xl">
                                                <TrendingUp className="w-8 h-8" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="card p-6">
                                    <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <button
                                            onClick={() => {
                                                setActiveTab('products');
                                                setShowAddForm(true);
                                                resetForm();
                                            }}
                                            className="p-4 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
                                        >
                                            <Plus className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                            <p className="font-semibold text-gray-700 group-hover:text-blue-600">Add Product</p>
                                        </button>
                                        <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-center group">
                                            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                                            <p className="font-semibold text-gray-700 group-hover:text-gray-900">View Orders</p>
                                        </button>
                                        <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-center group">
                                            <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                                            <p className="font-semibold text-gray-700 group-hover:text-gray-900">Customers</p>
                                        </button>
                                        <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-center group">
                                            <Settings className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                                            <p className="font-semibold text-gray-700 group-hover:text-gray-900">Settings</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products View */}
                        {activeTab === 'products' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Toolbar */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="input-field pl-10 w-full"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowAddForm(true);
                                            setEditingProduct(null);
                                            resetForm();
                                        }}
                                        className="btn-primary inline-flex items-center space-x-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Add Product</span>
                                    </button>
                                </div>

                                {/* Add/Edit Form */}
                                {(showAddForm || editingProduct) && (
                                    <div className="card p-6 animate-fade-in">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-2xl font-bold">
                                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                                            </h3>
                                            <button onClick={cancelEdit} className="p-2 hover:bg-gray-100 rounded-lg">
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>

                                        <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-6">
                                            {/* Basic Information Section */}
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                                                    Basic Information
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Product Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            className="input-field"
                                                            placeholder="e.g., Premium Wireless Headphones"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Category *
                                                        </label>
                                                        <select
                                                            name="category"
                                                            value={formData.category}
                                                            onChange={handleInputChange}
                                                            className="input-field"
                                                            required
                                                        >
                                                            <option value="">Select Category</option>
                                                            <option value="Electronics">Electronics</option>
                                                            <option value="Fashion">Fashion</option>
                                                            <option value="Sports">Sports</option>
                                                            <option value="Home">Home</option>
                                                            <option value="Books">Books</option>
                                                            <option value="Beauty">Beauty</option>
                                                            <option value="Toys">Toys</option>
                                                            <option value="Food">Food & Beverages</option>
                                                        </select>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Description *
                                                        </label>
                                                        <textarea
                                                            name="description"
                                                            value={formData.description}
                                                            onChange={handleInputChange}
                                                            className="input-field"
                                                            rows="4"
                                                            placeholder="Describe your product features, benefits, and specifications..."
                                                            required
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formData.description.length} characters
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pricing Section */}
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                                                    Pricing & Discount
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Price (฿) *
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                                                                ฿
                                                            </span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                name="price"
                                                                value={formData.price}
                                                                onChange={handleInputChange}
                                                                className="input-field pl-8"
                                                                placeholder="0.00"
                                                                min="0"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Discount (%)
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                name="discount"
                                                                value={formData.discount}
                                                                onChange={handleInputChange}
                                                                className="input-field pr-8"
                                                                placeholder="0"
                                                                min="0"
                                                                max="100"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Price Preview */}
                                                    {formData.price && (
                                                        <div className="md:col-span-2 bg-white p-4 rounded-lg border-2 border-green-200">
                                                            <p className="text-sm text-gray-600 mb-2">Price Preview:</p>
                                                            <div className="flex items-center space-x-3">
                                                                {formData.discount > 0 ? (
                                                                    <>
                                                                        <span className="text-3xl font-bold text-green-600">
                                                                            ฿{(formData.price * (1 - formData.discount / 100)).toFixed(2)}
                                                                        </span>
                                                                        <span className="text-xl text-gray-400 line-through">
                                                                            ฿{parseFloat(formData.price).toFixed(2)}
                                                                        </span>
                                                                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                                            -{formData.discount}%
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-3xl font-bold text-gray-800">
                                                                        ฿{parseFloat(formData.price).toFixed(2)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Product Image Section */}
                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                                    <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
                                                    Product Image
                                                </h3>
                                                <CloudinaryUpload
                                                    currentImage={formData.image}
                                                    onUploadSuccess={(url) => {
                                                        setFormData(prev => ({ ...prev, image: url }));
                                                    }}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="image"
                                                    value={formData.image}
                                                    required
                                                />
                                            </div>

                                            {/* Inventory Section */}
                                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                                    <ShoppingBag className="w-5 h-5 mr-2 text-orange-600" />
                                                    Inventory Management
                                                </h3>
                                                <div className="max-w-md">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Stock Quantity *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="stock"
                                                            value={formData.stock}
                                                            onChange={handleInputChange}
                                                            className="input-field"
                                                            placeholder="0"
                                                            min="0"
                                                            required
                                                        />
                                                        {formData.stock > 0 && (
                                                            <div className="mt-2 p-3 rounded-lg bg-white border-2 border-orange-200">
                                                                <p className={`text-sm font-semibold ${formData.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                                                                    {formData.stock > 10 ? (
                                                                        <span>In Stock - {formData.stock} units available</span>
                                                                    ) : (
                                                                        <span>Low Stock - Only {formData.stock} units left</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {formData.stock == 0 && (
                                                            <p className="text-xs mt-2 text-red-600 font-semibold">
                                                                Product will be marked as "Out of Stock"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-4 pt-4 border-t">
                                                <button type="submit" className="btn-primary inline-flex items-center space-x-2 flex-1">
                                                    <Save className="w-5 h-5" />
                                                    <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                                                </button>
                                                <button type="button" onClick={cancelEdit} className="btn-secondary">
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Products Table */}
                                <div className="card overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Image</th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Name</th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Category</th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Price</th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Stock</th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredProducts.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                            {searchQuery ? 'No products found matching your search.' : 'No products found. Add your first product!'}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredProducts.map((product) => (
                                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="w-16 h-16 object-cover rounded-lg"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="font-semibold text-gray-900">{product.name}</div>
                                                                <div className="text-sm text-gray-600 line-clamp-1">{product.description}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                                                    {product.category}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-gray-900">฿{product.price.toFixed(2)}</div>
                                                                {product.discount > 0 && (
                                                                    <div className="text-sm text-red-600">-{product.discount}%</div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                                                                    {product.stock || 0}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => startEdit(product)}
                                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteProduct(product.id)}
                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )
                        }

                        {/* Orders View */}
                        {activeTab === 'orders' && (
                            <div className="animate-fade-in">
                                <AdminOrders />
                            </div>
                        )}

                        {/* Other tabs - Coming Soon */}
                        {
                            ['customers', 'settings'].includes(activeTab) && (
                                <div className="card p-12 text-center animate-fade-in">
                                    <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-700 mb-2">Coming Soon</h3>
                                    <p className="text-gray-600">This feature is under development.</p>
                                </div>
                            )
                        }
                    </div>
                </main>
            </div>
        </>
    );
};

export default AdminDashboard;
