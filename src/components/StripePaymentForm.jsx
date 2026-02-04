import { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Payment Form Component
const CheckoutForm = ({ amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [paymentSucceeded, setPaymentSucceeded] = useState(false);
    const processingRef = useRef(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements || processingRef.current || paymentSucceeded) {
            return;
        }

        processingRef.current = true;
        setLoading(true);
        setErrorMessage('');

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (error) {
                setErrorMessage(error.message);
                onError(error.message);
                processingRef.current = false;
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                setPaymentSucceeded(true);
                onSuccess(paymentIntent);
                // Don't reset processingRef - keep it true to prevent resubmission
            }
        } catch (err) {
            setErrorMessage(err.message);
            onError(err.message);
            processingRef.current = false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Element */}
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <PaymentElement />
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={!stripe || loading || paymentSucceeded}
                className={`btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed ${paymentSucceeded ? 'bg-green-600 hover:bg-green-600' : ''
                    }`}
            >
                {paymentSucceeded ? (
                    <span className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Payment Successful!</span>
                    </span>
                ) : loading ? (
                    <span className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Processing Payment...</span>
                    </span>
                ) : (
                    <span className="flex items-center justify-center space-x-2">
                        <Lock className="w-5 h-5" />
                        <span>Pay ฿{amount.toFixed(2)}</span>
                    </span>
                )}
            </button>

            {/* Security Notice */}
            <div className="text-center text-xs text-gray-500">
                <Lock className="w-4 h-4 inline mr-1" />
                Secured by Stripe • Your payment information is encrypted
            </div>
        </form>
    );
};

// Main Stripe Payment Form Component
const StripePaymentForm = ({ amount, currency = 'thb', onSuccess, onError }) => {
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const paymentIntentCreated = useRef(false);

    useEffect(() => {
        // Prevent multiple Payment Intent creations
        if (paymentIntentCreated.current) {
            return;
        }

        // Create PaymentIntent when component mounts
        const createPaymentIntent = async () => {
            try {
                paymentIntentCreated.current = true;

                const response = await fetch('http://localhost:3001/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: amount, // Send amount as-is, backend will convert to smallest unit
                        currency
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to create payment intent');
                }

                const data = await response.json();
                setClientSecret(data.clientSecret);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                if (onError) onError(err.message);
            }
        };

        createPaymentIntent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run once on mount

    // Stripe Elements appearance customization
    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#2563eb',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
        },
        rules: {
            '.Input': {
                border: '2px solid #e5e7eb',
                boxShadow: 'none',
            },
            '.Input:focus': {
                border: '2px solid #3b82f6',
                boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
            },
            '.Label': {
                fontWeight: '600',
                marginBottom: '8px',
            },
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Initializing secure payment...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-900 mb-1">Payment Setup Error</h3>
                        <p className="text-sm text-red-700 mb-3">{error}</p>
                        <p className="text-xs text-red-600">
                            Please make sure your backend is running and the Stripe configuration is correct.
                            See STRIPE_INTEGRATION.md for setup instructions.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {clientSecret && (
                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} />
                </Elements>
            )}
        </div>
    );
};

export default StripePaymentForm;
