# Firebase & Stripe Setup Guide

## 🔥 Firebase Setup

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### Step 2: Register Your Web App
1. In your Firebase project, click the **Web icon** (</>) to add a web app
2. Give your app a nickname (e.g., "ShopHub")
3. Click "Register app"

### Step 3: Get Your Configuration
1. After registering, you'll see your Firebase configuration
2. Copy the config values and add them to your `.env` file:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Step 4: Enable Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Enable **Google** sign-in provider
   - Add your support email
   - Add authorized domains (localhost is already included)

### Step 5: Create Firestore Database
1. Go to **Firestore Database** in Firebase Console
2. Click "Create database"
3. Start in **production mode** (we'll add rules later)
4. Choose a location close to your users

### Step 6: Set Firestore Security Rules
Go to **Firestore Database** > **Rules** and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Products collection (read-only for users)
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Only admins should write
    }
  }
}
```

---

## 💳 Stripe Setup

### Step 1: Create a Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Sign up for a free account

### Step 2: Get Your API Keys
1. In Stripe Dashboard, go to **Developers** > **API keys**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Add it to your `.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 3: Test Mode
- By default, you're in **Test mode** (indicated by a toggle in the top-right)
- Use test card numbers for testing:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
  - Any future expiry date and any 3-digit CVC

### Step 4: Backend Integration (Future)
For production, you'll need a backend to:
1. Create payment intents securely
2. Handle webhooks for payment confirmations
3. Store order data in Firestore

Example backend endpoint (Node.js/Express):
```javascript
app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'usd',
  });
  
  res.json({ clientSecret: paymentIntent.client_secret });
});
```

---

## 🚀 Running the Application

After setting up your `.env` file:

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📝 Adding Products to Firestore

You can add products manually in Firebase Console or programmatically:

### Manual Method (Firebase Console):
1. Go to **Firestore Database**
2. Click "Start collection"
3. Collection ID: `products`
4. Add documents with this structure:

```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "discount": 10,
  "image": "https://image-url.com/image.jpg",
  "category": "Electronics",
  "rating": 4.5,
  "reviews": 100,
  "stock": 50
}
```

### Programmatic Method:
Create a script to seed your database with products.

---

## ⚠️ Important Notes

1. **Never commit `.env` to git** - It's already in `.gitignore`
2. **Use test mode** for Stripe until you're ready for production
3. **Set up proper security rules** in Firestore before going live
4. **Add your production domain** to Firebase authorized domains
5. **Implement proper error handling** for production use

---

## 🔒 Security Checklist

- [ ] Firebase security rules configured
- [ ] `.env` file not committed to git
- [ ] Stripe webhook signatures verified (when implementing backend)
- [ ] User input validated on both client and server
- [ ] HTTPS enabled in production
- [ ] CORS properly configured

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
