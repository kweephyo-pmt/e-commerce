# ⚡ Techno World — Thailand's Premium Tech Store

![Techno World Banner](./public/Techno%20World.png)

A full-featured cyberpunk-themed e-commerce web application built with **React**, **Vite**, **Firebase**, and **Node.js**. Features a real-time admin dashboard, bank transfer payment verification, secure role-based authentication, Cloudinary image uploads, and a complete order management system.

---

## 📸 Screenshots

### 🛍️ Customer Pages

| Home Page | Product Page |
|---|---|
| ![Home](./public/TechnoWorld/Home%20Page.jpeg) | ![Products](./public/TechnoWorld/Product%20Page.jpeg) |

| Product Detail | Cart |
|---|---|
| ![Product Detail](./public/TechnoWorld/Product%20Detail%20Page.jpeg) | ![Cart](./public/TechnoWorld/Cart%20Page.jpeg) |

| Orders | Profile |
|---|---|
| ![Orders](./public/TechnoWorld/Order%20Page.jpeg) | ![Profile](./public/TechnoWorld/Profile%20Page.jpeg) |

---

### 🛡️ Admin Panel

| Dashboard | Products |
|---|---|
| ![Admin Dashboard](./public/TechnoWorld/Admin%20Dashboard.jpeg) | ![Admin Products](./public/TechnoWorld/Admin%20Products.jpeg) |

| Orders | Customers |
|---|---|
| ![Admin Orders](./public/TechnoWorld/Admin%20Orders%20Page.jpeg) | ![Admin Customers](./public/TechnoWorld/Admin%20Customers%20Page.jpeg) |

| Categories | Bank Accounts |
|---|---|
| ![Admin Categories](./public/TechnoWorld/Admin%20Category%20Page.jpeg) | ![Admin Bank Accounts](./public/TechnoWorld/Admin%20Bank%20Account%20Page.jpeg) |

| Settings |
|---|
| ![Admin Settings](./public/TechnoWorld/Admin%20Settings.jpeg) |

---

## ✨ Features

### 🛍️ Customer-Facing
- **Product Browsing** — Filter by category, price range, and star rating via a dynamic sidebar
- **Product Details** — Image gallery, stock status, reviews & ratings
- **Smart Cart** — Add/remove items, adjust quantities, real-time totals
- **Bank Transfer Checkout** — Upload payment slip; admin verifies before order is confirmed
- **Real-time Order Tracking** — Status updates live (Pending → Processing → Shipped → Delivered)
- **Order Success Page** — Reflects payment confirmation in real-time without refresh
- **User Profile** — Manage personal info, shipping address (auto-filled at checkout)
- **Reviews & Ratings** — Leave and view product reviews
- **Wishlist** — Save products for later
- **Authentication** — Email/password and Google sign-in via Firebase Auth

### 🛡️ Admin Dashboard
- **Overview Dashboard** — Live stats: total sales, orders, products, and real-time activity feed
- **Product Management** — Full CRUD with Cloudinary image uploads, category assignment, real-time stock updates
- **Order Management** — Confirm or reject bank transfer payments; stock only deducted on confirmation
- **Customer Management** — View all users, order counts, and total spend (excludes cancelled/rejected orders)
- **Category Management** — Create, edit, and delete product categories
- **Bank Account Management** — Manage payment accounts shown to customers at checkout
- **Settings & Access Control** — Grant or revoke admin access per user; update shipping fee settings
- **Activity Log** — Real-time feed of all admin actions with admin identity (name + avatar)
- **Separate Admin Login** — Admins and customers use completely separate login flows

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & build tool |
| Tailwind CSS | Utility-first styling |
| Lucide React | Icon library |
| React Context API | Auth, Cart, Wishlist global state |
| React Router DOM | Client-side routing |
| Firebase Auth | Authentication |
| Firebase Firestore | Real-time database |
| Cloudinary | Product image hosting & uploads |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Payment server |
| Cloudinary API | Slip image upload endpoint |
| dotenv + CORS | Config & security |

---

## Admin Account

```bash
admin@gamezone.com
admin123
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v16+
- Firebase project (Auth + Firestore enabled)
- Cloudinary account

---

### 1. Clone the Repository
```bash
git clone https://github.com/kweephyo-pmt/e-commerce.git
cd e-commerce
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
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=4242
```

Start the server:
```bash
npm start
# or with auto-reload:
npm run dev
```

> Both the frontend (`npm run dev` in root) and backend (`npm start` in `server/`) must be running for slip uploads to work.

---

## 📂 Project Structure

```
├── src/
│   ├── components/         # Reusable UI (Navbar, Toast, FilterSidebar, CloudinaryUpload, etc.)
│   ├── context/            # Global state (AuthContext, CartContext, AdminContext, WishlistContext)
│   ├── pages/              # All pages
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderSuccess.jsx
│   │   ├── Orders.jsx
│   │   ├── Profile.jsx
│   │   ├── Wishlist.jsx
│   │   ├── Login.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx      # Main admin shell + sidebar
│   │   ├── AdminOrders.jsx
│   │   ├── AdminCustomers.jsx
│   │   ├── AdminCategories.jsx
│   │   ├── AdminBankAccounts.jsx
│   │   └── AdminSettings.jsx
│   ├── utils/
│   │   └── logActivity.js          # Shared activity logging utility
│   ├── config/
│   │   └── firebase.js             # Firebase initialization
│   └── App.jsx
├── server/                         # Node.js + Express server (slip upload)
├── firestore.rules                 # Firestore security rules
├── vercel.json                     # Vercel deployment config
└── public/
    ├── favicon.png
    ├── Techno World.png            # OG share image
    └── TechnoWorld/                # App screenshots
```

---

## 🔒 Security

### Firestore Rules Summary
| Collection | Read | Write |
|---|---|---|
| `users` | Authenticated users | Own doc or admin |
| `products` | Public | Admin (create/delete/update) |
| `orders` | Own orders or admin | Own orders (create); admin (update/delete) |
| `reviews` | Public | Authenticated (create); own or admin (update/delete) |
| `categories` | Public | Admin only |
| `carts` | Own cart | Own cart |
| `activityLogs` | Admin only | Authenticated users (create); admin (update/delete) |
| `settings` | Public (read) | Admin only |

### Auth Flow
- **Customers** log in via `/login` — admin accounts are blocked here
- **Admins** log in via `/admin` — redirected to `/admin/dashboard`
- Regular users attempting to access `/admin/dashboard` are redirected to `/`

### Payment Flow
- Customer uploads bank transfer slip at checkout
- Stock is **not** deducted until admin confirms payment
- Admin confirms → stock decremented, order moves to Processing
- Admin rejects → order cancelled, stock untouched

---

## 🚀 Deployment

### Frontend — Vercel
The project includes a `vercel.json` for SPA routing. Deploy via:
```bash
vercel --prod
```
Or connect the GitHub repo directly in the Vercel dashboard.

### Backend — Render / Railway
Deploy the `server/` directory as a separate Node.js service. Set the Cloudinary environment variables in the platform dashboard.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
