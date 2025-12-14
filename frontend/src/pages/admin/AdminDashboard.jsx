import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  ShoppingCart,
  Package,
  Wrench,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Activity
} from 'lucide-react';
import { api, API_ENDPOINTS } from '../../config/api.js';
import useAuth from '../../hooks/useAuth.js';
import Navbar from '../../components/Navbar.jsx';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.DASHBOARD_STATS),
        api.get(API_ENDPOINTS.ADMIN.DASHBOARD_ACTIVITIES)
      ]);
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    {
      title: 'Total Orders',
      value: stats?.orders?.total || 0,
      icon: ShoppingCart,
      color: 'bg-green-500',
      link: '/admin/orders'
    },
    {
      title: 'Total Products',
      value: stats?.products?.total || 0,
      icon: Package,
      color: 'bg-purple-500',
      link: '/admin/products'
    },
    {
      title: 'Total Repairs',
      value: stats?.repairs?.total || 0,
      icon: Wrench,
      color: 'bg-orange-500',
      link: '/admin/repairs'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.orders?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      link: '/admin/orders'
    },
    {
      title: 'Pending Repairs',
      value: stats?.repairs?.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/admin/repairs'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate(stat.link)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-full`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800 rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Orders
              </h2>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {activities?.orders?.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="bg-slate-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">Order #{order._id.slice(-6)}</p>
                    <p className="text-slate-400 text-sm">
                      ₹{order.totalPrice?.toLocaleString() || 0}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered'
                        ? 'bg-green-500/20 text-green-400'
                        : order.status === 'Pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
              {(!activities?.orders || activities.orders.length === 0) && (
                <p className="text-slate-400 text-center py-4">No recent orders</p>
              )}
            </div>
          </motion.div>

          {/* Recent Repairs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-800 rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Recent Repairs
              </h2>
              <button
                onClick={() => navigate('/admin/repairs')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {activities?.repairs?.slice(0, 5).map((repair) => (
                <div
                  key={repair._id}
                  className="bg-slate-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">{repair.brand} {repair.model}</p>
                    <p className="text-slate-400 text-sm">{repair.trackingId}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      repair.status === 'Completed'
                        ? 'bg-green-500/20 text-green-400'
                        : repair.status === 'Pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {repair.status}
                  </span>
                </div>
              ))}
              {(!activities?.repairs || activities.repairs.length === 0) && (
                <p className="text-slate-400 text-center py-4">No recent repairs</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-slate-800 rounded-lg p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/products')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Manage Products
            </button>
            <button
              onClick={() => navigate('/admin/orders')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Manage Orders
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Manage Users
            </button>
            <button
              onClick={() => navigate('/admin/repairs')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Manage Repairs
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
