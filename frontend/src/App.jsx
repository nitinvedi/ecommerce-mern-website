import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// COMPONENTS
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import ChatWidget from "./components/ChatWidget";
import Breadcrumbs from "./components/Breadcrumbs";
import MobileBottomNav from "./components/MobileBottomNav";

// PAGES
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Repair from "./pages/Repair";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderDetail from "./pages/OrderDetail";
import LiveUpdates from "./pages/LiveUpdates";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import Wishlist from "./pages/Wishlist";
import Addresses from "./pages/Addresses";
import Notifications from "./pages/Notifications";

// ADMIN
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageRepairs from "./pages/admin/ManageRepairs";
import AdminChat from "./pages/admin/AdminChat";

// TECHNICIAN
import TechnicianDashboard from "./pages/technician/TechnicianDashboard";
import TechnicianJobs from "./pages/technician/TechnicianJobs";
import TechnicianProfile from "./pages/technician/TechnicianProfile";
import TechnicianProducts from "./pages/technician/TechnicianProducts";

// ROUTE GUARDS
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import TechnicianRoute from "./components/TechnicianRoute";

// FALLBACK
import NotFound from "./pages/NotFound";

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      {/* ✅ GLOBAL NAVBAR */}
      <Navbar openSignUp={() => setAuthOpen(true)} />

      {/* ✅ GLOBAL AUTH MODAL */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* ROUTES */}
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/repair" element={<Repair />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/status/:id" element={<LiveUpdates />} />
        <Route path="/orders" element={ <ProtectedRoute> <MyOrders /> </ProtectedRoute>} />

        {/* USER */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <ProtectedRoute>
              <Addresses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <ManageProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <ManageOrders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/repairs"
          element={
            <AdminRoute>
              <ManageRepairs />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/chat"
          element={
            <AdminRoute>
              <AdminChat />
            </AdminRoute>
          }
        />

        {/* TECHNICIAN */}
        <Route
          path="/technician"
          element={
            <TechnicianRoute>
              <TechnicianDashboard />
            </TechnicianRoute>
          }
        />
        <Route
          path="/technician/jobs"
          element={
            <TechnicianRoute>
              <TechnicianJobs />
            </TechnicianRoute>
          }
        />
        <Route
          path="/technician/profile"
          element={
            <TechnicianRoute>
              <TechnicianProfile />
            </TechnicianRoute>
          }
        />
        <Route
          path="/technician/products"
          element={
            <TechnicianRoute>
              <TechnicianProducts />
            </TechnicianRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Chat Widget */}
      <ChatWidget />
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  );
}
