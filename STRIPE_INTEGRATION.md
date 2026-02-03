# Stripe Payment Integration Guide

This guide will walk you through integrating Stripe payment processing into your shopping application.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Node.js backend (we'll need to create one for secure payment processing)
3. Stripe API keys (test and live)

## Overview

Stripe integration requires both **frontend** and **backend** components:
- **Frontend**: Collects payment information using Stripe Elements
- **Backend**: Creates payment intents and processes payments securely

## Step 1: Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

⚠️ **IMPORTANT**: Never expose your secret key in the frontend!

## Step 2: Set Up Environment Variables

Create/update your `.env` file in the project root:

```bash
# Frontend (Vite)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Backend (you'll need to create this)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

## Step 3: Install Required Packages

### Frontend (already installed):
```bash
npm install @stripe/stripe-js
```

### Backend (you'll need to install):
```bash
npm install stripe express cors dotenv
```

## Step 4: Create a Backend Server

Since you're using Firebase, you have two options:

### Option A: Firebase Cloud Functions (Recommended for Firebase projects)

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secret_key);
const cors = require('cors')({ origin: true });

exports.createPaymentIntent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { amount, currency = 'thb' } = req.body;

      // Create a PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to smallest currency unit
        currency: currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

exports.createOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { paymentIntentId, orderDetails } = req.body;

      // Verify payment was successful
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Save order to Firestore
        const admin = require('firebase-admin');
        const db = admin.firestore();

        const orderRef = await db.collection('orders').add({
          ...orderDetails,
          paymentIntentId,
          status: 'paid',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json({ success: true, orderId: orderRef.id });
      } else {
        res.status(400).json({ error: 'Payment not successful' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
```

Deploy Firebase Functions:
```bash
firebase deploy --only functions
```

Set Stripe secret key:
```bash
firebase functions:config:set stripe.secret_key="sk_test_your_secret_key"
```

### Option B: Simple Express Server

Create `server/index.js`:

```javascript
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'thb' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Run the server:
```bash
node server/index.js
```

## Step 5: Update Frontend - Create Stripe Payment Component

Create `src/components/StripePaymentForm.jsx`:

```javascript
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary w-full"
      >
        {loading ? 'Processing...' : `Pay ฿${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

const StripePaymentForm = ({ amount, onSuccess, onError }) => {
  const [clientSecret, setClientSecret] = useState('');

  useState(() => {
    // Create PaymentIntent on component mount
    fetch('YOUR_BACKEND_URL/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => onError(err.message));
  }, [amount]);

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

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
```

## Step 6: Install Additional Stripe Package

```bash
npm install @stripe/react-stripe-js
```

## Step 7: Update Checkout Page

Replace the payment placeholder in `src/pages/Checkout.jsx`:

```javascript
import StripePaymentForm from '../components/StripePaymentForm';

// In the Payment step (Step 3), replace the placeholder div with:

<StripePaymentForm
  amount={total}
  onSuccess={async (paymentIntent) => {
    // Save order to Firestore
    const orderData = {
      userId: user.uid,
      items: cartItems,
      total,
      shippingAddress: formData,
      paymentIntentId: paymentIntent.id,
      status: 'paid',
    };

    // Call your backend to save the order
    // Or save directly to Firestore
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: serverTimestamp(),
    });

    clearCart();
    navigate('/order-success', { state: { orderId: orderRef.id } });
  }}
  onError={(error) => {
    setError(error);
  }}
/>
```

## Step 8: Test the Integration

### Test Card Numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

## Step 9: Handle Webhooks (Optional but Recommended)

Stripe webhooks notify your backend about payment events:

```javascript
// In your backend
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update order status in database
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
  }

  res.json({ received: true });
});
```

## Step 10: Go Live

When ready for production:

1. Replace test keys with live keys
2. Test thoroughly with real cards
3. Set up proper error handling
4. Implement receipt emails
5. Add order tracking

## Security Best Practices

✅ **DO:**
- Always process payments on the backend
- Use HTTPS in production
- Validate all inputs
- Store minimal payment data
- Use Stripe's PCI-compliant elements

❌ **DON'T:**
- Never store card numbers
- Never expose secret keys
- Don't skip backend validation
- Don't trust client-side data

## Troubleshooting

### Common Issues:

1. **"Stripe is not defined"**
   - Make sure you've loaded Stripe.js
   - Check your publishable key

2. **CORS errors**
   - Add CORS middleware to your backend
   - Whitelist your frontend URL

3. **Payment fails silently**
   - Check browser console for errors
   - Verify backend is running
   - Check API keys are correct

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)

## Need Help?

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Support: https://support.stripe.com
- Stripe Discord: https://discord.gg/stripe
