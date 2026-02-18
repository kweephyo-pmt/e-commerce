import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Lock, MapPin, User as UserIcon, Package, CheckCircle, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';
import StripePaymentForm from '../components/StripePaymentForm';
import { logActivity } from '../utils/logActivity';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Track processed payment intents to prevent duplicate orders
    const processedPayments = useRef(new Set());

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
        saveInfo: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Fetch user profile data to auto-fill form
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFormData(prev => ({
                        ...prev,
                        fullName: userData.displayName || user.displayName || '',
                        email: userData.email || user.email || '',
                        phone: userData.phone || '',
                        address: userData.address || '',
                        city: userData.city || '',
                        state: userData.state || '',
                        zipCode: userData.zipCode || '',
                        country: userData.country || 'Thailand'
                    }));
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, [user]);

    const steps = [
        { id: 1, name: 'Information', icon: UserIcon },
        { id: 2, name: 'Shipping', icon: Truck },
        { id: 3, name: 'Payment', icon: CreditCard }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors({ ...validationErrors, [name]: '' });
        }
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
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(currentStep - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // On step 3 (Payment), don't handle form submission
        // The Stripe payment form handles its own submission
        if (currentStep === 3) {
            return;
        }

        // For steps 1 and 2, just move to next step
        if (currentStep < 3) {
            handleNextStep();
        }
    };

    const subtotal = getCartTotal();
    const shipping = subtotal >= 1500 ? 0 : 100;
    const tax = subtotal * 0.07; // 7% VAT for Thailand
    const total = subtotal + shipping + tax;

    return (
        <div className="min-h-screen py-8 md:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <Link
                        to="/cart"
                        className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors duration-200 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="uppercase tracking-wide">Back to Cart</span>
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.8)' }}>Secure </span>
                        <span className="text-gradient" style={{ textShadow: '0 0 20px rgba(255, 0, 255, 0.6)' }}>Checkout</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Complete your order in just a few steps</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 md:mb-12 animate-fade-in">
                    <div className="card p-6 md:p-8 bg-gray-900/50 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}>
                        <div className="flex items-center justify-between relative">
                            {/* Progress Line */}
                            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-700 -z-10">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-400 to-magenta-400 transition-all duration-500"
                                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)' }}
                                />
                            </div>

                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <div key={step.id} className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-12 h-12 corner-clip-sm flex items-center justify-center mb-2 transition-all duration-300 border-2 ${isCompleted
                                                ? 'bg-gradient-to-br from-magenta-500 to-magenta-600 text-white border-magenta-500/50 scale-110'
                                                : isActive
                                                    ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-cyan-500/50 scale-110'
                                                    : 'bg-gray-800 text-gray-500 border-gray-700'
                                                }`}
                                            style={{
                                                boxShadow: isActive || isCompleted ? '0 0 20px rgba(0, 255, 255, 0.5)' : 'none'
                                            }}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle className="w-6 h-6" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 0, 255, 0.8))' }} />
                                            ) : (
                                                <Icon className="w-6 h-6" style={{ filter: isActive ? 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' : 'none' }} />
                                            )}
                                        </div>
                                        <span className={`text-xs md:text-sm font-black text-center uppercase tracking-wide ${isActive ? 'text-cyan-400' : isCompleted ? 'text-magenta-400' : 'text-gray-500'
                                            }`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            {step.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Step 1: Contact Information */}
                            {currentStep === 1 && (
                                <div className="card p-6 md:p-8 animate-fade-in bg-gray-900/50 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-10 h-10 corner-clip-sm bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center border-2 border-cyan-500/50" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)' }}>
                                            <UserIcon className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))' }} />
                                        </div>
                                        <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0, 255, 255, 0.6)' }}>Contact Information</h2>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className={`input-field ${validationErrors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                placeholder="John Doe"
                                            />
                                            {validationErrors.fullName && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`input-field ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                    placeholder="you@example.com"
                                                />
                                                {validationErrors.email && (
                                                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                    Phone Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className={`input-field ${validationErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                    placeholder="+66 XX XXX XXXX"
                                                />
                                                {validationErrors.phone && (
                                                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="saveInfo"
                                                checked={formData.saveInfo}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label className="ml-2 text-sm text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                Save this information for next time
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="btn-primary px-8"
                                        >
                                            Continue to Shipping
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Shipping Address */}
                            {currentStep === 2 && (
                                <div className="card p-6 md:p-8 animate-fade-in bg-gray-900/50 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-10 h-10 corner-clip-sm bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center border-2 border-cyan-500/50" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)' }}>
                                            <MapPin className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))' }} />
                                        </div>
                                        <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0, 255, 255, 0.6)' }}>Shipping Address</h2>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                Street Address *
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className={`input-field ${validationErrors.address ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                placeholder="123 Main Street, Apt 4B"
                                            />
                                            {validationErrors.address && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className={`input-field ${validationErrors.city ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                    placeholder="Bangkok"
                                                />
                                                {validationErrors.city && (
                                                    <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                    State / Province *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    className={`input-field ${validationErrors.state ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                    placeholder="Bangkok"
                                                />
                                                {validationErrors.state && (
                                                    <p className="mt-1 text-sm text-red-600">{validationErrors.state}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                    ZIP / Postal Code *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="zipCode"
                                                    value={formData.zipCode}
                                                    onChange={handleInputChange}
                                                    className={`input-field ${validationErrors.zipCode ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                    placeholder="10110"
                                                />
                                                {validationErrors.zipCode && (
                                                    <p className="mt-1 text-sm text-red-600">{validationErrors.zipCode}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                    Country *
                                                </label>
                                                <select
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={handleInputChange}
                                                    className="input-field"
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

                                    <div className="mt-8 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="btn-secondary px-8"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="btn-primary px-8"
                                        >
                                            Continue to Payment
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Step 3: Payment */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="card p-6 md:p-8 bg-gray-900/50 border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-10 h-10 corner-clip-sm bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center border-2 border-cyan-500/50" style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)' }}>
                                            <CreditCard className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))' }} />
                                        </div>
                                        <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0, 255, 255, 0.6)' }}>Payment Information</h2>
                                    </div>

                                    {/* Security Badge */}
                                    <div className="bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 border-2 border-cyan-500/30 corner-clip-sm p-5 mb-6" style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)' }}>
                                        <div className="flex items-start space-x-3">
                                            <ShieldCheck className="w-6 h-6 text-cyan-400 mt-0.5 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))' }} />
                                            <div>
                                                <p className="text-sm font-black text-cyan-400 mb-1 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                    🔒 Secure Payment Processing
                                                </p>
                                                <p className="text-sm text-gray-300 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                    Your payment information is encrypted with 256-bit SSL security.
                                                    We never store your card details.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stripe Payment Form */}
                                    <StripePaymentForm
                                        amount={total}
                                        currency="thb"
                                        onSuccess={async (paymentIntent) => {
                                            // Prevent duplicate order creation
                                            if (processedPayments.current.has(paymentIntent.id)) {
                                                console.log('Payment already processed:', paymentIntent.id);
                                                return;
                                            }

                                            // Mark this payment as processed
                                            processedPayments.current.add(paymentIntent.id);

                                            try {
                                                // First, update product stock quantities using transactions
                                                const stockUpdatePromises = cartItems.map(async (item) => {
                                                    const productRef = doc(db, 'products', item.id);

                                                    try {
                                                        await runTransaction(db, async (transaction) => {
                                                            const productDoc = await transaction.get(productRef);

                                                            if (!productDoc.exists()) {
                                                                console.warn(`Product ${item.name} not found in database`);
                                                                return;
                                                            }

                                                            const currentStock = productDoc.data().stock || 0;
                                                            const newStock = currentStock - item.quantity;

                                                            if (newStock < 0) {
                                                                console.warn(`Insufficient stock for ${item.name}. Current: ${currentStock}, Requested: ${item.quantity}`);
                                                                return;
                                                            }

                                                            transaction.update(productRef, {
                                                                stock: newStock,
                                                                updatedAt: new Date()
                                                            });
                                                        });
                                                    } catch (error) {
                                                        console.error(`Error updating stock for ${item.name}:`, error);
                                                        // Don't throw - we want order to save even if stock update fails
                                                    }
                                                });

                                                // Wait for all stock updates to complete
                                                await Promise.all(stockUpdatePromises);

                                                // Save order to Firestore
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
                                                        category: item.category
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
                                                    paymentIntentId: paymentIntent.id,
                                                    paymentStatus: 'paid',
                                                    orderStatus: 'processing',
                                                    createdAt: serverTimestamp(),
                                                };

                                                const orderRef = await addDoc(collection(db, 'orders'), orderData);

                                                // Log new order to activity feed
                                                await logActivity({
                                                    type: 'order',
                                                    icon: 'ShoppingCart',
                                                    title: 'New Order Placed',
                                                    description: `${formData.fullName} placed order #${orderRef.id.slice(0, 8).toUpperCase()} · ฿${total.toFixed(2)}`,
                                                    color: 'cyan'
                                                });

                                                // Clear cart and redirect
                                                clearCart();
                                                navigate('/order-success', {
                                                    state: {
                                                        orderId: orderRef.id,
                                                        orderTotal: total
                                                    }
                                                });
                                            } catch (error) {
                                                console.error('Error saving order:', error);
                                                setError('Payment successful but order save failed. Please contact support with payment ID: ' + paymentIntent.id);
                                                // Remove from processed set if order creation failed
                                                processedPayments.current.delete(paymentIntent.id);
                                            }
                                        }}
                                        onError={(error) => {
                                            setError(error);
                                        }}
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-900/20 border-2 border-red-500/50 corner-clip-sm text-red-400 text-sm animate-fade-in font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)' }}>
                                        {error}
                                    </div>
                                )}

                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="btn-secondary px-8"
                                    >
                                        ← Back to Shipping
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary - Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 corner-clip-lg overflow-hidden sticky top-24 animate-fade-in border-2 border-cyan-500/30" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)' }}>
                            {/* Header with Gradient */}
                            <div className="bg-gradient-to-r from-cyan-600 to-magenta-600 p-5">
                                <h2 className="text-xl font-black text-white flex items-center space-x-2 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(255, 255, 255, 0.5)' }}>
                                    <Package className="w-6 h-6" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))' }} />
                                    <span>Order Summary</span>
                                </h2>
                            </div>

                            <div className="p-6">
                                {/* Cart Items */}
                                <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="bg-gray-800/50 border border-cyan-500/30 corner-clip-sm p-3 hover:border-cyan-500/60 transition-all duration-200">
                                            <div className="flex space-x-3">
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-20 h-20 object-cover corner-clip-sm"
                                                    />
                                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 text-white text-xs font-black corner-clip-sm flex items-center justify-center" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)', fontFamily: 'Rajdhani, sans-serif' }}>
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h4 className="font-black text-white text-sm mb-1 line-clamp-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.name}</h4>
                                                    <p className="text-xs text-gray-400 mb-2 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.category}</p>
                                                    <p className="text-lg font-black text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                        ฿{((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing Breakdown */}
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

                                {/* Total Section */}
                                <div className="mt-4 bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 -mx-6 px-6 py-5 border-t border-cyan-500/50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-black text-cyan-400 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>Total</span>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-gradient" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>
                                                ฿{total.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                Including VAT
                                            </div>
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
