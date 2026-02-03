# Admin Panel Setup Guide

## 🔐 How to Set Up Admin Access

The admin panel is protected and only accessible to users with `isAdmin: true` in their user document.

### Step 1: Create an Account

1. **Sign up for an account** on your website (http://localhost:5173/login)
2. Use either email/password or Google sign-in
3. A user document will be automatically created in Firestore with `isAdmin: false`

### Step 2: Make Yourself an Admin

#### Option A: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`shipshop-2026`)
3. Navigate to **Firestore Database**
4. Open the **`users`** collection
5. Find your user document (it will have your UID as the document ID)
6. Click on the document
7. Find the `isAdmin` field
8. Click **Edit field**
9. Change the value from `false` to `true`
10. Click **Update**

#### Option B: Quick Method - Firebase Console

1. Go to Firestore Database
2. Navigate to `users` collection
3. Find your user document (UID from Firebase Authentication)
4. Edit the document:
   ```
   isAdmin: false  →  Change to  →  isAdmin: true
   ```

### Step 3: Access Admin Panel

1. **Log out** and **log back in** (important for the change to take effect)
2. Navigate to `/admin` - you'll see the admin login page
3. Sign in with your credentials
4. You'll be redirected to `/admin/dashboard`
5. You should now see the Admin Dashboard with product management!

## 📊 User Document Structure

When a user signs up, a document is automatically created in the `users` collection:

```javascript
{
  email: "user@example.com",
  isAdmin: false,  // Change this to true for admin access
  createdAt: Timestamp,
  displayName: "User Name" or null,
  photoURL: "https://..." or null
}
```

## 📊 Admin Dashboard Features

### Product Management (CRUD Operations)

✅ **Create** - Add new products with:
- Product name
- Description
- Price
- Discount percentage
- Image URL
- Category
- Rating
- Reviews count
- Stock quantity

✅ **Read** - View all products in a table format with:
- Product image
- Name and description
- Category
- Price and discount
- Stock levels

✅ **Update** - Edit existing products by clicking the edit icon

✅ **Delete** - Remove products by clicking the delete icon (with confirmation)

## 🎯 How to Add Products

### Method 1: Using Admin Dashboard (Recommended)

1. Go to `/admin`
2. Click **"Add Product"** button
3. Fill in the form:
   - **Required fields**: Name, Category, Description, Price, Image URL
   - **Optional fields**: Discount, Rating, Reviews, Stock
4. Click **"Add Product"**
5. Product will appear immediately in your store!

### Method 2: Using Firebase Console

1. Go to Firestore Database
2. Navigate to `products` collection
3. Click **"Add document"**
4. Add fields manually:

```javascript
{
  name: "Product Name",
  description: "Product description",
  price: 99.99,
  discount: 10,  // optional
  image: "https://example.com/image.jpg",
  category: "Electronics",  // Electronics, Fashion, Sports, Home, or Books
  rating: 4.5,  // optional
  reviews: 100,  // optional
  stock: 50  // optional
}
```

## 🖼️ Image URLs

For product images, you can use:

1. **Unsplash** (free stock photos):
   - Go to https://unsplash.com
   - Search for your product
   - Right-click image → "Copy image address"
   - Use URL like: `https://images.unsplash.com/photo-xxxxx?w=500&h=500&fit=crop`

2. **Your own hosting**:
   - Upload to Firebase Storage
   - Use any image hosting service
   - Use direct URLs from your CDN

## 🔒 Security Rules

Make sure your Firestore security rules allow admins to write to the products collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admins collection - only readable by authenticated users
    match /admins/{userId} {
      allow read: if request.auth != null;
      allow write: if false; // Manually manage admins
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true; // Anyone can read products
      allow write: if request.auth != null && 
                      exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
                      get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

## 📝 Sample Products to Get Started

Here are some sample products you can add:

### Electronics
```javascript
{
  name: "Wireless Earbuds Pro",
  description: "Premium sound quality with active noise cancellation",
  price: 149.99,
  discount: 15,
  image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop",
  category: "Electronics",
  rating: 4.7,
  reviews: 234,
  stock: 45
}
```

### Fashion
```javascript
{
  name: "Classic Leather Jacket",
  description: "Genuine leather with modern fit",
  price: 299.99,
  image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
  category: "Fashion",
  rating: 4.8,
  reviews: 156,
  stock: 20
}
```

### Sports
```javascript
{
  name: "Professional Yoga Mat",
  description: "Non-slip, eco-friendly, perfect for all exercises",
  price: 49.99,
  discount: 20,
  image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop",
  category: "Sports",
  rating: 4.6,
  reviews: 89,
  stock: 100
}
```

## 🚨 Troubleshooting

### "Access Denied" when trying to access /admin
- Make sure you're logged in
- Verify your user ID is in the `admins` collection in Firestore
- Check that `isAdmin` is set to `true`
- Try logging out and logging back in

### Products not showing up
- Check Firestore console to verify products exist
- Check browser console for errors
- Verify Firestore security rules allow reading products

### Can't add/edit/delete products
- Verify you're marked as admin in Firestore
- Check Firestore security rules
- Look for errors in browser console

## 🎨 Categories

Available categories:
- Electronics
- Fashion
- Sports
- Home
- Books

You can add more categories by editing `src/pages/AdminDashboard.jsx` and `src/pages/Products.jsx`

## 📱 Mobile Support

The admin dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

---

## Quick Start Checklist

- [ ] Create an account on your website
- [ ] Get your User ID from Firebase Authentication
- [ ] Add your UID to `admins` collection in Firestore
- [ ] Set `isAdmin: true`
- [ ] Log out and log back in
- [ ] Access `/admin` route
- [ ] Add your first product!

---

**Need Help?** Check the browser console for error messages or review the Firestore security rules.
