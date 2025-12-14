import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { api, API_ENDPOINTS } from '../config/api.js';
import useAuth from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import Navbar from '../components/Navbar.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDERS.BY_ID(id));
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'Shipped':
        return <Truck className="w-5 h-5 text-blue-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-500/20 text-green-400';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-400';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Processing':
        return 'bg-blue-500/20 text-blue-400';
      case 'Shipped':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Order not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Order Details</h1>
          <p className="text-slate-400">Order ID: #{order._id?.slice(-6)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-slate-700 last:border-0">
                    <div className="w-20 h-20 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                      <p className="text-slate-400 text-sm">Quantity: {item.quantity}</p>
                      <p className="text-white font-semibold mt-2">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Shipping Address</h2>
              <div className="text-slate-300 space-y-1">
                <p>{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zip}</p>
                <p>Phone: {order.shippingAddress?.phone}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
                {order.deliveredAt && (
                  <p className="text-slate-400 text-sm mt-1">
                    Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-700 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-slate-300">
                  <span>Items Price</span>
                  <span>₹{order.itemsPrice?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tax</span>
                  <span>₹{order.taxPrice?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shipping</span>
                  <span>₹{order.shippingPrice?.toLocaleString() || 0}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between text-white text-xl font-bold">
                  <span>Total</span>
                  <span>₹{order.totalPrice?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <p className="text-slate-300 mb-2">Payment Method</p>
                <p className="text-white font-semibold">{order.paymentMethod}</p>
                <p className={`text-sm mt-2 ${order.isPaid ? 'text-green-400' : 'text-yellow-400'}`}>
                  {order.isPaid ? 'Paid' : 'Payment Pending'}
                </p>
              </div>
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

