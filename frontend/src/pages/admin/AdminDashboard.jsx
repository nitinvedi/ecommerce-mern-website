import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShoppingCart,
  Package,
  Wrench,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { api, API_ENDPOINTS } from "../../config/api";
import useAuth from "../../hooks/useAuth";
import AdminLayout from "../../layouts/AdminLayout";
import { RevenueChart } from "../../components/dashboard/AdminStatsChart";
import { RecentActivity, TopProducts, InventoryAlert } from "../../components/dashboard/DashboardWidgets";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.DASHBOARD_STATS),
        api.get(API_ENDPOINTS.ADMIN.DASHBOARD_ACTIVITIES + "?limit=10")
      ]);
      setStats(statsRes.data);
      setActivities(activityRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: "Total Users", value: stats?.users?.total, icon: Users, color: "bg-blue-500" },
    { label: "Total Orders", value: stats?.orders?.total, icon: ShoppingCart, color: "bg-purple-500" },
    { label: "Active Products", value: stats?.products?.total, icon: Package, color: "bg-orange-500" },
    { label: "Pending Repairs", value: stats?.repairs?.pending, icon: Wrench, color: "bg-pink-500" },
    {
      label: "Total Revenue",
      value: `₹${(stats?.orders?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-500"
    }
  ];

  if (loading) {
     return (
        <AdminLayout>
           <div className="flex items-center justify-center h-[60vh]">
              <div className="animate-spin w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full" />
           </div>
        </AdminLayout>
     );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Welcome back, here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 ${c.color} bg-opacity-10`}>
                <c.icon className={`h-6 w-6 ${c.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{c.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">
                  {c.value ?? "—"}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
         {/* Main Chart */}
         <div className="lg:col-span-2">
            <RevenueChart data={stats?.charts?.revenue} />
         </div>

         {/* Side Widgets */}
         <div className="space-y-8">
            <InventoryAlert products={stats?.products?.lowStock} />
            <TopProducts products={stats?.products?.top} />
         </div>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 gap-8">
         <RecentActivity activities={activities} />
      </div>

    </AdminLayout>
  );
}
