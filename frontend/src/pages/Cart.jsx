import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import Navbar from "../components/Navbar.jsx";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal
  } = useCart();

  const calculateTax = (subtotal) => subtotal * 0.18;
  const calculateShipping = (subtotal) => (subtotal > 5000 ? 0 : 100);

  const subtotal = getCartTotal();
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax + shipping;

  /* ---------- Empty Cart ---------- */
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />

        <div className="max-w-3xl mx-auto px-6 py-32 text-center">
          <ShoppingCart className="mx-auto mb-6 text-gray-300" size={72} />
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven’t added anything yet
          </p>

          <button
            onClick={() => navigate("/home")}
            className="rounded-xl bg-black px-6 py-3 text-white text-sm font-medium hover:bg-gray-900 transition"
          >
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Cart ---------- */
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-semibold text-gray-900 mb-10">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ================= Cart Items ================= */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex gap-6"
              >
                {/* Image */}
                <div className="w-28 h-28 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.images?.[0] ? (
                    <img
                      src={
                        item.images[0].startsWith("http")
                          ? item.images[0]
                          : `http://localhost:5000${item.images[0]}`
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-black/10">
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          className="px-3 py-2 hover:bg-gray-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className="px-3 py-2 hover:bg-gray-100"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{item.price.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ================= Order Summary ================= */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-black/5 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm">
                <Row label="Subtotal" value={`₹${subtotal.toLocaleString()}`} />
                <Row label="GST (18%)" value={`₹${tax.toLocaleString()}`} />
                <Row
                  label="Shipping"
                  value={shipping === 0 ? "Free" : `₹${shipping}`}
                />

                <div className="pt-4 border-t border-black/10 flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="mt-6 w-full rounded-xl bg-black px-6 py-4 text-white font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition"
              >
                Proceed to checkout
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => navigate("/home")}
                className="mt-3 w-full rounded-xl border border-black/10 px-6 py-3 text-sm hover:bg-gray-50 transition"
              >
                Continue shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Helper ---------- */
function Row({ label, value }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
