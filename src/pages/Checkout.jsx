import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Banknote, MapPin, User as UserIcon, Package, CheckCircle,
    ArrowLeft, Truck, Upload, X, ImageIcon, Copy, Check, Clock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logActivity } from '../utils/logActivity';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Thailand',
        saveInfo: false,
    });

    const [slipFile, setSlipFile] = useState(null);
    const [slipPreview, setSlipPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [copied, setCopied] = useState('');

    // Active bank account fetched from Firestore
    const [bankInfo, setBankInfo] = useState(null);
    const [bankLoading, setBankLoading] = useState(true);

    // Shipping settings from Firestore
    const [shippingSettings, setShippingSettings] = useState({ flatFee: 100, freeThreshold: 1500 });

    // Auto-fill from user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const d = userDoc.data();
                    setFormData(prev => ({
                        ...prev,
                        fullName: d.displayName || user.displayName || '',
                        email: d.email || user.email || '',
                        phone: d.phone || '',
                        address: d.address || '',
                        city: d.city || '',
                        state: d.state || '',
                        zipCode: d.zipCode || '',
                        country: d.country || 'Thailand',
                    }));
                }
            } catch (e) { console.error(e); }
        };
        fetchUserProfile();
    }, [user]);

    // Fetch active bank account from Firestore
    useEffect(() => {
        const fetchBankAccount = async () => {
            setBankLoading(true);
            try {
                const snap = await getDoc(doc(db, 'settings', 'bankAccounts'));
                if (snap.exists()) {
                    const data = snap.data();
                    const active = (data.accounts || []).find(a => a.id === data.activeId);
                    setBankInfo(active || null);
                }
            } catch (e) {
                console.error('Failed to load bank account:', e);
            } finally {
                setBankLoading(false);
            }
        };
        fetchBankAccount();
    }, []);

    // Fetch shipping settings
    useEffect(() => {
        const fetchShippingSettings = async () => {
            try {
                const snap = await getDoc(doc(db, 'settings', 'shipping'));
                if (snap.exists()) {
                    const d = snap.data();
                    setShippingSettings({
                        flatFee: d.flatFee ?? 100,
                        freeThreshold: d.freeThreshold ?? 1500,
                    });
                }
            } catch (e) {
                console.error('Failed to load shipping settings:', e);
            }
        };
        fetchShippingSettings();
    }, []);

    const steps = [
        { id: 1, name: 'Information', icon: UserIcon },
        { id: 2, name: 'Shipping', icon: Truck },
        { id: 3, name: 'Payment', icon: Banknote },
    ];

    const subtotal = getCartTotal();
    const shipping = subtotal >= shippingSettings.freeThreshold ? 0 : shippingSettings.flatFee;
    const tax = subtotal * 0.07;
    const total = subtotal + shipping + tax;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        if (validationErrors[name]) setValidationErrors({ ...validationErrors, [name]: '' });
    };

    const validateStep = (step) => {
        const errors = {};
        if (step === 1) {
            if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
            if (!formData.email.trim()) errors.email = 'Email is required';
            if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
            if (!formData.phone.trim()) errors.phone = 'Phone number is required';
        }
        if (step === 2) {
            if (!formData.address.trim()) errors.address = 'Address is required';
            if (!formData.city.trim()) errors.city = 'City is required';
            if (!formData.state.trim()) errors.state = 'State is required';
            if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(s => s + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(s => s - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    // Handle slip file selection
    const handleSlipChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG, etc.)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be under 5MB');
            return;
        }
        setError('');
        setSlipFile(file);
        setSlipPreview(URL.createObjectURL(file));
    };

    // Upload slip to Cloudinary and return URL
    const uploadSlipToCloudinary = async (file) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('upload_preset', uploadPreset);
        formDataUpload.append('folder', 'payment_slips');

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formDataUpload,
        });
        if (!res.ok) throw new Error('Failed to upload slip image');
        const data = await res.json();
        return data.secure_url;
    };

    // Final submit — upload slip + create order
    const handlePlaceOrder = async () => {
        if (!slipFile) {
            setError('Please upload your payment slip before placing the order.');
            return;
        }
        setError('');
        setSubmitting(true);

        try {
            // Upload slip
            setUploading(true);
            const slipUrl = await uploadSlipToCloudinary(slipFile);
            setUploading(false);

            // Update stock
            await Promise.all(cartItems.map(async (item) => {
                const productRef = doc(db, 'products', item.id);
                try {
                    await runTransaction(db, async (transaction) => {
                        const productDoc = await transaction.get(productRef);
                        if (!productDoc.exists()) return;
                        const currentStock = productDoc.data().stock || 0;
                        const newStock = Math.max(0, currentStock - item.quantity);
                        transaction.update(productRef, { stock: newStock, updatedAt: new Date() });
                    });
                } catch (e) { console.error(`Stock update failed for ${item.name}:`, e); }
            }));

            // Save order
            const orderData = {
                userId: user?.uid || 'guest',
                userEmail: formData.email,
                userName: formData.fullName,
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    discount: item.discount || 0,
                    image: item.image,
                    category: item.category,
                })),
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                    phone: formData.phone,
                },
                subtotal,
                shipping,
                tax,
                total,
                paymentMethod: 'bank_transfer',
                paymentStatus: 'pending_verification',   // admin will change to 'paid' or 'rejected'
                slipUrl,
                orderStatus: 'pending',
                createdAt: serverTimestamp(),
            };

            const orderRef = await addDoc(collection(db, 'orders'), orderData);

            await logActivity({
                type: 'order',
                icon: 'ShoppingCart',
                title: 'New Order — Awaiting Payment Verification',
                description: `${formData.fullName} placed order #${orderRef.id.slice(0, 8).toUpperCase()} · ฿${total.toFixed(2)} · Slip uploaded`,
                color: 'cyan',
            });

            clearCart();
            navigate('/order-success', { state: { orderId: orderRef.id, orderTotal: total, paymentMethod: 'bank_transfer' } });
        } catch (e) {
            console.error('Order error:', e);
            setError('Failed to place order: ' + e.message);
        } finally {
            setSubmitting(false);
            setUploading(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen py-8 md:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <Link to="/cart" className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors duration-200 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        <ArrowLeft className="w-5 h-5" />
                        <span className="uppercase tracking-wide">Back to Cart</span>
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(0,255,255,0.8)' }}>Secure </span>
                        <span className="text-gradient" style={{ textShadow: '0 0 20px rgba(255,0,255,0.6)' }}>Checkout</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Complete your order in just a few steps</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 md:mb-12 animate-fade-in">
                    <div className="card p-6 md:p-8 bg-gray-900/50 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0,255,255,0.2)' }}>
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-700 -z-10">
                                <div className="h-full bg-gradient-to-r from-cyan-400 to-magenta-400 transition-all duration-500"
                                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, boxShadow: '0 0 10px rgba(0,255,255,0.6)' }} />
                            </div>
                            {steps.map((step) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;
                                return (
                                    <div key={step.id} className="flex flex-col items-center flex-1">
                                        <div className={`w-12 h-12 corner-clip-sm flex items-center justify-center mb-2 transition-all duration-300 border-2 ${isCompleted ? 'bg-gradient-to-br from-magenta-500 to-magenta-600 text-white border-magenta-500/50 scale-110' : isActive ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-cyan-500/50 scale-110' : 'bg-gray-800 text-gray-500 border-gray-700'}`}
                                            style={{ boxShadow: isActive || isCompleted ? '0 0 20px rgba(0,255,255,0.5)' : 'none' }}>
                                            {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                        </div>
                                        <span className={`text-xs md:text-sm font-black uppercase tracking-wide ${isActive ? 'text-cyan-400' : isCompleted ? 'text-magenta-400' : 'text-gray-500'}`}
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>{step.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Step 1: Contact */}
                        {currentStep === 1 && (
                            <div className="card p-6 md:p-8 animate-fade-in bg-gray-900/50 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0,255,255,0.2)' }}>
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-10 h-10 corner-clip-sm bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center border-2 border-cyan-500/50" style={{ boxShadow: '0 0 15px rgba(0,255,255,0.4)' }}>
                                        <UserIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>Contact Information</h2>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name *</label>
                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                                            className={`input-field ${validationErrors.fullName ? 'border-red-500' : ''}`} placeholder="John Doe" />
                                        {validationErrors.fullName && <p className="mt-1 text-sm text-red-400">{validationErrors.fullName}</p>}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address *</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                                                className={`input-field ${validationErrors.email ? 'border-red-500' : ''}`} placeholder="you@example.com" />
                                            {validationErrors.email && <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number *</label>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                                className={`input-field ${validationErrors.phone ? 'border-red-500' : ''}`} placeholder="+66 XX XXX XXXX" />
                                            {validationErrors.phone && <p className="mt-1 text-sm text-red-400">{validationErrors.phone}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <input type="checkbox" name="saveInfo" checked={formData.saveInfo} onChange={handleInputChange}
                                            className="w-4 h-4 text-cyan-500 border-gray-600 rounded focus:ring-cyan-500" />
                                        <label className="ml-2 text-sm text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Save this information for next time</label>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button type="button" onClick={handleNextStep} className="btn-primary px-8">Continue to Shipping</button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Shipping */}
                        {currentStep === 2 && (
                            <div className="card p-6 md:p-8 animate-fade-in bg-gray-900/50 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0,255,255,0.2)' }}>
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-10 h-10 corner-clip-sm bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center border-2 border-cyan-500/50" style={{ boxShadow: '0 0 15px rgba(0,255,255,0.4)' }}>
                                        <MapPin className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>Shipping Address</h2>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Street Address *</label>
                                        <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                                            className={`input-field ${validationErrors.address ? 'border-red-500' : ''}`} placeholder="123 Main Street, Apt 4B" />
                                        {validationErrors.address && <p className="mt-1 text-sm text-red-400">{validationErrors.address}</p>}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">City *</label>
                                            <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                                                className={`input-field ${validationErrors.city ? 'border-red-500' : ''}`} placeholder="Bangkok" />
                                            {validationErrors.city && <p className="mt-1 text-sm text-red-400">{validationErrors.city}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">State / Province *</label>
                                            <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                                                className={`input-field ${validationErrors.state ? 'border-red-500' : ''}`} placeholder="Bangkok" />
                                            {validationErrors.state && <p className="mt-1 text-sm text-red-400">{validationErrors.state}</p>}
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">ZIP / Postal Code *</label>
                                            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange}
                                                className={`input-field ${validationErrors.zipCode ? 'border-red-500' : ''}`} placeholder="10110" />
                                            {validationErrors.zipCode && <p className="mt-1 text-sm text-red-400">{validationErrors.zipCode}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">Country *</label>
                                            <select name="country" value={formData.country} onChange={handleInputChange} className="input-field">
                                                <option value="Thailand">Thailand</option>
                                                <option value="USA">United States</option>
                                                <option value="UK">United Kingdom</option>
                                                <option value="Singapore">Singapore</option>
                                                <option value="Malaysia">Malaysia</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-between">
                                    <button type="button" onClick={handlePrevStep} className="btn-secondary px-8">Back</button>
                                    <button type="button" onClick={handleNextStep} className="btn-primary px-8">Continue to Payment</button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Bank Transfer + Slip Upload */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-fade-in">

                                {/* Bank Account Details */}
                                <div className="card p-6 md:p-8 bg-gray-900/50 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0,255,255,0.2)' }}>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-10 h-10 corner-clip-sm bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center border-2 border-cyan-500/50" style={{ boxShadow: '0 0 15px rgba(0,255,255,0.4)' }}>
                                            <Banknote className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>Bank Transfer</h2>
                                    </div>

                                    {/* Instructions */}
                                    <div className="bg-cyan-500/10 border-2 border-cyan-500/30 corner-clip-sm p-4 mb-6" style={{ boxShadow: '0 0 15px rgba(0,255,255,0.1)' }}>
                                        <p className="text-cyan-300 font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            📋 Transfer the exact amount to the account below, then upload your payment slip.
                                            Your order will be confirmed once our team verifies the payment.
                                        </p>
                                    </div>

                                    {/* Amount to transfer */}
                                    <div className="bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 border-2 border-cyan-500/50 corner-clip-sm p-5 mb-6" style={{ boxShadow: '0 0 20px rgba(0,255,255,0.2)' }}>
                                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Amount to Transfer</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-4xl font-black text-gradient" style={{ fontFamily: 'Orbitron, sans-serif' }}>฿{total.toFixed(2)}</span>
                                            <button onClick={() => copyToClipboard(total.toFixed(2), 'amount')}
                                                className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-bold border border-cyan-500/40 px-3 py-1.5 corner-clip-sm transition-all hover:bg-cyan-500/10"
                                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                {copied === 'amount' ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bank details */}
                                    {bankLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-14 bg-gray-800/60 border border-cyan-500/10 corner-clip-sm animate-pulse" />
                                            ))}
                                        </div>
                                    ) : !bankInfo ? (
                                        <div className="flex items-start gap-3 bg-red-500/10 border-2 border-red-500/30 corner-clip-sm p-4">
                                            <Clock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-red-300 font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                No bank account has been configured yet. Please contact the store admin.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Bank', value: bankInfo.bankName, key: 'bank' },
                                                { label: 'Account Name', value: bankInfo.accountName, key: 'name' },
                                                { label: 'Account Number', value: bankInfo.accountNumber, key: 'acc' },
                                                bankInfo.branch && { label: 'Branch', value: bankInfo.branch, key: 'branch' },
                                                bankInfo.promptpay && { label: 'PromptPay', value: bankInfo.promptpay, key: 'pp' },
                                            ].filter(Boolean).map(({ label, value, key }) => (
                                                <div key={key} className="flex items-center justify-between bg-gray-800/60 border border-cyan-500/20 corner-clip-sm px-4 py-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{label}</p>
                                                        <p className="text-white font-black" style={{ fontFamily: key === 'acc' || key === 'pp' ? 'Orbitron, sans-serif' : 'Rajdhani, sans-serif' }}>{value}</p>
                                                    </div>
                                                    <button onClick={() => copyToClipboard(value, key)}
                                                        className="text-cyan-400 hover:text-cyan-300 transition-colors p-1.5 hover:bg-cyan-500/10 corner-clip-sm"
                                                        title="Copy">
                                                        {copied === key ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Slip Upload */}
                                <div className="card p-6 md:p-8 bg-gray-900/50 border-2 border-magenta-500/30" style={{ boxShadow: '0 0 30px rgba(255,0,255,0.15)' }}>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-10 h-10 corner-clip-sm bg-gradient-to-br from-magenta-500 to-purple-600 flex items-center justify-center border-2 border-magenta-500/50" style={{ boxShadow: '0 0 15px rgba(255,0,255,0.4)' }}>
                                            <Upload className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-black text-magenta-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>Upload Payment Slip</h2>
                                    </div>

                                    {!slipPreview ? (
                                        <label className="block cursor-pointer">
                                            <div className="border-2 border-dashed border-magenta-500/40 corner-clip hover:border-magenta-400 hover:bg-magenta-500/5 transition-all duration-200 p-10 text-center"
                                                style={{ boxShadow: '0 0 20px rgba(255,0,255,0.05)' }}>
                                                <ImageIcon className="w-12 h-12 text-magenta-500/50 mx-auto mb-4" />
                                                <p className="text-magenta-400 font-black text-lg uppercase tracking-wide mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                    Click to upload slip
                                                </p>
                                                <p className="text-gray-500 text-sm font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                    JPG, PNG, WEBP — max 5MB
                                                </p>
                                            </div>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleSlipChange} />
                                        </label>
                                    ) : (
                                        <div className="relative">
                                            <img src={slipPreview} alt="Payment slip" className="w-full max-h-80 object-contain corner-clip border-2 border-magenta-500/40 bg-gray-800" />
                                            <button
                                                onClick={() => { setSlipFile(null); setSlipPreview(''); }}
                                                className="absolute top-3 right-3 w-8 h-8 bg-red-600 hover:bg-red-500 text-white corner-clip-sm flex items-center justify-center transition-colors"
                                                title="Remove slip">
                                                <X className="w-4 h-4" />
                                            </button>
                                            <p className="mt-3 text-green-400 font-black text-sm uppercase tracking-wide flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                <CheckCircle className="w-4 h-4" /> Slip ready to upload
                                            </p>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="mt-4 p-4 bg-red-900/20 border-2 border-red-500/50 corner-clip-sm text-red-400 text-sm font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            {error}
                                        </div>
                                    )}

                                    {/* Pending notice */}
                                    <div className="mt-5 bg-yellow-500/10 border border-yellow-500/30 corner-clip-sm p-4 flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-yellow-300 text-sm font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            After placing your order, our team will verify your payment within <strong>1–2 business hours</strong>.
                                            You can track the status in <strong>My Orders</strong>.
                                        </p>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex justify-between items-center">
                                    <button type="button" onClick={handlePrevStep} className="btn-secondary px-8">← Back to Shipping</button>
                                    <button
                                        type="button"
                                        onClick={handlePlaceOrder}
                                        disabled={submitting || !slipFile}
                                        className="btn-primary px-10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {uploading ? 'Uploading slip...' : 'Placing order...'}</>
                                        ) : (
                                            <><CheckCircle className="w-5 h-5" /> Place Order</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 corner-clip-lg overflow-hidden sticky top-24 animate-fade-in border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0,255,255,0.3)' }}>
                            <div className="bg-gradient-to-r from-cyan-600 to-magenta-600 p-5">
                                <h2 className="text-xl font-black text-white flex items-center space-x-2 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                    <Package className="w-6 h-6" />
                                    <span>Order Summary</span>
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="bg-gray-800/50 border border-cyan-500/30 corner-clip-sm p-3">
                                            <div className="flex space-x-3">
                                                <div className="relative flex-shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover corner-clip-sm" />
                                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 text-white text-xs font-black corner-clip-sm flex items-center justify-center" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.quantity}</span>
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h4 className="font-black text-white text-sm mb-1 line-clamp-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.name}</h4>
                                                    <p className="text-xs text-gray-400 mb-2 font-bold">{item.category}</p>
                                                    <p className="text-lg font-black text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                        ฿{((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3 pt-4 border-t border-cyan-500/30">
                                    <div className="flex justify-between text-gray-300">
                                        <span className="font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Subtotal</span>
                                        <span className="font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>฿{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-300">
                                        <span className="font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Shipping</span>
                                        <span className={`font-black ${shipping === 0 ? 'text-magenta-400' : 'text-white'}`} style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                            {shipping === 0 ? 'FREE' : `฿${shipping.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-300">
                                        <span className="font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Tax (7% VAT)</span>
                                        <span className="font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>฿{tax.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="mt-4 bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 -mx-6 px-6 py-5 border-t border-cyan-500/50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>Total</span>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-gradient" style={{ textShadow: '0 0 20px rgba(0,255,255,0.6)' }}>฿{total.toFixed(2)}</div>
                                            <div className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Including VAT</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
