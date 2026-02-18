import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../utils/logActivity';
import CloudinaryUpload from '../components/CloudinaryUpload';
import AdminOrders from './AdminOrders';
import AdminCustomers from './AdminCustomers';
import AdminSettings from './AdminSettings';
import AdminCategories from './AdminCategories';
import AdminBankAccounts from './AdminBankAccounts';
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
    Image as ImageIcon,
    Tag,
    Banknote
} from 'lucide-react';


const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState(() => {
        // Initialize from localStorage or default to 'dashboard'
        return localStorage.getItem('adminActiveTab') || 'dashboard';
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [recentActivity, setRecentActivity] = useState([]);
    const [showAllActivity, setShowAllActivity] = useState(false);
    const [categories, setCategories] = useState([]);
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

    // Save active tab to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('adminActiveTab', activeTab);
    }, [activeTab]);

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

    // Real-time activity log listener — only runs once user is authenticated
    useEffect(() => {
        if (!user) return; // wait for auth before subscribing
        const q = query(
            collection(db, 'activityLogs'),
            orderBy('createdAt', 'desc'),
            limit(100)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                timestamp: d.data().createdAt?.toDate?.()?.getTime() || Date.now()
            }));
            setRecentActivity(logs);
        }, (err) => console.error('Activity log error:', err));
        return () => unsubscribe();
    }, [user]); // re-run when user changes (login/logout)

    // Real-time categories listener — updates instantly when categories are added/edited/deleted
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'categories'),
            (snapshot) => {
                const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setCategories(data);
            },
            (error) => {
                console.error('Error listening to categories:', error);
            }
        );
        return () => unsubscribe(); // cleanup on unmount
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
            await logActivity({
                type: 'product', icon: 'Package',
                title: 'Product Added',
                description: `"${formData.name}" added to inventory`,
                color: 'cyan'
            });
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
            await logActivity({
                type: 'product', icon: 'Package',
                title: 'Product Updated',
                description: `"${formData.name}" details updated`,
                color: 'cyan'
            });
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
            const productName = products.find(p => p.id === productId)?.name || 'Product';
            await deleteDoc(doc(db, 'products', productId));
            await logActivity({
                type: 'product', icon: 'Package',
                title: 'Product Deleted',
                description: `"${productName}" removed from inventory`,
                color: 'orange'
            });
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
        { id: 'categories', icon: Tag, label: 'Categories' },
        { id: 'orders', icon: ShoppingCart, label: 'Orders' },
        { id: 'customers', icon: Users, label: 'Customers' },
        { id: 'bank-accounts', icon: Banknote, label: 'Bank Accounts' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e27] via-[#0f172a] to-[#1a1f3a]">
                <div className="relative">
                    <div className="animate-spin corner-clip h-16 w-16 border-t-4 border-b-4 border-cyan-400" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.6)' }}></div>
                    <div className="absolute inset-0 corner-clip border-2 border-magenta-400 animate-ping"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
                    <div className={`flex items-center gap-3 px-6 py-4 corner-clip-sm shadow-2xl border-2 relative overflow-hidden ${toast.type === 'success'
                        ? 'bg-green-500/10 border-green-500/50 text-green-400'
                        : 'bg-red-500/10 border-red-500/50 text-red-400'
                        }`} style={{ boxShadow: toast.type === 'success' ? '0 0 30px rgba(0, 255, 0, 0.4)' : '0 0 30px rgba(255, 0, 0, 0.4)' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-800/90"></div>
                        {toast.type === 'success' ? (
                            <div className="w-6 h-6 corner-clip-sm bg-green-500 flex items-center justify-center flex-shrink-0 relative z-10" style={{ boxShadow: '0 0 10px rgba(0, 255, 0, 0.8)' }}>
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        ) : (
                            <div className="w-6 h-6 corner-clip-sm bg-red-500 flex items-center justify-center flex-shrink-0 relative z-10" style={{ boxShadow: '0 0 10px rgba(255, 0, 0, 0.8)' }}>
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        )}
                        <p className="font-bold relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{toast.message}</p>
                        <button
                            onClick={() => setToast({ show: false, message: '', type: '' })}
                            className="ml-2 hover:opacity-70 transition-opacity relative z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f172a] to-[#1a1f3a] overflow-hidden relative">
                {/* ── Mobile overlay backdrop ── */}
                {mobileSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}

                {/* ── Sidebar (desktop: always visible | mobile: slide-over drawer) ── */}
                <aside className={`
                    fixed md:relative inset-y-0 left-0 z-50
                    ${sidebarOpen ? 'md:w-64' : 'md:w-20'}
                    ${mobileSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full md:translate-x-0'}
                    bg-gradient-to-b from-gray-900/98 to-gray-800/98 backdrop-blur-xl text-white
                    transition-all duration-300 flex flex-col
                    border-r-2 border-cyan-500/30 overflow-hidden
                `} style={{ boxShadow: '0 0 40px rgba(0, 255, 255, 0.2)' }}>
                    {/* Scan lines */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)' }} />

                    {/* Logo / Toggle */}
                    <div className={`flex items-center border-b-2 border-cyan-500/30 relative z-10 ${sidebarOpen ? 'md:p-6 p-4 justify-between' : 'p-4 justify-center'}`}>
                        {/* Always show title on mobile drawer, respect sidebarOpen on desktop */}
                        <div className={`${sidebarOpen ? 'block' : 'hidden md:hidden'} md:${sidebarOpen ? 'block' : 'hidden'}`}>
                            <h1 className="text-xl md:text-2xl font-black text-cyan-400 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 1)' }}>Admin Zone</h1>
                            <p className="text-cyan-300 text-xs md:text-sm font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Control Panel</p>
                        </div>
                        {/* Desktop collapse toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hidden md:flex p-2 hover:bg-cyan-500/20 corner-clip-sm transition-all duration-200 border-2 border-transparent hover:border-cyan-500/50"
                            style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)' }}
                        >
                            {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5 text-cyan-400" />}
                        </button>
                        {/* Mobile close button */}
                        <button
                            onClick={() => setMobileSidebarOpen(false)}
                            className="md:hidden p-2 hover:bg-red-500/20 corner-clip-sm transition-all border-2 border-transparent hover:border-red-500/50"
                        >
                            <X className="w-5 h-5 text-red-400" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1 relative z-10 overflow-y-auto">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    localStorage.setItem('adminActiveTab', item.id);
                                    setMobileSidebarOpen(false);
                                }}
                                title={!sidebarOpen ? item.label : undefined}
                                className={`w-full flex items-center corner-clip-sm transition-all duration-200 border-2 relative overflow-hidden group
                                    space-x-3 px-4 py-3
                                    md:${sidebarOpen ? 'space-x-3 px-4 py-3' : 'justify-center px-0 py-3'}
                                    ${activeTab === item.id
                                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/50'
                                        : 'text-cyan-300 hover:bg-cyan-500/10 border-transparent hover:border-cyan-500/30'
                                    }`}
                                style={activeTab === item.id ? { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' } : {}}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <item.icon
                                    className="w-5 h-5 flex-shrink-0 relative z-10"
                                    style={activeTab === item.id ? { filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' } : {}}
                                />
                                {/* Always show label in mobile drawer; respect sidebarOpen on desktop */}
                                <span className={`font-black uppercase tracking-wide relative z-10 ${sidebarOpen ? 'md:inline' : 'md:hidden'} inline`}
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t-2 border-cyan-500/20 relative z-10">
                        <div className="bg-gray-800/60 corner-clip-sm border border-cyan-500/20 overflow-hidden"
                            style={{ boxShadow: '0 0 20px rgba(0,255,255,0.08)' }}>
                            <div className="flex items-center gap-3 px-4 py-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 corner-clip-sm flex items-center justify-center flex-shrink-0"
                                    style={{ boxShadow: '0 0 12px rgba(0,255,255,0.5)' }}>
                                    <span className="text-white font-black text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                        {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <div className={`flex-1 min-w-0 ${sidebarOpen ? 'md:block' : 'md:hidden'} block`}>
                                    <p className="text-white font-black text-sm truncate leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        {user?.displayName || user?.email?.split('@')[0]}
                                    </p>
                                    <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        Administrator
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    title="Logout"
                                    className="w-8 h-8 flex items-center justify-center corner-clip-sm border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-400 transition-all duration-200 flex-shrink-0 group"
                                    style={{ boxShadow: '0 0 8px rgba(255,0,0,0.15)' }}
                                >
                                    <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto flex flex-col">
                    {/* Mobile top bar */}
                    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-900/95 border-b-2 border-cyan-500/30 sticky top-0 z-30"
                        style={{ boxShadow: '0 0 20px rgba(0,255,255,0.15)' }}>
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="p-2 hover:bg-cyan-500/20 corner-clip-sm border-2 border-cyan-500/40 transition-all"
                        >
                            <Menu className="w-5 h-5 text-cyan-400" />
                        </button>
                        <h1 className="text-lg font-black text-cyan-400 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0,255,255,0.8)' }}>
                            {menuItems.find(m => m.id === activeTab)?.label || 'Admin'}
                        </h1>
                        <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 corner-clip-sm flex items-center justify-center"
                            style={{ boxShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
                            <span className="text-white font-black text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 md:p-8 pb-24 md:pb-8">
                        {/* Dashboard View */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-4 md:space-y-6 animate-fade-in">
                                {/* Header — hidden on mobile (shown in top bar) */}
                                <div className="hidden md:block bg-gray-900 corner-clip p-6 md:p-8 border-2 border-cyan-500/50 relative overflow-hidden" style={{ boxShadow: '0 0 40px rgba(0, 255, 255, 0.4)' }}>
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)' }} />
                                    <div className="flex items-center space-x-4 relative z-10">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-500 to-blue-600 corner-clip flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.6)' }}>
                                            <LayoutDashboard className="w-7 h-7 md:w-8 md:h-8 text-white" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 1))' }} />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl md:text-4xl font-black text-cyan-400 mb-1 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 1)' }}>Dashboard</h1>
                                            <p className="text-cyan-200 text-base md:text-lg font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Command Center Overview</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
                                    <div className="bg-gray-900 backdrop-blur-sm p-4 md:p-6 corner-clip border-2 border-cyan-500/50 relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)' }}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent"></div>
                                        <div className="flex items-center justify-between relative z-10">
                                            <div>
                                                <p className="text-cyan-200 text-xs md:text-sm font-black uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Products</p>
                                                <h3 className="text-4xl md:text-5xl font-black mt-1 md:mt-2 text-white" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 255, 1)' }}>{totalProducts}</h3>
                                            </div>
                                            <div className="p-3 md:p-4 bg-cyan-500/20 corner-clip border-2 border-cyan-500/50" style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>
                                                <Package className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 1))' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900 backdrop-blur-sm p-4 md:p-6 corner-clip border-2 border-green-500/50 relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(0, 255, 0, 0.5)' }}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent"></div>
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="min-w-0 flex-1 mr-3">
                                                <p className="text-green-200 text-xs md:text-sm font-black uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Inventory Value</p>
                                                <h3 className="text-3xl md:text-5xl font-black mt-1 md:mt-2 text-white truncate" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 255, 0, 1)' }}>฿{totalValue.toFixed(0)}</h3>
                                            </div>
                                            <div className="p-3 md:p-4 bg-green-500/20 corner-clip border-2 border-green-500/50 flex-shrink-0" style={{ boxShadow: '0 0 20px rgba(0, 255, 0, 0.6)' }}>
                                                <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-green-400" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 0, 1))' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900 backdrop-blur-sm p-4 md:p-6 corner-clip border-2 border-orange-500/50 relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(255, 165, 0, 0.5)' }}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent"></div>
                                        <div className="flex items-center justify-between relative z-10">
                                            <div>
                                                <p className="text-orange-200 text-xs md:text-sm font-black uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Low Stock Items</p>
                                                <h3 className="text-4xl md:text-5xl font-black mt-1 md:mt-2 text-white" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(255, 165, 0, 1)' }}>{lowStockProducts}</h3>
                                            </div>
                                            <div className="p-3 md:p-4 bg-orange-500/20 corner-clip border-2 border-orange-500/50" style={{ boxShadow: '0 0 20px rgba(255, 165, 0, 0.6)' }}>
                                                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-orange-400" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 165, 0, 1))' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-gray-900 corner-clip p-4 md:p-6 border-2 border-cyan-500/30 relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}>
                                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)' }}></div>
                                    <h3 className="text-lg md:text-2xl font-black mb-4 md:mb-6 text-cyan-400 uppercase tracking-wider relative z-10" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0, 255, 255, 0.8)' }}>Quick Actions</h3>
                                    <div className="grid grid-cols-2 gap-3 md:gap-4 relative z-10">
                                        <button
                                            onClick={() => {
                                                setActiveTab('products');
                                                setShowAddForm(true);
                                                resetForm();
                                            }}
                                            className="p-4 md:p-6 border-2 border-cyan-500/50 corner-clip-sm hover:border-cyan-400 hover:bg-cyan-500/10 transition-all text-center group relative overflow-hidden"
                                            style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)' }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <Plus className="w-7 h-7 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 text-cyan-400 relative z-10" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.8))' }} />
                                            <p className="font-black text-white uppercase tracking-wide text-xs md:text-sm relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Add Product</p>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('orders')}
                                            className="p-4 md:p-6 border-2 border-magenta-500/50 corner-clip-sm hover:border-magenta-400 hover:bg-magenta-500/10 transition-all text-center group relative overflow-hidden"
                                            style={{ boxShadow: '0 0 15px rgba(255, 0, 255, 0.2)' }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-magenta-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <ShoppingCart className="w-7 h-7 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 text-magenta-400 relative z-10" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 0, 255, 0.8))' }} />
                                            <p className="font-black text-white uppercase tracking-wide text-xs md:text-sm relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>View Orders</p>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('customers')}
                                            className="p-4 md:p-6 border-2 border-purple-500/50 corner-clip-sm hover:border-purple-400 hover:bg-purple-500/10 transition-all text-center group relative overflow-hidden"
                                            style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.2)' }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <Users className="w-7 h-7 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 text-purple-400 relative z-10" style={{ filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.8))' }} />
                                            <p className="font-black text-white uppercase tracking-wide text-xs md:text-sm relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Customers</p>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('settings')}
                                            className="p-4 md:p-6 border-2 border-blue-500/50 corner-clip-sm hover:border-blue-400 hover:bg-blue-500/10 transition-all text-center group relative overflow-hidden"
                                            style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)' }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <Settings className="w-7 h-7 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 text-blue-400 relative z-10" style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' }} />
                                            <p className="font-black text-white uppercase tracking-wide text-xs md:text-sm relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Settings</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-gray-900 corner-clip p-6 border-2 border-purple-500/30 relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(147, 51, 234, 0.2)' }}>
                                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(147, 51, 234, 0.1) 2px, rgba(147, 51, 234, 0.1) 4px)' }}></div>
                                    {/* Header row */}
                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-2xl font-black text-purple-400 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(147, 51, 234, 0.8)' }}>Recent Activity</h3>
                                            {recentActivity.length > 0 && (
                                                <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/50 corner-clip-sm text-purple-300 text-xs font-black"
                                                    style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 8px rgba(147,51,234,0.4)' }}>
                                                    {recentActivity.length}
                                                </span>
                                            )}
                                        </div>
                                        {recentActivity.length > 4 && (
                                            <button
                                                onClick={() => setShowAllActivity(prev => !prev)}
                                                className="inline-flex items-center space-x-1 px-4 py-2 corner-clip-sm border-2 border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-400 text-purple-300 text-xs font-black uppercase tracking-wide transition-all"
                                                style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 10px rgba(147,51,234,0.2)' }}
                                            >
                                                {showAllActivity ? (
                                                    <><span>Show Less</span><span className="ml-1">↑</span></>
                                                ) : (
                                                    <><span>View All</span><span className="ml-1 text-purple-400">+{recentActivity.length - 4}</span></>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        {recentActivity.length > 0 ? (
                                            (showAllActivity ? recentActivity : recentActivity.slice(0, 4)).map((activity, index) => {
                                                const IconComponent = activity.icon === 'Package' ? Package :
                                                    activity.icon === 'ShoppingCart' ? ShoppingCart :
                                                        activity.icon === 'Users' ? Users : TrendingUp;

                                                const colorMap = {
                                                    cyan: { border: 'border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/5', bg: 'from-cyan-500 to-blue-500', shadow: '0 0 15px rgba(0, 255, 255, 0.4)', text: 'text-cyan-300', arrow: 'text-cyan-500' },
                                                    green: { border: 'border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5', bg: 'from-green-500 to-emerald-500', shadow: '0 0 15px rgba(0, 255, 0, 0.4)', text: 'text-green-300', arrow: 'text-green-500' },
                                                    magenta: { border: 'border-magenta-500/20 hover:border-magenta-500/40 hover:bg-magenta-500/5', bg: 'from-magenta-500 to-purple-500', shadow: '0 0 15px rgba(255, 0, 255, 0.4)', text: 'text-magenta-300', arrow: 'text-magenta-500' },
                                                    orange: { border: 'border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/5', bg: 'from-orange-500 to-red-500', shadow: '0 0 15px rgba(255, 165, 0, 0.4)', text: 'text-orange-300', arrow: 'text-orange-500' }
                                                };

                                                const colors = colorMap[activity.color] || colorMap.cyan;

                                                // Map activity type → admin tab name
                                                const tabMap = {
                                                    product: 'products',
                                                    order: 'orders',
                                                    user: 'customers',
                                                    category: 'categories',
                                                    settings: 'settings',
                                                };
                                                const targetTab = tabMap[activity.type] || null;

                                                const getTimeAgo = (timestamp) => {
                                                    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
                                                    if (seconds < 60) return 'Just now';
                                                    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
                                                    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
                                                    return `${Math.floor(seconds / 86400)}d ago`;
                                                };

                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => targetTab && setActiveTab(targetTab)}
                                                        className={`w-full text-left flex items-center space-x-4 p-4 bg-gray-800/50 corner-clip-sm border ${colors.border} transition-all group ${targetTab ? 'cursor-pointer' : 'cursor-default'}`}
                                                    >
                                                        <div className={`w-10 h-10 bg-gradient-to-br ${colors.bg} corner-clip-sm flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`} style={{ boxShadow: colors.shadow }}>
                                                            <IconComponent className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{activity.title}</p>
                                                            <p className={`${colors.text} text-sm truncate`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>{activity.description}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <span className="text-gray-500 text-xs font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                {getTimeAgo(activity.timestamp)}
                                                            </span>
                                                            {targetTab && (
                                                                <span className={`${colors.arrow} opacity-0 group-hover:opacity-100 transition-opacity text-sm`}>→</span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>No recent activity</p>
                                            </div>
                                        )}
                                    </div>
                                    {/* Bottom View All button (when expanded) */}
                                    {showAllActivity && recentActivity.length > 4 && (
                                        <div className="mt-4 pt-4 border-t border-purple-500/20 relative z-10">
                                            <button
                                                onClick={() => setShowAllActivity(false)}
                                                className="w-full py-2 corner-clip-sm border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wide hover:bg-purple-500/10 transition-all"
                                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                            >
                                                ↑ Show Less
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Products View */}
                        {activeTab === 'products' && (
                            <div className="space-y-4 md:space-y-6 animate-fade-in">
                                {/* Header — hidden on mobile */}
                                <div className="hidden md:block bg-gray-900 corner-clip p-6 md:p-8 border-2 border-magenta-500/50 relative overflow-hidden" style={{ boxShadow: '0 0 40px rgba(255, 0, 255, 0.4)' }}>
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 255, 0.1) 2px, rgba(255, 0, 255, 0.1) 4px)' }} />
                                    <div className="flex items-center space-x-4 relative z-10">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-magenta-500 to-purple-600 corner-clip flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(255, 0, 255, 0.6)' }}>
                                            <Package className="w-7 h-7 md:w-8 md:h-8 text-white" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 1))' }} />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl md:text-4xl font-black text-magenta-400 mb-1 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(255, 0, 255, 1)' }}>Product Management</h1>
                                            <p className="text-magenta-200 text-base md:text-lg font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Inventory Control System</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Toolbar */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                                    <div className="relative w-full sm:flex-1 sm:max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4 md:w-5 md:h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.6))' }} />
                                        <input
                                            type="text"
                                            placeholder="SEARCH PRODUCTS..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-900 border-2 border-cyan-500/50 corner-clip-sm text-white text-xs md:text-sm placeholder-cyan-300/30 focus:outline-none focus:border-cyan-400 transition-all uppercase tracking-widest"
                                            style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)' }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowAddForm(true);
                                            setEditingProduct(null);
                                            resetForm();
                                        }}
                                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-black uppercase tracking-wide corner-clip-sm border-2 border-cyan-400 transition-all"
                                        style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}
                                    >
                                        <Plus className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))' }} />
                                        <span>Add Product</span>
                                    </button>
                                </div>

                                {/* Add/Edit Form */}
                                {(showAddForm || editingProduct) && (
                                    <div className="bg-gray-900 corner-clip p-6 border-2 border-magenta-500/50 animate-fade-in relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(255, 0, 255, 0.3)' }}>
                                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 255, 0.1) 2px, rgba(255, 0, 255, 0.1) 4px)' }}></div>
                                        <div className="flex justify-between items-center mb-6 relative z-10">
                                            <h3 className="text-2xl font-black text-magenta-400 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(255, 0, 255, 0.8)' }}>
                                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                                            </h3>
                                            <button onClick={cancelEdit} className="p-2 hover:bg-red-500/20 corner-clip-sm border-2 border-red-500/50 hover:border-red-500 transition-all" style={{ boxShadow: '0 0 10px rgba(255, 0, 0, 0.3)' }}>
                                                <X className="w-6 h-6 text-red-400" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 0, 0, 0.8))' }} />
                                            </button>
                                        </div>

                                        <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-6 relative z-10">
                                            {/* Basic Information Section */}
                                            <div className="bg-gray-800/50 p-6 corner-clip-sm border-2 border-cyan-500/30 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent"></div>
                                                <h3 className="text-lg font-black text-cyan-400 mb-4 flex items-center uppercase tracking-wide relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                    <Package className="w-5 h-5 mr-2" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' }} />
                                                    Basic Information
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-6 relative z-10">
                                                    <div>
                                                        <label className="block text-sm font-black text-cyan-300 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            Product Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 bg-gray-900 border-2 border-cyan-500/50 corner-clip-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all"
                                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                                            placeholder="e.g., Premium Wireless Headphones"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-black text-cyan-300 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            Category *
                                                        </label>
                                                        <select
                                                            name="category"
                                                            value={formData.category}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 bg-gray-900 border-2 border-cyan-500/50 corner-clip-sm text-white focus:outline-none focus:border-cyan-400 transition-all"
                                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                                            required
                                                        >
                                                            <option value="" className="bg-gray-900">Select Category</option>
                                                            {categories.length > 0 ? (
                                                                categories.map(cat => (
                                                                    <option key={cat.id} value={cat.name} className="bg-gray-900">
                                                                        {cat.name}
                                                                    </option>
                                                                ))
                                                            ) : (
                                                                <option value="" disabled className="bg-gray-900 text-gray-500">
                                                                    No categories — add them in Categories page
                                                                </option>
                                                            )}
                                                        </select>
                                                        {categories.length === 0 && (
                                                            <p className="text-xs text-orange-400/70 mt-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                ⚡ Go to Categories page to create categories first
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-black text-cyan-300 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            Description *
                                                        </label>
                                                        <textarea
                                                            name="description"
                                                            value={formData.description}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 bg-gray-900 border-2 border-cyan-500/50 corner-clip-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all resize-none"
                                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                                            rows="4"
                                                            placeholder="Describe your product features, benefits, and specifications..."
                                                            required
                                                        />
                                                        <p className="text-xs text-cyan-500/70 mt-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            {formData.description.length} characters
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pricing Section */}
                                            <div className="bg-gray-800/50 p-6 corner-clip-sm border-2 border-green-500/30 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent"></div>
                                                <h3 className="text-lg font-black text-green-400 mb-4 flex items-center uppercase tracking-wide relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                    <DollarSign className="w-5 h-5 mr-2" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 0, 0.8))' }} />
                                                    Pricing & Discount
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-6 relative z-10">
                                                    <div>
                                                        <label className="block text-sm font-black text-green-300 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            Price (฿) *
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                                ฿
                                                            </span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                name="price"
                                                                value={formData.price}
                                                                onChange={handleInputChange}
                                                                className="w-full pl-8 pr-4 py-3 bg-gray-900 border-2 border-green-500/50 corner-clip-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition-all"
                                                                style={{ fontFamily: 'Orbitron, sans-serif' }}
                                                                placeholder="0.00"
                                                                min="0"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-black text-green-300 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            Discount (%)
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                name="discount"
                                                                value={formData.discount}
                                                                onChange={handleInputChange}
                                                                className="w-full px-4 py-3 bg-gray-900 border-2 border-green-500/50 corner-clip-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition-all pr-10"
                                                                style={{ fontFamily: 'Orbitron, sans-serif' }}
                                                                placeholder="0"
                                                                min="0"
                                                                max="100"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Price Preview */}
                                                    {formData.price && (
                                                        <div className="md:col-span-2 bg-gray-900/80 p-4 corner-clip-sm border-2 border-green-500/40" style={{ boxShadow: '0 0 15px rgba(0, 255, 0, 0.15)' }}>
                                                            <p className="text-sm text-green-400 mb-2 uppercase font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Price Preview:</p>
                                                            <div className="flex items-center space-x-3">
                                                                {formData.discount > 0 ? (
                                                                    <>
                                                                        <span className="text-3xl font-black text-green-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0, 255, 0, 0.8)' }}>
                                                                            ฿{(formData.price * (1 - formData.discount / 100)).toFixed(2)}
                                                                        </span>
                                                                        <span className="text-xl text-gray-500 line-through" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                                            ฿{parseFloat(formData.price).toFixed(2)}
                                                                        </span>
                                                                        <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 corner-clip-sm text-sm font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                            -{formData.discount}%
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-3xl font-black text-green-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0, 255, 0, 0.8)' }}>
                                                                        ฿{parseFloat(formData.price).toFixed(2)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Product Image Section */}
                                            <div className="bg-gray-800/50 p-6 corner-clip-sm border-2 border-purple-500/30 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent"></div>
                                                <h3 className="text-lg font-black text-purple-400 mb-4 flex items-center uppercase tracking-wide relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                    <ImageIcon className="w-5 h-5 mr-2" style={{ filter: 'drop-shadow(0 0 5px rgba(147, 51, 234, 0.8))' }} />
                                                    Product Image
                                                </h3>
                                                <div className="relative z-10">
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
                                            </div>

                                            {/* Inventory Section */}
                                            <div className="bg-gray-800/50 p-6 corner-clip-sm border-2 border-orange-500/30 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent"></div>
                                                <h3 className="text-lg font-black text-orange-400 mb-4 flex items-center uppercase tracking-wide relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                    <ShoppingBag className="w-5 h-5 mr-2" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 165, 0, 0.8))' }} />
                                                    Inventory Management
                                                </h3>
                                                <div className="max-w-md relative z-10">
                                                    <div>
                                                        <label className="block text-sm font-black text-orange-300 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                            Stock Quantity *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="stock"
                                                            value={formData.stock}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 bg-gray-900 border-2 border-orange-500/50 corner-clip-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 transition-all"
                                                            style={{ fontFamily: 'Orbitron, sans-serif' }}
                                                            placeholder="0"
                                                            min="0"
                                                            required
                                                        />
                                                        {formData.stock > 0 && (
                                                            <div className="mt-3 p-3 corner-clip-sm bg-gray-900/80 border-2 border-orange-500/30">
                                                                <p className={`text-sm font-black uppercase ${formData.stock > 10 ? 'text-green-400' : 'text-orange-400'}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                    {formData.stock > 10 ? (
                                                                        <span>✓ In Stock — {formData.stock} units available</span>
                                                                    ) : (
                                                                        <span>⚠ Low Stock — Only {formData.stock} units left</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {formData.stock == 0 && (
                                                            <p className="text-xs mt-2 text-red-400 font-black uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                                ✗ Product will be marked as "Out of Stock"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-700">
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center justify-center space-x-2 flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-black uppercase tracking-wider corner-clip-sm border-2 border-cyan-400 transition-all"
                                                    style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 25px rgba(0, 255, 255, 0.5)' }}
                                                >
                                                    <Save className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.8))' }} />
                                                    <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEdit}
                                                    className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-black uppercase tracking-wider corner-clip-sm border-2 border-gray-600 hover:border-gray-500 transition-all"
                                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Products — Table on desktop, Cards on mobile */}
                                <div className="bg-gray-900 corner-clip overflow-hidden border-2 border-cyan-500/30 relative" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}>
                                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)' }} />

                                    {filteredProducts.length === 0 ? (
                                        <div className="px-6 py-12 text-center text-gray-400 relative z-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            {searchQuery ? 'No products found matching your search.' : 'No products yet. Add your first product!'}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Desktop table */}
                                            <div className="hidden md:block overflow-x-auto relative z-10">
                                                <table className="w-full">
                                                    <thead className="bg-gray-800/80 border-b-2 border-cyan-500/50">
                                                        <tr>
                                                            <th className="px-6 py-4 text-left text-sm font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Image</th>
                                                            <th className="px-6 py-4 text-left text-sm font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Name</th>
                                                            <th className="px-6 py-4 text-left text-sm font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Category</th>
                                                            <th className="px-6 py-4 text-left text-sm font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Price</th>
                                                            <th className="px-6 py-4 text-left text-sm font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Stock</th>
                                                            <th className="px-6 py-4 text-left text-sm font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-cyan-500/10">
                                                        {filteredProducts.map((product) => (
                                                            <tr key={product.id} className="hover:bg-cyan-500/5 transition-colors border-b border-cyan-500/10">
                                                                <td className="px-6 py-4">
                                                                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover corner-clip border-2 border-cyan-500/30" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }} />
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{product.name}</div>
                                                                    <div className="text-sm text-gray-400 line-clamp-1">{product.description}</div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="px-3 py-1 bg-magenta-500/20 text-magenta-300 corner-clip-sm text-sm font-black border border-magenta-500/50" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{product.category}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>฿{product.price.toFixed(2)}</div>
                                                                    {product.discount > 0 && <div className="text-sm text-red-400">-{product.discount}%</div>}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`font-black text-sm ${product.stock > 10 ? 'text-green-400' : 'text-orange-400'}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>{product.stock || 0}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex space-x-2">
                                                                        <button onClick={() => startEdit(product)} className="p-2 text-cyan-400 hover:bg-cyan-500/20 corner-clip-sm border-2 border-cyan-500/50 hover:border-cyan-400 transition-all" title="Edit" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)' }}>
                                                                            <Edit2 className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.6))' }} />
                                                                        </button>
                                                                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-400 hover:bg-red-500/20 corner-clip-sm border-2 border-red-500/50 hover:border-red-400 transition-all" title="Delete" style={{ boxShadow: '0 0 10px rgba(255, 0, 0, 0.2)' }}>
                                                                            <Trash2 className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 0, 0, 0.6))' }} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile cards */}
                                            <div className="md:hidden divide-y divide-cyan-500/10 relative z-10">
                                                {filteredProducts.map((product) => (
                                                    <div key={product.id} className="flex items-center gap-3 p-4 hover:bg-cyan-500/5 transition-colors">
                                                        <img src={product.image} alt={product.name} className="w-14 h-14 object-cover corner-clip border-2 border-cyan-500/30 flex-shrink-0" style={{ boxShadow: '0 0 8px rgba(0, 255, 255, 0.3)' }} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-black text-white text-sm truncate" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{product.name}</p>
                                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                <span className="text-xs px-2 py-0.5 bg-magenta-500/20 text-magenta-300 corner-clip-sm border border-magenta-500/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{product.category}</span>
                                                                <span className="font-black text-cyan-400 text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>฿{product.price.toFixed(2)}</span>
                                                                {product.discount > 0 && <span className="text-xs text-red-400">-{product.discount}%</span>}
                                                            </div>
                                                            <p className={`text-xs font-bold mt-1 ${product.stock > 10 ? 'text-green-400' : 'text-orange-400'}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>Stock: {product.stock || 0}</p>
                                                        </div>
                                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                                            <button onClick={() => startEdit(product)} className="p-2 text-cyan-400 hover:bg-cyan-500/20 corner-clip-sm border-2 border-cyan-500/50 transition-all">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-400 hover:bg-red-500/20 corner-clip-sm border-2 border-red-500/50 transition-all">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                        }

                        {/* Categories View */}
                        {activeTab === 'categories' && (
                            <div className="animate-fade-in">
                                <AdminCategories />
                            </div>
                        )}

                        {/* Orders View */}
                        {activeTab === 'orders' && (
                            <div className="animate-fade-in">
                                <AdminOrders />
                            </div>
                        )}

                        {/* Customers View */}
                        {activeTab === 'customers' && (
                            <div className="animate-fade-in">
                                <AdminCustomers />
                            </div>
                        )}

                        {/* Bank Accounts View */}
                        {activeTab === 'bank-accounts' && (
                            <div className="animate-fade-in">
                                <AdminBankAccounts />
                            </div>
                        )}

                        {/* Settings View */}
                        {activeTab === 'settings' && (
                            <div className="animate-fade-in">
                                <AdminSettings />
                            </div>
                        )}
                    </div>

                    {/* Mobile bottom nav bar */}
                    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-gray-900/98 backdrop-blur-xl border-t-2 border-cyan-500/30"
                        style={{ boxShadow: '0 -4px 30px rgba(0,255,255,0.15)' }}>
                        <div className="flex items-center justify-around px-2 py-2">
                            {menuItems.slice(0, 5).map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); localStorage.setItem('adminActiveTab', item.id); }}
                                    className={`flex flex-col items-center gap-1 px-3 py-2 corner-clip-sm transition-all ${activeTab === item.id
                                        ? 'text-cyan-400 bg-cyan-500/15 border-2 border-cyan-500/40'
                                        : 'text-gray-500 border-2 border-transparent'
                                        }`}
                                    style={activeTab === item.id ? { boxShadow: '0 0 12px rgba(0,255,255,0.3)' } : {}}
                                >
                                    <item.icon className="w-5 h-5" style={activeTab === item.id ? { filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.8))' } : {}} />
                                    <span className="text-[10px] font-black uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </nav>
                </main>
            </div>
        </>
    );
};

export default AdminDashboard;
