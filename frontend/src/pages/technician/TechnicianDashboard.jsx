import { motion } from "framer-motion";
import { Wrench, Clock, CheckCircle2, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import useAuth from "../../hooks/useAuth";

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

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
            value="—"
            icon={<Wrench />}
          />
          <StatCard
            title="In Progress"
            value="—"
            icon={<Clock />}
          />
          <StatCard
            title="Completed"
            value="—"
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
