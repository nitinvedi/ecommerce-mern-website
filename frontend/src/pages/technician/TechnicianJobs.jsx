import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { api, API_ENDPOINTS } from "../../config/api";
import { useToast } from "../../context/ToastContext";

export default function TechnicianJobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

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
        res?.data?.data?.items ||
        res?.data?.data ||
        [];
      setRepairs(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load technician repairs", err);
      toast.error("Failed to load your jobs");
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return repairs.filter((r) => {
      const matchSearch =
        r.trackingId?.toLowerCase().includes(search.toLowerCase()) ||
        r.brand?.toLowerCase().includes(search.toLowerCase()) ||
        r.model?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "all" || r.status === status;
      return matchSearch && matchStatus;
    });
  }, [repairs, search, status]);

  return (
    <div className="min-h-screen bg-neutral-50">

      <main className="max-w-5xl mx-auto px-6 pt-24 pb-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Assigned Repairs</h1>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by tracking/brand/model"
                className="w-full rounded-lg border border-black/10 pl-9 pr-3 py-2 text-sm"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-black/10 px-3 py-2 text-sm"
            >
              <option value="all">All status</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>In Progress</option>
              <option>Diagnosed</option>
              <option>Repairing</option>
              <option>Quality Check</option>
              <option>Completed</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading your jobs…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 p-8 text-center text-sm text-gray-500">
            No jobs found
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-black/5 p-5 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-black/5 p-2">
                    <Wrench />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {job.brand} {job.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      {job.issue} • {job.status} • {job.trackingId}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/technician/job/${job._id}`)}
                  className="text-sm text-gray-700 hover:text-black flex items-center gap-1"
                >
                  Open <ArrowRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
