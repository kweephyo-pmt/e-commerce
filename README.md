# Modern E-Commerce Application

A full-featured, modern e-commerce web application built with React, Vite, Firebase, and Tailwind CSS. It features a responsive design, secure authentication, real-time data, and a payment processing server using Stripe.

## 🚀 Features

### User Features
- **🛍️ Product Browsing:** View products with detailed descriptions, images, and user ratings.
- **🛒 Smart Cart:** Add items, adjust quantities, and see real-time totals.
- **💳 Secure Checkout:** Integrated Stripe payment processing for secure transactions.
- **👤 User Profiles:** Manage personal information (auto-filled at checkout) and view order history.
- **⭐ Reviews & Ratings:** Rate products and write reviews.
- **🔐 Authentication:** Secure sign-up and login using Firebase Auth.

### Admin Dashboard
- **📊 Overview:** Visual dashboard tracking total sales, orders, and user stats.
- **📦 Product Management:** Create, edit, and delete products with image uploads (Cloudinary).
- **🚚 Order Management:** Track order status (Processing, Shipped, Delivered) in real-time.
- **👥 Customer Management:** View and manage registered users.
- **⚙️ Settings:** Configure store settings and manage admin access.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Context API
- **Routing:** React Router DOM
- **Backend-as-a-Service:** Firebase (Auth, Firestore)
- **Payments:** Stripe Elements

### Backend (Payment Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Payments:** Stripe API
- **Utilities:** Dotenv, CORS

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Firebase Account
- Stripe Account
- Cloudinary Account (for image uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/shopping-app.git
cd shopping-app
```

### 2. Frontend Setup
Navigate to the root directory and install dependencies:
```bash
npm install
```

Create a `.env` file in the root directory with your Firebase config:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Start the frontend development server:
```bash
npm run dev
```

### 3. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=4242
```

Start the backend server:
```bash
npm start
# OR for development with nodemon
npm run dev
```

## 📂 Project Structure

```
├── src/
│   ├── components/    # Reusable UI components (Navbar, Cards, etc.)
│   ├── context/       # Global state (Auth, Cart)
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Application pages (Home, Checkout, Admin, etc.)
│   ├── config/        # Firebase configuration
│   └── App.jsx        # Main application entry
├── server/            # Node.js Express server for Stripe
└── public/            # Static assets
```

## 🔒 Security
- **Firebase Security Rules** are configured to protect user data and ensure only admins can modify product catalog/orders.
- **Stripe** handles all sensitive payment information; no card data is stored on our servers.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the ISC License.
