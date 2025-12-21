import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Clock, CheckCircle2, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { api, API_ENDPOINTS } from "../../config/api";
import { useToast } from "../../context/ToastContext";

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [statsData, setStatsData] = useState({ assigned: 0, inProgress: 0, completed: 0, available: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "technician") {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch assigned
      const assignedRes = await api.get(`${API_ENDPOINTS.REPAIRS.BASE}?technician=me`);
      const assignedItems = assignedRes.data?.items || assignedRes.data || [];
      const assignedCount = Array.isArray(assignedItems) ? assignedItems.length : 0;
      
      const inProgressCount = Array.isArray(assignedItems) ? assignedItems.filter((r) =>
        ["In Progress", "Diagnosed", "Repairing", "Quality Check", "Confirmed"].includes(r.status)
      ).length : 0;

      const completedCount = Array.isArray(assignedItems) ? assignedItems.filter((r) => 
        r.status === "Completed" || r.status === "Delivered"
      ).length : 0;

      // Fetch available
      const availableRes = await api.get(`${API_ENDPOINTS.REPAIRS.BASE}?technician=null`);
      const availableItems = availableRes.data?.items || availableRes.data || [];
      const availableCount = Array.isArray(availableItems) ? availableItems.length : 0;

      setStatsData({
        assigned: assignedCount,
        inProgress: inProgressCount,
        completed: completedCount,
        available: availableCount
      });

    } catch (err) {
      console.error("Failed to load dashboard data", err);
      toast.error("Failed to refresh dashboard");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-neutral-50">

      <main className="max-w-5xl mx-auto px-6 pt-24 pb-12 space-y-8">
        {/* Header */}
        <section>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Technician Panel
          </p>
          <h1 className="text-3xl font-semibold text-gray-900 mt-1">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Focus on assigned repairs and updates
          </p>
        </section>

        {/* Cards */}
        <section className="grid sm:grid-cols-4 gap-6">
          <StatCard
            title="Available Jobs"
            value={loading ? "…" : statsData.available}
            icon={<PackagePlus />}
            color="bg-green-50 text-green-600"
          />
          <StatCard
            title="Assigned"
            value={loading ? "…" : statsData.assigned}
            icon={<Wrench />}
          />
          <StatCard
            title="Working On"
            value={loading ? "…" : statsData.inProgress}
            icon={<Clock />}
          />
          <StatCard
            title="Completed"
            value={loading ? "…" : statsData.completed}
            icon={<CheckCircle2 />}
          />
        </section>

        {/* Primary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white border border-black/5 p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
        >
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-gray-900">
              Workbench
            </h2>
            <p className="text-sm text-gray-500">
              Jump into your repair queue or manage products you use
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/technician/jobs")}
              className="rounded-xl bg-black px-5 py-2.5 text-sm text-white hover:bg-gray-900 transition"
            >
              View Jobs →
            </button>
            <button
              onClick={() => navigate("/technician/products")}
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm text-gray-800 hover:bg-black/5 transition"
            >
              <PackagePlus size={16} />
              Manage Products
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

/* --- Small stat card --- */
function StatCard({ title, value, icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-black/5 p-5"
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2 ${color || 'bg-black/5'}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-lg font-semibold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
