# ⚡ CyberShop — E-Commerce Platform

A full-featured cyberpunk-themed e-commerce web application built with React, Vite, Firebase, and Stripe. Features a real-time admin dashboard, secure role-based authentication, Cloudinary image uploads, and a Node.js payment server.

---

## ✨ Features

### 🛍️ Customer-Facing
- **Product Browsing** — Filter by category, price range, and star rating via a dynamic sidebar
- **Product Details** — Image gallery, stock status, reviews & ratings
- **Smart Cart** — Add/remove items, adjust quantities, real-time totals
- **Secure Checkout** — Multi-step checkout with Stripe payment integration
- **Order History** — Real-time order tracking with status updates (Processing → Shipped → Delivered)
- **User Profile** — Manage personal info, shipping address (auto-filled at checkout)
- **Reviews & Ratings** — Leave and view product reviews
- **Authentication** — Email/password and Google sign-in via Firebase Auth

### 🛡️ Admin Dashboard
- **Overview Dashboard** — Live stats: total sales, orders, products, and recent activity feed
- **Product Management** — Full CRUD with Cloudinary image uploads and category assignment
- **Order Management** — Real-time order list, update statuses, view full shipping address
- **Customer Management** — View all non-admin users, order counts, and total spend
- **Category Management** — Create, edit, and delete product categories
- **Settings & Access Control** — Grant or revoke admin access per user (cannot self-revoke)
- **Activity Log** — Real-time feed of all admin and customer actions (orders, product changes, etc.)
- **Separate Admin Login** — Admins and customers use completely separate login flows

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & build tool |
| Tailwind CSS | Utility-first styling |
| Lucide React | Icon library |
| React Context API | Auth, Cart global state |
| React Router DOM | Client-side routing |
| Firebase Auth | Authentication |
| Firebase Firestore | Real-time database |
| Stripe Elements | Payment UI |
| Cloudinary | Product image hosting & uploads |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Payment server |
| Stripe API | Payment intent creation |
| dotenv + CORS | Config & security |

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v16+
- Firebase project (Auth + Firestore enabled)
- Stripe account (test or live keys)
- Cloudinary account

---

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/shopping-app.git
cd shopping-app
```

---

### 2. Frontend Setup

Install dependencies:
```bash
npm install
```

Create a `.env` file in the **root** directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key

VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Start the dev server:
```bash
npm run dev
```

---

### 3. Backend Setup

Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=4242
```

Start the payment server:
```bash
npm start
# or with auto-reload:
npm run dev
```

> Both the frontend (`npm run dev` in root) and backend (`npm start` in `server/`) must be running for checkout to work.

---

## 📂 Project Structure

```
├── src/
│   ├── components/         # Reusable UI (Navbar, Toast, FilterSidebar, CloudinaryUpload, etc.)
│   ├── context/            # Global state (AuthContext, CartContext, AdminContext)
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # All pages
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderSuccess.jsx
│   │   ├── Orders.jsx
│   │   ├── Profile.jsx
│   │   ├── Login.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx  # Main admin shell + sidebar
│   │   ├── AdminOrders.jsx
│   │   ├── AdminCustomers.jsx
│   │   ├── AdminCategories.jsx
│   │   └── AdminSettings.jsx
│   ├── utils/
│   │   └── logActivity.js  # Shared activity logging utility
│   ├── config/
│   │   └── firebase.js     # Firebase initialization
│   └── App.jsx
├── server/                 # Node.js + Express Stripe payment server
├── firestore.rules         # Firestore security rules
├── vercel.json             # Vercel deployment config
└── public/
```

---

## 🔒 Security

### Firestore Rules Summary
| Collection | Read | Write |
|---|---|---|
| `users` | Authenticated users | Own doc or admin |
| `products` | Public | Admin (create/delete/update); authenticated users can update stock only |
| `orders` | Own orders or admin | Own orders (create); admin (update/delete) |
| `reviews` | Public | Authenticated (create); own or admin (update/delete) |
| `categories` | Public | Admin only |
| `carts` | Own cart | Own cart |
| `activityLogs` | Admin only | Authenticated users (create); admin (update/delete) |

### Auth Flow
- **Customers** log in via `/login` — admin accounts are blocked here
- **Admins** log in via `/admin` — redirected to `/admin/dashboard`
- Regular users attempting to access `/admin/dashboard` are redirected to `/`

### Payments
- All payment processing is handled by **Stripe** — no card data touches our servers
- Payment intents are created server-side; the frontend only handles the UI

---

## 🚀 Deployment

### Frontend — Vercel
The project includes a `vercel.json` for SPA routing. Deploy via:
```bash
vercel --prod
```
Or connect the GitHub repo directly in the Vercel dashboard.

### Backend — Render / Railway
Deploy the `server/` directory as a separate Node.js service. Set the `STRIPE_SECRET_KEY` environment variable in the platform dashboard.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
