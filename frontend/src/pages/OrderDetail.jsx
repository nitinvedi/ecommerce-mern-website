import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, API_ENDPOINTS } from "../config/api.js";
import { useToast } from "../context/ToastContext.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // ...

  return (
    <div className="min-h-screen bg-neutral-50 p-10 max-w-4xl mx-auto"> 
      {/* Centered with max-w */}
      <button
        onClick={() => navigate("/orders")}
        className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:bg-gray-100 transition-colors">
          <ArrowLeft size={16} />
        </div>
        Back to orders
      </button>

      <h1 className="text-2xl font-semibold mt-0">
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
