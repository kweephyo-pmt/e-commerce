# Admin & User Separation Setup Guide

## Overview
This guide explains how to set up proper separation between admin and regular users in your ShipShop application.

## 🔐 Authentication Flow

### **Regular Users (Customers)**
- **Login Page**: `/login`
- **Can access**: Home, Products, Cart, Checkout, Orders
- **Cannot access**: Admin Dashboard
- **Auto-redirect**: If admin tries to log in via customer login, they get an error

### **Admin Users**
- **Login Page**: `/admin`
- **Can access**: Admin Dashboard only
- **Cannot access**: Customer pages
- **Auto-redirect**: If logged in as admin, automatically redirected to `/admin/dashboard`

---

## 📋 Step 1: Deploy Firestore Security Rules

### **Option A: Using Firebase Console (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Copy the contents of `firestore.rules` file
6. Paste into the rules editor
7. Click **Publish**

### **Option B: Using Firebase CLI**

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

---

## 👤 Step 2: Create an Admin User

### **Method 1: Via Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Authentication** → **Users**
4. Click **Add User**
5. Enter admin email and password
6. Copy the **User UID** (you'll need this)
7. Go to **Firestore Database**
8. Click on the `users` collection
9. Click **Add Document**
10. Set Document ID to the **User UID** you copied
11. Add the following fields:
    ```
    email: "admin@example.com"
    isAdmin: true (boolean)
    createdAt: (timestamp) - current time
    displayName: "Admin User"
    ```
12. Click **Save**

### **Method 2: Via Code (After First Sign-Up)**

1. Sign up a regular user account
2. Go to Firestore Database in Firebase Console
3. Find the user document in the `users` collection
4. Edit the document
5. Change `isAdmin` from `false` to `true`
6. Save

---

## 🔄 Step 3: Test the Separation

### **Test Admin Access:**

1. Go to `/admin`
2. Log in with admin credentials
3. ✅ Should redirect to `/admin/dashboard`
4. ✅ Should see all orders from all customers
5. ✅ Should be able to update order statuses
6. ❌ Try going to `/products` - should redirect back to admin dashboard

### **Test Customer Access:**

1. Log out from admin
2. Go to `/login`
3. Try logging in with admin credentials
4. ❌ Should show error: "Admin accounts cannot log in here"
5. Sign up/log in with regular user account
6. ✅ Should access customer pages normally
7. ❌ Try going to `/admin/dashboard` - should redirect to home

---

## 🛡️ Security Rules Explained

### **Orders Collection Rules:**

```javascript
match /orders/{orderId} {
  // Users can read their own orders, admins can read all orders
  allow read: if request.auth != null && 
                 (resource.data.userId == request.auth.uid || isAdmin());
  
  // Users can create their own orders
  allow create: if request.auth != null && 
                   request.resource.data.userId == request.auth.uid;
  
  // Users can update/delete their own orders, admins can update/delete all orders
  allow update, delete: if request.auth != null && 
                           (resource.data.userId == request.auth.uid || isAdmin());
}
```

**What this means:**
- ✅ Customers can only see their own orders
- ✅ Admins can see ALL orders
- ✅ Admins can update order statuses
- ❌ Customers cannot see other customers' orders

---

## 🔍 Troubleshooting

### **"Missing or insufficient permissions" error**

**Problem**: Admin cannot see orders in Admin Dashboard

**Solution**:
1. Make sure Firestore rules are deployed (see Step 1)
2. Verify the admin user has `isAdmin: true` in Firestore
3. Check browser console for specific error messages
4. Try logging out and logging back in

### **Admin can access customer pages**

**Problem**: Admin sees customer pages instead of being redirected

**Solution**:
1. Clear browser cache and cookies
2. Make sure `AuthContext.jsx` is updated with the new code
3. Check that `isAdmin` field exists in the user's Firestore document

### **Customer can access admin pages**

**Problem**: Regular user can access `/admin/dashboard`

**Solution**:
1. Make sure `ProtectedAdminRoute` component is working
2. Verify the user's `isAdmin` field is `false` in Firestore
3. Clear browser cache and try again

---

## 📝 Quick Reference

### **Admin Credentials Setup**
```
Email: admin@yourstore.com
Password: (set your own secure password)
Firestore Document:
  - Collection: users
  - Document ID: (user's UID)
  - Fields:
    - email: "admin@yourstore.com"
    - isAdmin: true
    - createdAt: (timestamp)
    - displayName: "Admin"
```

### **Customer Credentials**
```
Email: customer@example.com
Password: (user sets their own)
Firestore Document:
  - Collection: users
  - Document ID: (user's UID)
  - Fields:
    - email: "customer@example.com"
    - isAdmin: false (automatically set on sign-up)
    - createdAt: (timestamp)
    - displayName: "Customer Name"
```

---

## ✅ Verification Checklist

- [ ] Firestore rules deployed
- [ ] Admin user created with `isAdmin: true`
- [ ] Admin can log in at `/admin`
- [ ] Admin sees all orders in dashboard
- [ ] Admin can update order statuses
- [ ] Admin cannot access customer pages
- [ ] Customer can log in at `/login`
- [ ] Customer can only see their own orders
- [ ] Customer cannot access `/admin/dashboard`
- [ ] Customer cannot log in with admin credentials at `/login`

---

## 🎯 Summary

**Authentication is now separated:**
- **Admins** → `/admin` → Admin Dashboard only
- **Customers** → `/login` → Customer pages only
- **Firestore Rules** → Enforce data access permissions
- **Auto-redirects** → Prevent cross-access

Your application now has proper role-based access control! 🎉
