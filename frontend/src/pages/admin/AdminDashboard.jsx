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

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    const res = await api.get(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
    setStats(res.data);
  };

  const cards = [
    { label: "Users", value: stats?.users?.total, icon: Users },
    { label: "Orders", value: stats?.orders?.total, icon: ShoppingCart },
    { label: "Products", value: stats?.products?.total, icon: Package },
    { label: "Repairs", value: stats?.repairs?.total, icon: Wrench },
    {
      label: "Revenue",
      value: `₹${(stats?.orders?.revenue || 0).toLocaleString()}`,
      icon: DollarSign
    }
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Overview of platform activity
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-black/5 p-2">
                <c.icon className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {c.value ?? "—"}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AdminLayout>
  );
}
