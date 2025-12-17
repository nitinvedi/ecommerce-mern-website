import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, API_ENDPOINTS } from "../config/api.js";
import { useToast } from "../context/ToastContext.jsx";
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

      // ✅ CORRECT — res.data IS the order
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Order not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-10">
      <button
        onClick={() => navigate("/orders")}
        className="text-sm text-gray-600 hover:text-black"
      >
        ← Back to orders
      </button>

      <h1 className="text-2xl font-semibold mt-6">
        Order #{order._id.slice(-6)}
      </h1>

      <p className="mt-2 text-sm">
        Status: <strong>{order.status}</strong>
      </p>

      <p className="text-sm">
        Total: ₹{order.totalPrice?.toLocaleString()}
      </p>

      <h2 className="mt-6 font-semibold">Items</h2>

      <div className="mt-3 space-y-2">
        {order.orderItems.map((item) => (
          <div key={item.product} className="text-sm">
            {item.name} × {item.quantity}
          </div>
        ))}
      </div>
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
