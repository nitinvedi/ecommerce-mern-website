import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Wrench,
  Heart,
  DollarSign,
  Briefcase,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Menu
} from "lucide-react";
import { api, SOCKET_URL } from "../config/api.js";
import { DASHBOARD_ENDPOINTS } from "../config/dashboardApi.js";
import { useToast } from "../context/ToastContext.jsx";

import DashboardSidebar from "../components/DashboardSidebar.jsx"; 
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentOrders();
    setGreetingMessage();
  }, []);

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  };

  const fetchDashboardData = async () => {
    try {
      const res = await api.get(DASHBOARD_ENDPOINTS.SUMMARY);
      setSummary(res);
    } catch (error) {
      // toast.error("Failed to load dashboard stats");
    } finally {
      // Don't stop loading here, wait for orders
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await api.get(DASHBOARD_ENDPOINTS.ORDERS + "?limit=5");
      setOrders(res.orders || []);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="animate-spin w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">


      <div className="flex max-w-[1600px] mx-auto">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 lg:p-12 pt-24 w-full overflow-hidden">
           
           {/* Mobile Header with Menu Toggle */}
           <div className="lg:hidden flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
           </div>

           {/* Header */}
           <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h1 className="text-3xl font-bold text-gray-900 mb-1 hidden lg:block">
                    {greeting}, {summary?.userName}!
                 </h1>
                 <h1 className="text-xl font-bold text-gray-900 mb-1 lg:hidden">
                    {greeting}, {summary?.userName?.split(' ')[0]}!
                 </h1>
                 <p className="text-sm md:text-base text-gray-500">Here's what's happening today.</p>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm w-fit">
                 <div className={`w-2.5 h-2.5 rounded-full ${summary?.accountStatus === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                 <span className="text-sm font-medium text-gray-700">{summary?.accountStatus || "Active"} Member</span>
              </div>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
              <StatCard 
                 label="Total Orders" 
                 value={summary?.totalOrders || 0} 
                 icon={Package} 
                 color="blue"
                 trend="+2 this month"
              />
              <StatCard 
                 label="Total Spent" 
                 value={`₹${(summary?.totalSpent || 0).toLocaleString()}`} 
                 icon={DollarSign} 
                 color="green"
              />
              <StatCard 
                 label="Wishlist" 
                 value={summary?.wishlistCount || 0} 
                 icon={Heart} 
                 color="red"
              />
              <StatCard 
                 label="Pending Repairs" 
                 value={summary?.activeRepairs || 0} 
                 icon={Wrench} 
                 color="purple"
              />
           </div>

            {/* Recent Orders */}
           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                 <div className="flex gap-4">
                    <button 
                      onClick={() => navigate('/my-repairs')}
                      className="text-sm font-medium text-gray-500 hover:text-[#0071e3] flex items-center gap-1 transition-colors"
                    >
                        <Wrench size={16} /> My Repairs
                    </button>
                    <button 
                      onClick={() => navigate('/orders')}
                      className="text-sm font-medium text-[#0071e3] hover:text-blue-800 flex items-center gap-1"
                    >
                        View All Orders <ArrowRight size={16} />
                    </button>
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                       <tr>
                          <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                          <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {orders.length > 0 ? (
                          orders.map((order) => (
                             <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4 text-sm font-medium text-gray-900">
                                   #{order._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="px-8 py-4 text-sm text-gray-500">
                                   {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-4">
                                   <div className="flex -space-x-2">
                                      {order.orderItems.slice(0,3).map((item, i) => (
                                         <img 
                                            key={i}
                                            src={item.image?.startsWith("http") ? item.image : `${SOCKET_URL}${item.image}`}
                                            className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 object-cover"
                                            alt=""
                                         />
                                      ))}
                                      {order.orderItems.length > 3 && (
                                         <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">
                                            +{order.orderItems.length - 3}
                                         </div>
                                      )}
                                   </div>
                                </td>
                                <td className="px-8 py-4 text-sm font-bold text-gray-900">
                                   ₹{order.totalPrice.toLocaleString()}
                                </td>
                                <td className="px-8 py-4">
                                   <StatusBadge status={order.status} />
                                </td>
                                <td className="px-8 py-4">
                                   <button 
                                      onClick={() => navigate(`/orders/${order._id}`)}
                                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                   >
                                      Details
                                   </button>
                                </td>
                             </tr>
                          ))
                       ) : (
                          <tr>
                             <td colSpan="6" className="px-8 py-12 text-center text-gray-500">
                                No orders found. Time to go shopping!
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, trend }) {
   const colors = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      red: "bg-red-50 text-red-600",
      purple: "bg-purple-50 text-purple-600",
   };

   return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
         <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${colors[color]}`}>
               <Icon size={24} />
            </div>
            {trend && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
         </div>
         <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
         <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
   );
}

function StatusBadge({ status }) {
   const styles = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
      processing: "bg-blue-50 text-blue-700 border-blue-100",
      shipped: "bg-purple-50 text-purple-700 border-purple-100",
      delivered: "bg-green-50 text-green-700 border-green-100",
      cancelled: "bg-red-50 text-red-700 border-red-100",
   };

   return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${styles[status] || styles.pending}`}>
         {status}
      </span>
   );
}
