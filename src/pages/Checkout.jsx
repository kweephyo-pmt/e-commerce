import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Lock, MapPin, User as UserIcon, Package, CheckCircle, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';
import StripePaymentForm from '../components/StripePaymentForm';

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
        <div className="min-h-screen py-8 md:py-12 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <Link
                        to="/cart"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Cart</span>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Secure <span className="text-gradient">Checkout</span>
                    </h1>
                    <p className="text-gray-600">Complete your order in just a few steps</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 md:mb-12 animate-fade-in">
                    <div className="card p-6 md:p-8">
                        <div className="flex items-center justify-between relative">
                            {/* Progress Line */}
                            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                                />
                            </div>

                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <div key={step.id} className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${isCompleted
                                                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-110'
                                                : isActive
                                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110 ring-4 ring-blue-100'
                                                    : 'bg-gray-200 text-gray-500'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle className="w-6 h-6" />
                                            ) : (
                                                <Icon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <span className={`text-xs md:text-sm font-semibold text-center ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                            }`}>
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
                                <div className="card p-6 md:p-8 animate-fade-in">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                            <UserIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Contact Information</h2>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                            <label className="ml-2 text-sm text-gray-700">
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
                                <div className="card p-6 md:p-8 animate-fade-in">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Shipping Address</h2>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
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

                                        {/* Shipping Info */}
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mt-6">
                                            <div className="flex items-start space-x-3">
                                                <Truck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-semibold text-green-900 mb-1">
                                                        {shipping === 0 ? 'Free Shipping!' : 'Standard Shipping'}
                                                    </p>
                                                    <p className="text-sm text-green-700">
                                                        {shipping === 0
                                                            ? 'Your order qualifies for free shipping!'
                                                            : `Add ฿${(1500 - subtotal).toFixed(2)} more for free shipping`
                                                        }
                                                    </p>
                                                    <p className="text-xs text-green-600 mt-1">
                                                        Estimated delivery: 3-5 business days
                                                    </p>
                                                </div>
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
                                <div className="card p-6 md:p-8">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Payment Information</h2>
                                    </div>

                                    {/* Security Badge */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
                                        <div className="flex items-start space-x-3">
                                            <ShieldCheck className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-blue-900 mb-1">
                                                    🔒 Secure Payment Processing
                                                </p>
                                                <p className="text-sm text-blue-700">
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
                                            }
                                        }}
                                        onError={(error) => {
                                            setError(error);
                                        }}
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fade-in">
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
                        <div className="bg-white rounded-2xl overflow-hidden sticky top-24 animate-fade-in shadow-xl">
                            {/* Header with Gradient */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
                                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                                    <Package className="w-6 h-6" />
                                    <span>Order Summary</span>
                                </h2>
                            </div>

                            <div className="p-6">
                                {/* Cart Items */}
                                <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all duration-200">
                                            <div className="flex space-x-3">
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{item.name}</h4>
                                                    <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                                                    <p className="text-lg font-bold text-blue-600">
                                                        ฿{((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="space-y-3 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Subtotal</span>
                                        <span className="font-bold text-gray-900">฿{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Shipping</span>
                                        <span className={`font-bold ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                            {shipping === 0 ? 'FREE' : `฿${shipping.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Tax (7% VAT)</span>
                                        <span className="font-bold text-gray-900">฿{tax.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Total Section */}
                                <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 px-6 py-5 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-800">Total</span>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                ฿{total.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
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
