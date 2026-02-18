import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    CheckCircle, Package, Truck, Home, ShoppingBag,
    Banknote, Clock, Shield, Zap, ArrowRight, Mail, AlertCircle, XCircle
} from 'lucide-react';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, orderTotal: initialTotal, paymentMethod: initialMethod } = location.state || {};

    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    const orderTotal = orderData?.total ?? initialTotal;
    const isBankTransfer = (orderData?.paymentMethod || initialMethod) === 'bank_transfer';
    const orderStatus = orderData?.orderStatus || 'processing';
    const paymentStatus = orderData?.paymentStatus || 'pending';
    const paymentConfirmed = paymentStatus === 'paid';

    useEffect(() => {
        if (!orderId) {
            navigate('/');
            return;
        }

        const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
            if (snapshot.exists()) {
                setOrderData(snapshot.data());
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [orderId, navigate]);

    if (!orderId) return null;

    // Steps differ based on payment method
    const baseSteps = isBankTransfer
        ? [
            {
                key: 'verification',
                num: 1,
                icon: Banknote,
                title: 'Payment Verification',
                desc: 'Our team will verify your bank transfer slip within 1–2 business hours.',
                color: 'yellow',
                glow: 'rgba(234,179,8,0.5)',
                border: 'border-yellow-500/50',
                bg: 'from-yellow-500 to-orange-500',
                textColor: 'text-yellow-400',
            },
            {
                key: 'processing',
                num: 2,
                icon: Package,
                title: 'Order Processing',
                desc: 'Once payment is confirmed, your gear will be prepared for deployment.',
                color: 'cyan',
                glow: 'rgba(0,255,255,0.4)',
                border: 'border-cyan-500/30',
                bg: 'from-gray-600 to-gray-700',
                textColor: 'text-gray-400',
            },
            {
                key: 'shipping',
                num: 3,
                icon: Truck,
                title: 'Shipping',
                desc: 'Tracking code dispatched within 24 hours of processing.',
                color: 'cyan',
                glow: 'rgba(0,255,255,0.4)',
                border: 'border-cyan-500/30',
                bg: 'from-gray-600 to-gray-700',
                textColor: 'text-gray-400',
            },
            {
                key: 'delivery',
                num: 4,
                icon: CheckCircle,
                title: 'Delivery',
                desc: 'ETA: 3–5 business days.',
                color: 'cyan',
                glow: 'rgba(0,255,255,0.4)',
                border: 'border-cyan-500/30',
                bg: 'from-gray-600 to-gray-700',
                textColor: 'text-gray-400',
            },
        ]
        : [
            {
                key: 'processing',
                num: 1,
                icon: Package,
                title: 'Order Processing',
                desc: 'Preparing your gear for deployment.',
                color: 'cyan',
                glow: 'rgba(0,255,255,0.5)',
                border: 'border-cyan-500/50',
                bg: 'from-cyan-500 to-blue-500',
                textColor: 'text-cyan-400',
            },
            {
                key: 'shipping',
                num: 2,
                icon: Truck,
                title: 'Shipping Confirmation',
                desc: 'Tracking code incoming within 24 hours.',
                color: 'cyan',
                glow: 'rgba(0,255,255,0.4)',
                border: 'border-cyan-500/30',
                bg: 'from-gray-600 to-gray-700',
                textColor: 'text-gray-400',
            },
            {
                key: 'delivery',
                num: 3,
                icon: CheckCircle,
                title: 'Delivery',
                desc: 'ETA: 3–5 business days.',
                color: 'cyan',
                glow: 'rgba(0,255,255,0.4)',
                border: 'border-cyan-500/30',
                bg: 'from-gray-600 to-gray-700',
                textColor: 'text-gray-400',
            },
        ];

    // Calculate active step index
    const getActiveIndex = () => {
        if (orderStatus === 'cancelled' || paymentStatus === 'rejected') return -1;
        if (orderStatus === 'delivered') return isBankTransfer ? 3 : 2;
        if (orderStatus === 'shipped') return isBankTransfer ? 2 : 1;
        if (orderStatus === 'processing') {
            // For bank transfer: if payment confirmed, move to step 1 (Order Processing)
            if (isBankTransfer) return paymentConfirmed ? 1 : 0;
            return 0;
        }
        return 0;
    };

    const activeIndex = getActiveIndex();
    const steps = baseSteps.map((step, idx) => ({
        ...step,
        active: idx === activeIndex,
        completed: idx < activeIndex,
        // Update styling for completed steps
        bg: idx < activeIndex ? 'from-green-500 to-emerald-600' : idx === activeIndex ? step.bg : 'from-gray-700 to-gray-800',
        border: idx < activeIndex ? 'border-green-400/50' : idx === activeIndex ? step.border : 'border-gray-700',
        textColor: idx < activeIndex ? 'text-green-400' : idx === activeIndex ? step.textColor : 'text-gray-500',
        glow: idx < activeIndex ? 'rgba(34,197,94,0.4)' : step.glow
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f172a] to-[#1a1f3a] py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">

            {loading && (
                <div className="fixed inset-0 z-50 bg-[#0a0e27]/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            )}

            {/* Ambient background glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
                    style={{ background: isBankTransfer ? 'radial-gradient(circle, rgba(234,179,8,1) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,255,255,1) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5"
                    style={{ background: 'radial-gradient(circle, rgba(255,0,255,1) 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">

                {/* ── Hero icon + title ─────────────────────────────────── */}
                <div className="text-center mb-10 sm:mb-12 animate-fade-in">

                    {/* Icon */}
                    <div className="relative inline-flex items-center justify-center mb-8">
                        {/* Outer ping rings */}
                        <div className="absolute w-40 h-40 corner-clip border-2 animate-ping opacity-20"
                            style={{ borderColor: isBankTransfer ? 'rgba(234,179,8,0.8)' : 'rgba(0,255,255,0.8)', animationDuration: '2s' }} />
                        <div className="absolute w-32 h-32 corner-clip border-2 animate-ping opacity-30"
                            style={{ borderColor: isBankTransfer ? 'rgba(234,179,8,0.8)' : 'rgba(0,255,255,0.8)', animationDuration: '2s', animationDelay: '0.4s' }} />

                        {/* Main icon box */}
                        <div className="relative w-28 h-28 corner-clip flex items-center justify-center border-2"
                            style={{
                                background: paymentStatus === 'rejected'
                                    ? 'linear-gradient(135deg, rgba(239,68,68,0.3) 0%, rgba(153,27,27,0.2) 100%)'
                                    : isBankTransfer
                                        ? 'linear-gradient(135deg, rgba(234,179,8,0.3) 0%, rgba(249,115,22,0.2) 100%)'
                                        : 'linear-gradient(135deg, rgba(0,255,255,0.3) 0%, rgba(0,200,100,0.2) 100%)',
                                borderColor: paymentStatus === 'rejected' ? 'rgba(239,68,68,0.6)' : isBankTransfer ? 'rgba(234,179,8,0.6)' : 'rgba(0,255,255,0.6)',
                                boxShadow: paymentStatus === 'rejected'
                                    ? '0 0 60px rgba(239,68,68,0.5), inset 0 0 30px rgba(239,68,68,0.1)'
                                    : isBankTransfer
                                        ? '0 0 60px rgba(234,179,8,0.5), inset 0 0 30px rgba(234,179,8,0.1)'
                                        : '0 0 60px rgba(0,255,255,0.5), inset 0 0 30px rgba(0,255,255,0.1)',
                            }}>
                            {paymentStatus === 'rejected'
                                ? <XCircle className="w-14 h-14 text-red-500" style={{ filter: 'drop-shadow(0 0 12px rgba(239,68,68,1))' }} />
                                : paymentConfirmed
                                    ? <CheckCircle className="w-14 h-14 text-green-400" style={{ filter: 'drop-shadow(0 0 12px rgba(34,197,94,1))' }} />
                                    : isBankTransfer
                                        ? <Clock className="w-14 h-14 text-yellow-400" style={{ filter: 'drop-shadow(0 0 12px rgba(234,179,8,1))' }} />
                                        : <CheckCircle className="w-14 h-14 text-cyan-400" style={{ filter: 'drop-shadow(0 0 12px rgba(0,255,255,1))' }} />
                            }
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 uppercase tracking-wider"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        {paymentStatus === 'rejected' ? (
                            <>
                                <span className="text-red-500"
                                    style={{ textShadow: '0 0 30px rgba(239,68,68,0.9), 0 0 60px rgba(239,68,68,0.4)' }}>
                                    Payment{' '}
                                </span>
                                <span className="text-red-400"
                                    style={{ textShadow: '0 0 30px rgba(239,68,68,0.8)' }}>
                                    Rejected
                                </span>
                            </>
                        ) : paymentConfirmed ? (
                            <>
                                <span className="text-green-400"
                                    style={{ textShadow: '0 0 30px rgba(34,197,94,0.9), 0 0 60px rgba(34,197,94,0.4)' }}>
                                    Payment{' '}
                                </span>
                                <span className="text-emerald-300"
                                    style={{ textShadow: '0 0 30px rgba(52,211,153,0.8)' }}>
                                    Confirmed
                                </span>
                            </>
                        ) : isBankTransfer ? (
                            <>
                                <span className="text-yellow-400"
                                    style={{ textShadow: '0 0 30px rgba(234,179,8,0.9), 0 0 60px rgba(234,179,8,0.4)' }}>
                                    Order{' '}
                                </span>
                                <span className="text-orange-400"
                                    style={{ textShadow: '0 0 30px rgba(249,115,22,0.8)' }}>
                                    Placed
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-cyan-400"
                                    style={{ textShadow: '0 0 30px rgba(0,255,255,0.9), 0 0 60px rgba(0,255,255,0.4)' }}>
                                    Order{' '}
                                </span>
                                <span className="text-gradient"
                                    style={{ textShadow: '0 0 30px rgba(0,255,0,0.6)' }}>
                                    Confirmed
                                </span>
                            </>
                        )}
                    </h1>

                    {/* Subtitle */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 corner-clip-sm border"
                        style={{
                            background: paymentStatus === 'rejected' ? 'rgba(239,68,68,0.08)' : isBankTransfer ? 'rgba(234,179,8,0.08)' : 'rgba(0,255,255,0.08)',
                            borderColor: paymentStatus === 'rejected' ? 'rgba(239,68,68,0.3)' : isBankTransfer ? 'rgba(234,179,8,0.3)' : 'rgba(0,255,255,0.3)',
                            boxShadow: paymentStatus === 'rejected' ? '0 0 20px rgba(239,68,68,0.15)' : isBankTransfer ? '0 0 20px rgba(234,179,8,0.15)' : '0 0 20px rgba(0,255,255,0.15)',
                        }}>
                        {paymentStatus === 'rejected'
                            ? <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            : paymentConfirmed
                                ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                : isBankTransfer
                                    ? <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                    : <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        }
                        <span className="font-black uppercase tracking-widest text-sm"
                            style={{
                                fontFamily: 'Rajdhani, sans-serif',
                                color: paymentStatus === 'rejected' ? '#ef4444' : paymentConfirmed ? '#4ade80' : isBankTransfer ? '#fbbf24' : '#67e8f9',
                                textShadow: paymentStatus === 'rejected' ? '0 0 8px rgba(239,68,68,0.5)' : paymentConfirmed ? '0 0 8px rgba(74,222,128,0.5)' : isBankTransfer ? '0 0 8px rgba(234,179,8,0.5)' : '0 0 8px rgba(0,255,255,0.5)',
                            }}>
                            {paymentStatus === 'rejected'
                                ? 'Action Required: Verification Failed'
                                : paymentConfirmed
                                    ? 'Payment Verified — Order is Being Prepared'
                                    : isBankTransfer
                                        ? 'Awaiting Payment Verification'
                                        : 'Your order is locked in'
                            }
                        </span>
                    </div>
                </div>

                {/* ── Order Details Card ────────────────────────────────── */}
                <div className="bg-gray-900/80 backdrop-blur-sm corner-clip border-2 border-cyan-500/30 relative overflow-hidden mb-6 animate-slide-up"
                    style={{ boxShadow: '0 0 40px rgba(0,255,255,0.15), inset 0 0 30px rgba(0,255,255,0.03)' }}>
                    {/* Scanline */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.5) 2px, rgba(0,255,255,0.5) 4px)' }} />

                    {/* Header */}
                    <div className="px-6 sm:px-8 py-5 border-b-2 border-cyan-500/20 bg-gray-800/40 flex items-center gap-3 relative z-10">
                        <Shield className="w-5 h-5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.8))' }} />
                        <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wide"
                            style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(0,255,255,0.6)' }}>
                            Order Details
                        </h2>
                    </div>

                    <div className="p-6 sm:p-8 space-y-4 relative z-10">

                        {/* Order ID */}
                        <div className="flex items-center justify-between p-4 sm:p-5 bg-cyan-500/5 corner-clip-sm border-2 border-cyan-500/30"
                            style={{ boxShadow: '0 0 15px rgba(0,255,255,0.1)' }}>
                            <div>
                                <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1"
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>Order ID</p>
                                <p className="font-black text-xl text-cyan-400"
                                    style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(0,255,255,0.7)', letterSpacing: '0.1em' }}>
                                    #{orderId.slice(0, 8).toUpperCase()}
                                </p>
                            </div>
                            <div className="w-12 h-12 corner-clip-sm bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center">
                                <Package className="w-6 h-6 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.8))' }} />
                            </div>
                        </div>

                        {/* Total */}
                        {paymentStatus === 'rejected' ? (
                            <div className="p-4 sm:p-5 bg-red-500/5 corner-clip-sm border-2 border-red-500/30"
                                style={{ boxShadow: '0 0 15px rgba(239,68,68,0.1)' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1"
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>Amount Charged</p>
                                        <p className="font-black text-3xl text-red-400"
                                            style={{ textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
                                            ฿0.00
                                        </p>
                                        <p className="text-xs text-gray-500 font-bold mt-1 line-through" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            Original: ฿{orderTotal?.toFixed(2) ?? '—'}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 corner-clip-sm bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                                        <XCircle className="w-6 h-6 text-red-400" style={{ filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.8))' }} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 sm:p-5 bg-magenta-500/5 corner-clip-sm border-2 border-magenta-500/30"
                                style={{ boxShadow: '0 0 15px rgba(255,0,255,0.1)' }}>
                                <div>
                                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Amount</p>
                                    <p className="font-black text-3xl text-gradient"
                                        style={{ textShadow: '0 0 20px rgba(0,255,255,0.5)' }}>
                                        ฿{orderTotal?.toFixed(2) ?? '—'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 corner-clip-sm bg-magenta-500/10 border-2 border-magenta-500/30 flex items-center justify-center">
                                    {isBankTransfer
                                        ? <Banknote className="w-6 h-6 text-magenta-400" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }} />
                                        : <CheckCircle className="w-6 h-6 text-magenta-400" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }} />
                                    }
                                </div>
                            </div>
                        )}

                        {/* Email / Rejection notice */}
                        {paymentStatus === 'rejected' ? (
                            <div className="flex items-start gap-3 p-4 bg-red-500/5 corner-clip-sm border border-red-500/30">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300 font-bold leading-relaxed" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    Your payment slip was rejected. No charges were made. Please contact support or place a new order with a valid payment slip.
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3 bg-gray-800/60 corner-clip-sm border border-gray-700/50">
                                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <p className="text-sm text-gray-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    Confirmation details dispatched to your inbox.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Mission Progress ──────────────────────────────────── */}
                <div className="bg-gray-900/80 backdrop-blur-sm corner-clip border-2 border-magenta-500/30 relative overflow-hidden mb-6 animate-slide-up"
                    style={{ animationDelay: '0.1s', boxShadow: '0 0 40px rgba(255,0,255,0.15), inset 0 0 30px rgba(255,0,255,0.03)' }}>
                    {/* Scanline */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,255,0.5) 2px, rgba(255,0,255,0.5) 4px)' }} />

                    {/* Header */}
                    <div className="px-6 sm:px-8 py-5 border-b-2 border-magenta-500/20 bg-gray-800/40 flex items-center gap-3 relative z-10">
                        <Truck className="w-5 h-5 text-magenta-400" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }} />
                        <h2 className="text-xl font-black text-magenta-400 uppercase tracking-wide"
                            style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(255,0,255,0.6)' }}>
                            Mission Progress
                        </h2>
                    </div>

                    <div className="p-6 sm:p-8 relative z-10">
                        <div className="relative">
                            {/* Vertical connector line */}
                            <div className="absolute left-5 top-10 bottom-10 w-px bg-gradient-to-b from-magenta-500/40 via-cyan-500/20 to-transparent" />

                            <div className="space-y-6">
                                {steps.map((step, idx) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={idx} className="flex items-start gap-4 relative">
                                            {/* Step icon */}
                                            <div className={`flex-shrink-0 w-10 h-10 corner-clip-sm flex items-center justify-center border-2 bg-gradient-to-br ${step.bg} ${step.border} relative z-10`}
                                                style={{ boxShadow: step.active ? `0 0 20px ${step.glow}` : 'none' }}>
                                                <Icon className={`w-5 h-5 ${step.active ? 'text-white' : 'text-gray-500'}`}
                                                    style={{ filter: step.active ? `drop-shadow(0 0 4px rgba(255,255,255,0.8))` : 'none' }} />
                                            </div>

                                            {/* Step content */}
                                            <div className={`flex-1 p-4 corner-clip-sm border ${step.active
                                                ? isBankTransfer && idx === 0
                                                    ? 'bg-yellow-500/5 border-yellow-500/30'
                                                    : 'bg-cyan-500/5 border-cyan-500/30'
                                                : 'bg-gray-800/30 border-gray-700/30'
                                                }`}
                                                style={{ boxShadow: step.active ? `0 0 15px ${step.glow}20` : 'none' }}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`font-black uppercase tracking-wide text-sm ${step.textColor}`}
                                                        style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: step.active ? `0 0 8px ${step.glow}` : 'none' }}>
                                                        {step.title}
                                                    </h4>
                                                    {step.active && (
                                                        <span className="px-2 py-0.5 text-xs font-black uppercase corner-clip-sm border"
                                                            style={{
                                                                fontFamily: 'Rajdhani, sans-serif',
                                                                background: isBankTransfer && idx === 0 ? 'rgba(234,179,8,0.15)' : 'rgba(0,255,255,0.15)',
                                                                borderColor: isBankTransfer && idx === 0 ? 'rgba(234,179,8,0.4)' : 'rgba(0,255,255,0.4)',
                                                                color: isBankTransfer && idx === 0 ? '#fbbf24' : '#67e8f9',
                                                            }}>
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                    {step.desc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Action Buttons ────────────────────────────────────── */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <Link to="/orders"
                        className="group flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-wide corner-clip border-2 border-cyan-400/60 hover:from-cyan-400 hover:to-blue-500 transition-all"
                        style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 25px rgba(0,255,255,0.35)' }}>
                        <Package className="w-5 h-5" />
                        <span>View My Orders</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/products"
                        className="group flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-gray-200 font-black uppercase tracking-wide corner-clip border-2 border-gray-600/60 hover:bg-gray-700 hover:border-gray-500 transition-all"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        <ShoppingBag className="w-5 h-5" />
                        <span>Continue Shopping</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* ── Back to Home ──────────────────────────────────────── */}
                <div className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <Link to="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-all duration-200 font-bold uppercase tracking-wide px-4 py-2 corner-clip-sm hover:bg-cyan-500/10 border-2 border-transparent hover:border-cyan-500/30"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        <Home className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default OrderSuccess;
