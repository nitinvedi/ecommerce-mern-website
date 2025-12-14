import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Clock4,
  Wrench,
  ArrowRight,
  CheckCircle2,
  Headphones,
  CalendarDays,
  Info,
  ShoppingCart,
  Package,
  TrendingUp
} from 'lucide-react';
import { api, API_ENDPOINTS, SOCKET_URL } from '../config/api.js';
import useAuth from '../hooks/useAuth.js';
import Navbar from '../components/Navbar.jsx';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      // Don't redirect immediately, let ProtectedRoute handle it
      return;
    }
    fetchData();
    initializeSocket();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  const initializeSocket = () => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('order_update', (data) => {
      setOrders(prev => prev.map(order => 
        order._id === data.orderId 
          ? { ...order, status: data.status }
          : order
      ));
    });

    newSocket.on('repair_update', (data) => {
      setRepairs(prev => prev.map(repair => 
        repair._id === data.repairId 
          ? { ...repair, status: data.status }
          : repair
      ));
    });

    setSocket(newSocket);
  };

  const fetchData = async () => {
    try {
      const [ordersRes, repairsRes] = await Promise.all([
        api.get(API_ENDPOINTS.ORDERS.MY_ORDERS),
        api.get(API_ENDPOINTS.REPAIRS.MY_REPAIRS)
      ]);
      setOrders(ordersRes.data || []);
      setRepairs(repairsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket && repairs.length > 0) {
      repairs.forEach(repair => {
        socket.emit('join_repair', repair._id);
      });
    }
    if (socket && orders.length > 0) {
      orders.forEach(order => {
        socket.emit('join_order', order._id);
      });
    }
  }, [socket, repairs, orders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f6f0e9] via-[#fff7e8] to-[#f7efe5]">
        <div className="text-slate-900 text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  const recentRepair = repairs[0];
  const recentOrder = orders[0];

  const getStatusColor = (status) => {
    const statusMap = {
      'Pending': 'bg-yellow-500',
      'Processing': 'bg-blue-500',
      'Shipped': 'bg-purple-500',
      'Delivered': 'bg-green-500',
      'Completed': 'bg-green-500',
      'In Progress': 'bg-blue-500',
      'Cancelled': 'bg-red-500'
    };
    return statusMap[status] || 'bg-gray-500';
  };

  const getRepairProgress = (repair) => {
    const statusOrder = ['Pending', 'Confirmed', 'In Progress', 'Diagnosed', 'Repairing', 'Quality Check', 'Completed', 'Delivered'];
    const currentIndex = statusOrder.indexOf(repair?.status || 'Pending');
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f0e9] via-[#fff7e8] to-[#f7efe5] text-slate-900 px-4 py-6 lg:px-10 lg:py-8">
      <Navbar />
      
      {/* TOP NAV */}
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="font-semibold tracking-wide">FixMate</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-500 hidden sm:block">Customer Panel</span>
          <img
            src={`https://avatar.iran.liara.run/public?username=${user?.name || 'user'}`}
            alt="avatar"
            className="w-9 h-9 rounded-full shadow border border-white/70 object-cover"
          />
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto space-y-6">
        {/* WELCOME */}
        <section>
          <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">
            Welcome back,
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-1">
            {user?.name}, here is your dashboard 📱🛠️
          </h1>
        </section>

        {/* STATS GRID */}
        <section className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 rounded-3xl p-6 shadow-lg backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Orders</p>
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 rounded-3xl p-6 shadow-lg backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Active Repairs</p>
                <p className="text-3xl font-bold">{repairs.filter(r => r.status !== 'Completed' && r.status !== 'Delivered').length}</p>
              </div>
              <Wrench className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 rounded-3xl p-6 shadow-lg backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Completed</p>
                <p className="text-3xl font-bold">{repairs.filter(r => r.status === 'Completed' || r.status === 'Delivered').length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>
        </section>

        {/* GRID */}
        <section className="grid gap-6 lg:grid-cols-12">
          {/* CUSTOMER PROFILE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 bg-gradient-to-br from-[#f4d3a1] via-[#f7e2b8] to-[#f7efe5] rounded-3xl p-6 shadow-[0_18px_45px_rgba(0,0,0,0.15)]"
          >
            <div className="flex items-center gap-4">
              <img
                src={`https://avatar.iran.liara.run/public?username=${user?.name || 'user'}`}
                className="w-20 h-20 rounded-3xl object-cover shadow-lg"
                alt="Customer"
              />

              <div>
                <h2 className="text-xl font-semibold">{user?.name || 'User'}</h2>
                <p className="text-sm text-slate-700">Customer</p>
                <p className="text-xs text-slate-600 mt-1">ID: {user?._id?.slice(-6) || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-slate-700"><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p className="text-sm text-slate-700"><strong>Phone:</strong> {user?.phone || 'N/A'}</p>
            </div>

            <button 
              onClick={() => navigate('/profile')}
              className="mt-6 w-full py-3 rounded-full bg-slate-900 text-white shadow flex items-center justify-center gap-2 text-sm hover:bg-slate-800 transition-colors"
            >
              <Info className="w-4 h-4" />
              Update Profile
            </button>
          </motion.div>

          {/* DEVICE STATUS CARD */}
          {recentRepair && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-4 bg-white/80 rounded-3xl p-6 shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Device</h3>
                <Smartphone className="w-5 h-5 text-slate-600" />
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-sm"><strong>Model:</strong> {recentRepair.brand} {recentRepair.model}</p>
                <p className="text-sm"><strong>Issue:</strong> {recentRepair.issue}</p>
                <p className="text-sm"><strong>Ticket ID:</strong> {recentRepair.trackingId}</p>
              </div>

              <div className="mt-6">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Repair Progress</p>

                <div className="w-full h-3 bg-slate-200 rounded-full mt-2">
                  <div 
                    className={`h-full ${getStatusColor(recentRepair.status)} rounded-full transition-all duration-500`}
                    style={{ width: `${getRepairProgress(recentRepair)}%` }}
                  />
                </div>
                <p className="text-xs mt-2 text-amber-600 font-medium">
                  {Math.round(getRepairProgress(recentRepair))}% Completed
                </p>
              </div>
            </motion.div>
          )}

          {/* RECENT ORDER CARD */}
          {recentOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-4 bg-white/80 rounded-3xl p-6 shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold">Recent Order</h3>
                <p className="text-slate-700 mt-2 text-sm">
                  Order #{recentOrder._id.slice(-6)}
                </p>
                <p className="text-2xl font-semibold mt-1 text-amber-600">
                  ₹{recentOrder.totalPrice?.toLocaleString() || 0}
                </p>
                <p className={`text-sm mt-2 px-3 py-1 rounded-full inline-block ${getStatusColor(recentOrder.status)}/20 text-${getStatusColor(recentOrder.status).replace('bg-', '')}-600`}>
                  {recentOrder.status}
                </p>
              </div>

              <button 
                onClick={() => {
                  // For regular users, show orders in a modal or navigate to orders page
                  // For now, just scroll to orders section
                  document.getElementById('orders-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-6 w-full py-3 rounded-full bg-amber-500 text-slate-900 shadow flex items-center justify-center gap-2 text-sm hover:bg-amber-600 transition-colors"
              >
                <Headphones className="w-4 h-4" />
                View Orders
              </button>
            </motion.div>
          )}

          {/* RECENT ORDERS LIST */}
          <motion.div
            id="orders-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-white/90 rounded-3xl p-6 shadow-lg backdrop-blur"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Recent Orders</h3>
            </div>

            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-2xl border hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded-full ${getStatusColor(order.status)}`}></span>
                    <div>
                      <p className="text-sm font-medium">Order #{order._id.slice(-6)}</p>
                      <p className="text-xs text-slate-500">₹{order.totalPrice?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-slate-500 py-4">No orders yet</p>
              )}
            </div>
          </motion.div>

          {/* RECENT REPAIRS LIST */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-5 bg-slate-900 text-slate-50 rounded-3xl p-6 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-slate-100" />
              <h3 className="text-lg font-semibold">Active Repairs</h3>
            </div>

            <div className="space-y-3 text-sm">
              {repairs.slice(0, 3).map((repair) => (
                <div key={repair._id} className="bg-slate-800 rounded-lg p-3">
                  <p className="font-medium">{repair.brand} {repair.model}</p>
                  <p className="text-xs text-slate-400 mt-1">{repair.trackingId}</p>
                  <p className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${getStatusColor(repair.status)}/20 text-${getStatusColor(repair.status).replace('bg-', '')}-400`}>
                    {repair.status}
                  </p>
                </div>
              ))}
              {repairs.length === 0 && (
                <p className="text-center text-slate-400 py-4">No active repairs</p>
              )}
            </div>

            <button 
              onClick={() => navigate('/repair')}
              className="mt-6 w-full py-3 rounded-full bg-white text-slate-900 shadow flex items-center justify-center gap-2 text-sm hover:bg-slate-100 transition-colors"
            >
              <Wrench className="w-4 h-4" />
              Request Repair
            </button>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
