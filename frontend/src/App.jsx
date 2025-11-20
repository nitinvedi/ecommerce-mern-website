import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';

import Home from './pages/Home';
import Product from './pages/Product';
import Repair from './pages/Repair';
import Contact from './pages/Contact';
import Cart from './pages/Cart';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';

import NotFound from './pages/NotFound';
import Landing from "./pages/Landing";
import Navbar from "./components/Navbar";
import LiveUpdates from "./pages/LiveUpdates";

export default function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/product" element={<Product />} />
          <Route path="/repair" element={<Repair />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/status" element={<LiveUpdates />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ManageProducts />} />
          <Route path="/admin/orders" element={<ManageOrders />} />
          <Route path="/admin/users" element={<ManageUsers />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}
