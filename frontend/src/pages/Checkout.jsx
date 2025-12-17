import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, MapPin } from "lucide-react";
import { api, API_ENDPOINTS } from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";
import useAuth from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    address: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zip: user?.address?.zip || "",
    phone: user?.phone || ""
  });

  const subtotal = getCartTotal();
  const tax = subtotal * 0.18;
  const shipping = subtotal > 5000 ? 0 : 100;
  const total = subtotal + tax + shipping;

  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0] || ""
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total
      };

      const res = await api.post(API_ENDPOINTS.ORDERS.BASE, orderData);

      toast.success("Order placed successfully");
      clearCart();
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-32 text-center">
          <p className="text-gray-600 mb-6">Your cart is empty</p>
          <button
            onClick={() => navigate("/cart")}
            className="rounded-xl bg-black px-6 py-3 text-white text-sm"
          >
            Go to cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-semibold text-gray-900 mb-10">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-10"
        >
          {/* ================= LEFT ================= */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping */}
            <section className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin size={18} />
                Shipping address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full name"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleChange}
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleChange}
                />
                <Input
                  label="Address"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleChange}
                  full
                />
                <Input
                  label="City"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleChange}
                />
                <Input
                  label="State"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleChange}
                />
                <Input
                  label="ZIP code"
                  name="zip"
                  value={shippingAddress.zip}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} />
                Payment method
              </h2>

              <div className="space-y-3">
                {[
                  "Cash on Delivery",
                  "UPI",
                  "Credit Card",
                  "Debit Card",
                  "Net Banking"
                ].map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                      paymentMethod === method
                        ? "border-black bg-black/5"
                        : "border-black/10 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-black/5 shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Order summary</h3>

              <div className="space-y-3 text-sm mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between text-gray-600"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/10 pt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={`₹${subtotal.toLocaleString()}`} />
                <Row label="GST (18%)" value={`₹${tax.toLocaleString()}`} />
                <Row
                  label="Shipping"
                  value={shipping === 0 ? "Free" : `₹${shipping}`}
                />
                <div className="pt-3 border-t border-black/10 flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-black px-6 py-4 text-white font-medium disabled:opacity-60"
              >
                {loading ? "Placing order..." : "Place order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */
function Input({ label, full, ...props }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-black/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
        required
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function Checkout() {
  return (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  );
}
