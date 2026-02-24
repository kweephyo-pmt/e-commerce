import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { WishlistProvider } from './context/WishlistContext';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ResetPassword from './pages/ResetPassword';
import Wishlist from './pages/Wishlist';
import Privacy from './pages/Privacy';
import TermsOfService from './pages/TermsOfService';
import AdminRoute from './components/AdminRoute';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin/dashboard');

  return (
    <div className="min-h-screen">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms_of_service" element={<TermsOfService />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
              <Analytics />
              <SpeedInsights />
            </WishlistProvider>
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
