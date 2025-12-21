import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, API_ENDPOINTS } from "../config/api.js";
import { useToast } from "../context/ToastContext.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`${API_ENDPOINTS.ORDERS.BASE}/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading order...</div>;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-10 max-w-4xl mx-auto pt-28"> 
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
               <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Order #{order._id.slice(-6)}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
               </div>
               <div className="flex items-center gap-3">
                   <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-sm border border-blue-100">
                      {order.status}
                   </span>
                   <span className={`px-3 py-1 rounded-full font-medium text-sm border ${order.isPaid ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                   </span>
               </div>
          </div>

          <div className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.product} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-4">
                        {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded bg-gray-100" />}
                        <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                    </div>
                    <p className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-end">
                   <div className="w-full max-w-xs space-y-2">
                       <div className="flex justify-between text-sm">
                           <span className="text-gray-500">Subtotal</span>
                           <span>₹{order.itemsPrice?.toLocaleString()}</span>
                       </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-500">Tax</span>
                           <span>₹{order.taxPrice?.toLocaleString()}</span>
                       </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-500">Shipping</span>
                           <span>₹{order.shippingPrice?.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                           <span>Total</span>
                           <span>₹{order.totalPrice?.toLocaleString()}</span>
                       </div>
                   </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                  <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase">Shipping Address</h3>
                       <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                       <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                       <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                  </div>
                  <div>
                       <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase">Payment Method</h3>
                       <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                  </div>
              </div>
          </div>
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
