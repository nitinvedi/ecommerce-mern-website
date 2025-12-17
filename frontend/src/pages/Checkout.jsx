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

      // ✅ CORRECT ACCESS
      navigate(`/orders/${res.data.data._id}`);
    } catch (err) {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-semibold mb-10">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-6 rounded-2xl">
              <h2 className="flex items-center gap-2 mb-6">
                <MapPin size={18} /> Shipping address
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(shippingAddress).map(([key, value]) => (
                  <input
                    key={key}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    required
                    className="rounded-xl border px-4 py-2"
                  />
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl">
              <h2 className="flex items-center gap-2 mb-4">
                <CreditCard size={18} /> Payment
              </h2>

              {["Cash on Delivery", "UPI", "Credit Card"].map((m) => (
                <label key={m} className="block">
                  <input
                    type="radio"
                    checked={paymentMethod === m}
                    onChange={() => setPaymentMethod(m)}
                  />{" "}
                  {m}
                </label>
              ))}
            </section>
          </div>

          <div className="bg-white p-6 rounded-2xl">
            <h3 className="font-semibold mb-4">Order summary</h3>
            <p>Total: ₹{total}</p>

            <button
              disabled={loading}
              className="mt-6 w-full bg-black text-white py-3 rounded-xl"
            >
              {loading ? "Placing..." : "Place order"}
            </button>
          </div>
        </form>
      </div>
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
