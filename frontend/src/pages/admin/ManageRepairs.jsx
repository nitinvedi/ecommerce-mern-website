import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Search,
  Edit2,
  X
} from "lucide-react";
import { api, API_ENDPOINTS } from "../../config/api";
import useAuth from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import AdminLayout from "../../layouts/AdminLayout";

/* ---------------- UI helpers ---------------- */
const input =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-black/20";

const label = "text-xs font-medium text-gray-500";

/* ---------------- Page ---------------- */
export default function ManageRepairs() {
  const { user } = useAuth();
  const toast = useToast();

  const [repairs, setRepairs] = useState([]); // always array
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [activeRepair, setActiveRepair] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [update, setUpdate] = useState({ status: "", note: "" });

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    if (user?.role === "admin") fetchRepairs();
  }, [user]);

  const fetchRepairs = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.REPAIRS.BASE);

      // 🔒 SAFE NORMALIZATION
      const items =
        res?.data?.items ||
        res?.data?.repairs ||
        res?.data?.data?.items ||
        res?.data?.data ||
        [];

      setRepairs(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load repairs");
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Derived ---------------- */
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

  /* ---------------- Actions ---------------- */
  const openModal = (repair) => {
    setActiveRepair(repair);
    setUpdate({ status: repair.status, note: "" });
    setModalOpen(true);
  };

  const saveStatus = async () => {
    if (!activeRepair || !update.status) return;

    try {
      await api.post(
        API_ENDPOINTS.REPAIRS.STATUS(activeRepair._id),
        update
      );
      toast.success("Repair status updated");
      setModalOpen(false);
      setActiveRepair(null);
      fetchRepairs();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const statusBadge = (s) => {
    const map = {
      Pending: "bg-yellow-100 text-yellow-700",
      Confirmed: "bg-blue-100 text-blue-700",
      "In Progress": "bg-blue-100 text-blue-700",
      Diagnosed: "bg-indigo-100 text-indigo-700",
      Repairing: "bg-indigo-100 text-indigo-700",
      "Quality Check": "bg-purple-100 text-purple-700",
      Completed: "bg-green-100 text-green-700",
      Delivered: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700"
    };
    return map[s] || "bg-gray-100 text-gray-600";
  };

  /* ---------------- Render ---------------- */
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Manage Repairs
        </h1>
        <p className="text-sm text-gray-500">
          Track and update repair lifecycle
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repairs…"
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

      {/* Grid */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading repairs…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/10 p-10 text-center text-sm text-gray-500">
          No repairs found
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-black/5 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {r.brand} {r.model}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {r.trackingId}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${statusBadge(
                    r.status
                  )}`}
                >
                  {r.status}
                </span>
              </div>

              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Issue:</strong> {r.issue}
                </p>
                <p>
                  <strong>Device:</strong> {r.deviceType}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => openModal(r)}
                className="mt-4 w-full rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
              >
                Update status
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && activeRepair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Update repair status
                </h2>
                <button onClick={() => setModalOpen(false)}>
                  <X />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={label}>Status</label>
                  <select
                    value={update.status}
                    onChange={(e) =>
                      setUpdate({ ...update, status: e.target.value })
                    }
                    className={input}
                  >
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

                <div>
                  <label className={label}>Note (optional)</label>
                  <textarea
                    rows={3}
                    value={update.note}
                    onChange={(e) =>
                      setUpdate({ ...update, note: e.target.value })
                    }
                    className={input}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={saveStatus}
                  className="flex-1 rounded-lg bg-black py-2 text-sm text-white hover:bg-gray-900"
                >
                  Save
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-black/10 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
