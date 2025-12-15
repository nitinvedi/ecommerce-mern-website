import { Routes, Route } from "react-router-dom";
import "./App.css";

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

// ADMIN
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageRepairs from "./pages/admin/ManageRepairs";

// TECHNICIAN (NEW)
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
  return (
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

      {/* TECHNICIAN (NEW) */}
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
  );
}
