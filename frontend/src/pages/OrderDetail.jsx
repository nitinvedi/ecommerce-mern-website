import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft
} from "lucide-react";
import { api, API_ENDPOINTS } from "../config/api.js";
import { useToast } from "../context/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ORDERS.BY_ID(id));
      setOrder(res.data);
    } catch (err) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const statusMeta = {
    Delivered: {
      icon: <CheckCircle2 className="text-green-600" size={18} />,
      badge: "bg-green-50 text-green-700"
    },
    Shipped: {
      icon: <Truck className="text-blue-600" size={18} />,
      badge: "bg-blue-50 text-blue-700"
    },
    Processing: {
      icon: <Clock className="text-yellow-600" size={18} />,
      badge: "bg-yellow-50 text-yellow-700"
    },
    Pending: {
      icon: <Clock className="text-yellow-600" size={18} />,
      badge: "bg-yellow-50 text-yellow-700"
    },
    Cancelled: {
      icon: <XCircle className="text-red-600" size={18} />,
      badge: "bg-red-50 text-red-700"
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-gray-600">Loading order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">Order not found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-xl bg-black px-6 py-3 text-white text-sm"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const meta = statusMeta[order.status] || statusMeta.Pending;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">
            Order #{order._id.slice(-6)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* Items */}
            <section className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Items</h2>

              <div className="space-y-5">
                {order.orderItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 pb-5 border-b border-black/5 last:border-0"
                  >
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={
                            item.image.startsWith("http")
                              ? item.image
                              : `http://localhost:5000${item.image}`
                          }
                          alt={item.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Package className="text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Shipping */}
            <section className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">
                Shipping address
              </h2>

              <div className="text-sm text-gray-700 space-y-1">
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} –{" "}
                  {order.shippingAddress.zip}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div>
            <div className="sticky top-24 bg-white rounded-2xl border border-black/5 shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                Order summary
              </h3>

              {/* Status */}
              <div className="flex items-center gap-2 mb-4">
                {meta.icon}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${meta.badge}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Prices */}
              <div className="space-y-2 text-sm border-t border-black/10 pt-4">
                <Row
                  label="Items"
                  value={`₹${order.itemsPrice.toLocaleString()}`}
                />
                <Row
                  label="Tax"
                  value={`₹${order.taxPrice.toLocaleString()}`}
                />
                <Row
                  label="Shipping"
                  value={`₹${order.shippingPrice.toLocaleString()}`}
                />

                <div className="pt-3 border-t border-black/10 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    ₹{order.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment */}
              <div className="mt-6 border-t border-black/10 pt-4 text-sm">
                <p className="text-gray-500 mb-1">Payment method</p>
                <p className="font-medium">{order.paymentMethod}</p>
                <p
                  className={`mt-1 ${
                    order.isPaid
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Payment pending"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */
function Row({ label, value }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function OrderDetail() {
  return (
    <ProtectedRoute>
      <OrderDetailPage />
    </ProtectedRoute>
  );
}
