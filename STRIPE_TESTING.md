# 🧪 How to Test Stripe Payments

## Quick Test Guide

### Step 1: Make Sure Both Servers Are Running

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Should be running on: http://localhost:5173

**Terminal 2 - Backend:**
```bash
cd server
npm start
```
Should be running on: http://localhost:3001

### Step 2: Add Items to Cart

1. Go to http://localhost:5173
2. Browse products
3. Click "Add to Cart" on any product
4. Click the cart icon (top right) to view cart
5. Click "Proceed to Checkout"

### Step 3: Fill Out Checkout Form

**Step 1 - Information:**
- Full Name: `John Doe`
- Email: `test@example.com`
- Phone: `0812345678`
- Click "Continue to Shipping"

**Step 2 - Shipping:**
- Address: `123 Test Street`
- City: `Bangkok`
- State/Province: `Bangkok`
- ZIP Code: `10110`
- Country: `Thailand`
- Click "Continue to Payment"

### Step 4: Enter Test Card Details

**✅ Successful Payment:**
```
Card Number:    4242 4242 4242 4242
Expiry Date:    12/34 (any future date)
CVC:            123 (any 3 digits)
Cardholder:     Test User
```

**❌ Card Declined:**
```
Card Number:    4000 0000 0000 0002
Expiry Date:    12/34
CVC:            123
```

**🔐 Requires 3D Secure Authentication:**
```
Card Number:    4000 0027 6000 3184
Expiry Date:    12/34
CVC:            123
```
*Note: You'll see an authentication popup - click "Complete" to succeed or "Fail" to test failure*

**💳 Insufficient Funds:**
```
Card Number:    4000 0000 0000 9995
Expiry Date:    12/34
CVC:            123
```

### Step 5: Complete Payment

1. Click the "Pay ฿XXX.XX" button
2. Wait for processing (you'll see a spinner)
3. If successful:
   - You'll be redirected to `/order-success`
   - Cart will be cleared
   - Order will be saved to Firestore
4. If failed:
   - Error message will appear
   - You can try again

## 🎯 What to Test

### ✅ Success Scenarios
- [ ] Payment with basic card (4242...)
- [ ] Payment with 3D Secure card (4000 0027...)
- [ ] Different order amounts
- [ ] Guest checkout (not logged in)
- [ ] Logged-in user checkout

### ❌ Failure Scenarios
- [ ] Declined card (4000 0000 0002)
- [ ] Insufficient funds (4000 0000 9995)
- [ ] Invalid card number
- [ ] Expired card
- [ ] Invalid CVC
- [ ] Empty form fields

### 🔍 Edge Cases
- [ ] Very small amount (฿1.00)
- [ ] Very large amount (฿999,999.00)
- [ ] Free shipping threshold (฿1,500+)
- [ ] Multiple items in cart
- [ ] Single item in cart

## 📊 Verify Payment in Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/payments
2. You should see your test payment listed
3. Click on it to see details:
   - Amount
   - Status (Succeeded/Failed)
   - Customer email
   - Payment method

## 🔍 Verify Order in Firestore

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `shipshop-2026`
3. Go to Firestore Database
4. Look for the `orders` collection
5. You should see your order with:
   - Order ID
   - User info
   - Items
   - Payment status
   - Timestamp

## 🐛 Troubleshooting

### "Payment Setup Error"
**Problem:** Backend not running or can't connect
**Solution:**
```bash
cd server
npm start
```
Check that you see: `✅ Payment server running on port 3001`

### "Invalid API Key"
**Problem:** Stripe keys not configured
**Solution:**
1. Check `.env` file has correct keys
2. Restart both servers
3. Verify keys at https://dashboard.stripe.com/test/apikeys

### "CORS Error"
**Problem:** Frontend can't connect to backend
**Solution:**
- Make sure backend is running on port 3001
- Frontend should be on port 5173
- Check browser console for exact error

### Payment Stuck on "Processing"
**Problem:** Network issue or server error
**Solution:**
1. Check browser console (F12)
2. Check server terminal for errors
3. Verify internet connection
4. Try refreshing the page

### Payment Succeeds but No Redirect
**Problem:** Navigation issue
**Solution:**
- Check browser console for errors
- Verify `/order-success` route exists in App.jsx
- Check that `clearCart()` is working

## 📝 Test Checklist

Before going live, test these scenarios:

- [ ] ✅ Successful payment with test card
- [ ] ❌ Failed payment shows error message
- [ ] 🔐 3D Secure authentication works
- [ ] 💾 Order saved to Firestore correctly
- [ ] 🛒 Cart cleared after successful payment
- [ ] 📧 User receives confirmation (if email setup)
- [ ] 📱 Works on mobile devices
- [ ] 🌐 Works on different browsers
- [ ] 🔄 Can make multiple purchases
- [ ] 🚫 Can't submit empty form

## 🎬 Quick Test Flow (30 seconds)

1. **Add to cart** → Click any product → "Add to Cart"
2. **Checkout** → Cart icon → "Proceed to Checkout"
3. **Fill form** → Use test data above
4. **Pay** → Card: `4242 4242 4242 4242`, Expiry: `12/34`, CVC: `123`
5. **Success!** → Should redirect to order success page

## 📚 More Test Cards

Visit Stripe's official test card list:
https://stripe.com/docs/testing#cards

### International Cards
- **Visa (US):** 4242 4242 4242 4242
- **Visa (Debit):** 4000 0566 5566 5556
- **Mastercard:** 5555 5555 5555 4444
- **American Express:** 3782 822463 10005
- **Discover:** 6011 1111 1111 1117

### Special Scenarios
- **Charge succeeds, card brand unsupported:** 4000 0000 0000 0010
- **Charge succeeds, risk level elevated:** 4000 0000 0000 4954
- **Charge succeeds, funds not immediately available:** 4000 0000 0000 9235

## 🎉 Success Indicators

You'll know the payment worked when:
1. ✅ "Processing Payment..." appears briefly
2. ✅ Page redirects to `/order-success`
3. ✅ Cart badge shows 0 items
4. ✅ Order appears in Firestore
5. ✅ Payment appears in Stripe Dashboard

## 🚀 Ready to Test!

Just follow the steps above and you'll be testing payments like a pro! 

**Remember:** You're using **test mode** - no real money is charged! 💰
