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

  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "technician") {
      fetchRepairs();
    }
  }, [user]);

  const fetchRepairs = async () => {
    try {
      const res = await api.get(`${API_ENDPOINTS.REPAIRS.BASE}?technician=me`);
      const items =
        res?.data?.items ||
        res?.data?.repairs ||
        res?.data?.data ||
        res?.data ||
        [];
      setRepairs(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load technician dashboard data", err);
      toast.error("Failed to load your repairs");
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = repairs.length;
    const inProgress = repairs.filter((r) =>
      ["In Progress", "Diagnosed", "Repairing", "Quality Check", "Confirmed"].includes(r.status)
    ).length;
    const completed = repairs.filter((r) => r.status === "Completed" || r.status === "Delivered").length;
    return { total, inProgress, completed };
  }, [repairs]);

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
        <section className="grid sm:grid-cols-3 gap-6">
          <StatCard
            title="Assigned Jobs"
            value={loading ? "…" : stats.total}
            icon={<Wrench />}
          />
          <StatCard
            title="In Progress"
            value={loading ? "…" : stats.inProgress}
            icon={<Clock />}
          />
          <StatCard
            title="Completed"
            value={loading ? "…" : stats.completed}
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
function StatCard({ title, value, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-black/5 p-5"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-black/5 p-2">
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
