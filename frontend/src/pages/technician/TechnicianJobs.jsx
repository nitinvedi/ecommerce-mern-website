import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { api, API_ENDPOINTS } from "../../config/api";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errorHandler.js";


export default function TechnicianJobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  /* ---------------- Tabs ---------------- */
  const [activeTab, setActiveTab] = useState("my-jobs"); // my-jobs | available
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    if (user?.role === "technician") {
      fetchRepairs();
    }
  }, [user, activeTab]);

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.REPAIRS.BASE}`;
      if (activeTab === "my-jobs") {
        url += "?technician=me";
      } else {
        url += "?technician=null"; // Fetch unassigned
      }

      const res = await api.get(url);
      const items =
        res?.data?.items ||
        res?.data?.repairs ||
        res?.data?.data ||
        res?.data ||
        [];
      setRepairs(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load technician repairs", err);
      toast.error(getErrorMessage(err, "Failed to load jobs"));
      setRepairs([]);

    } finally {
      setLoading(false);
    }
  };

  const handleTakeJob = async (jobId) => {
      if (!window.confirm("Are you sure you want to take this job?")) return;
      try {
          await api.put(API_ENDPOINTS.REPAIRS.BY_ID(jobId), {
              technician: user._id
          });
          toast.success("Job assigned to you");
          fetchRepairs(); // Refresh
      } catch (err) {
          console.error(err);
          toast.error(getErrorMessage(err, "Failed to take job"));
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
          <h1 className="text-2xl font-semibold text-gray-900">
            {activeTab === 'my-jobs' ? 'My Assignments' : 'Available Jobs'}
          </h1>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
             <button 
                onClick={() => setActiveTab("my-jobs")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'my-jobs' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
             >
                My Jobs
             </button>
             <button 
                onClick={() => setActiveTab("available")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'available' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
             >
                Available Pool
             </button>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
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
              {activeTab === 'available' ? (
                  <option>Pending</option>
              ) : (
                  <>
                    <option>Confirmed</option>
                    <option>In Progress</option>
                    <option>Diagnosed</option>
                    <option>Repairing</option>
                    <option>Quality Check</option>
                    <option>Completed</option>
                  </>
              )}
            </select>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading jobs…</p>
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
                  <div className={`rounded-xl p-2 ${activeTab === 'available' ? 'bg-green-50 text-green-600' : 'bg-black/5'}`}>
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

                <div className="flex items-center gap-3">
                    {activeTab === 'available' ? (
                        <button 
                            onClick={() => handleTakeJob(job._id)}
                            className="text-xs bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition"
                        >
                            Take Job
                        </button>
                    ) : (
                        <button
                          onClick={() => navigate(`/technician/job/${job._id}`)}
                          className="text-sm text-gray-700 hover:text-black flex items-center gap-1"
                        >
                          Open <ArrowRight size={14} />
                        </button>
                    )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
