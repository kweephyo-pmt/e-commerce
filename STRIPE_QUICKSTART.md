# 🚀 Quick Start: Stripe Integration

This is a simplified guide to get Stripe payments working quickly. For detailed information, see `STRIPE_INTEGRATION.md`.

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Stripe Keys
1. Go to https://dashboard.stripe.com/register
2. Sign up for a free account
3. Navigate to **Developers** → **API keys**
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Copy your **Secret key** (starts with `sk_test_`)

### Step 2: Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Stripe keys:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
   ```

### Step 3: Install Server Dependencies
```bash
cd server
npm install
cd ..
```

### Step 4: Start the Payment Server
Open a new terminal and run:
```bash
cd server
npm start
```

You should see:
```
✅ Payment server running on port 3001
📍 Health check: http://localhost:3001/health
💳 Stripe integration ready
```

### Step 5: Update Frontend Configuration
Edit `src/components/StripePaymentForm.jsx` and replace:
```javascript
const response = await fetch('YOUR_BACKEND_URL/create-payment-intent', {
```

With:
```javascript
const response = await fetch('http://localhost:3001/create-payment-intent', {
```

### Step 6: Update Checkout Page
Edit `src/pages/Checkout.jsx` and replace the payment placeholder in Step 3 with:

```javascript
import StripePaymentForm from '../components/StripePaymentForm';

// In Step 3 (Payment), replace the placeholder div with:
<StripePaymentForm
  amount={total}
  currency="thb"
  onSuccess={async (paymentIntent) => {
    try {
      // Save order to Firestore
      const orderData = {
        userId: user?.uid,
        userEmail: formData.email,
        userName: formData.fullName,
        items: cartItems,
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
        status: 'paid',
        createdAt: new Date(),
      };

      // Import these at the top of the file
      // import { collection, addDoc } from 'firebase/firestore';
      // import { db } from '../config/firebase';
      
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
      setError('Payment successful but order save failed. Please contact support.');
    }
  }}
  onError={(error) => {
    setError(error);
  }}
/>
```

### Step 7: Test the Integration

1. Make sure both servers are running:
   - Frontend: `npm run dev` (port 5173)
   - Backend: `cd server && npm start` (port 3001)

2. Add items to cart and proceed to checkout

3. Fill in the checkout form and go to payment step

4. Use Stripe test card:
   - **Card Number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/34`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)

5. Click "Pay" and watch the magic happen! ✨

## 🧪 Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0027 6000 3184` | 🔐 Requires 3D Secure |

## 🎯 Running Both Servers

### Option 1: Two Terminals
Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
cd server
npm start
```

### Option 2: Using concurrently (Recommended)
Install concurrently:
```bash
npm install -D concurrently
```

Add to root `package.json` scripts:
```json
"scripts": {
  "dev": "vite",
  "server": "cd server && npm start",
  "dev:all": "concurrently \"npm run dev\" \"npm run server\""
}
```

Then run both with:
```bash
npm run dev:all
```

## ✅ Verification Checklist

- [ ] Stripe account created
- [ ] API keys copied to `.env`
- [ ] Server dependencies installed
- [ ] Payment server running on port 3001
- [ ] Frontend updated with correct backend URL
- [ ] Checkout page updated with StripePaymentForm
- [ ] Test payment successful

## 🐛 Troubleshooting

### "Cannot connect to payment server"
- Make sure the server is running: `cd server && npm start`
- Check the server URL in `StripePaymentForm.jsx`
- Verify port 3001 is not in use

### "Invalid API key"
- Check your `.env` file has the correct keys
- Make sure you're using test keys (pk_test_* and sk_test_*)
- Restart both servers after changing `.env`

### "CORS error"
- The server is configured for `http://localhost:5173`
- If using a different port, update `FRONTEND_URL` in `.env`

### Payment form not showing
- Check browser console for errors
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set
- Make sure `@stripe/react-stripe-js` is installed

## 📚 Next Steps

Once basic integration is working:

1. **Add Webhooks** - Handle payment events reliably
2. **Error Handling** - Improve user feedback
3. **Order Emails** - Send confirmation emails
4. **Receipt Generation** - Create PDF receipts
5. **Go Live** - Switch to live keys for production

## 🆘 Need Help?

- Check `STRIPE_INTEGRATION.md` for detailed docs
- Visit https://stripe.com/docs
- Test in Stripe Dashboard: https://dashboard.stripe.com/test/payments

## 🎉 Success!

If you can complete a test payment, congratulations! Your Stripe integration is working. 

Remember to:
- Never commit `.env` to git
- Use test keys for development
- Switch to live keys only when ready for production
