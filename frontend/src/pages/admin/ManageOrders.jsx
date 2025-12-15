import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckCircle2, XCircle, Clock, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { api, API_ENDPOINTS } from "../../config/api";
import useAuth from "../../hooks/useAuth";
import AdminLayout from "../../layouts/AdminLayout";

export default function ManageOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    const res = await api.get(API_ENDPOINTS.ORDERS.BASE);
    setOrders(res.data || []);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await api.put(API_ENDPOINTS.ORDERS.STATUS(id), { status });
    fetchOrders();
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      (status === "all" || o.status === status) &&
      (o._id?.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q))
    );
  });

  const badge = s => ({
    Delivered: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Shipped: "bg-purple-100 text-purple-700",
    Cancelled: "bg-red-100 text-red-700"
  }[s] || "bg-gray-100 text-gray-700");

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">
          Manage and track customer orders
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order or customer"
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-black/10"
          />
        </div>

        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-5 py-3 text-left">Order</th>
              <th className="px-5 py-3 text-left">Customer</th>
              <th className="px-5 py-3 text-left">Total</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(o => (
              <motion.tr
                key={o._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-5 py-3 font-medium">
                  #{o._id.slice(-6)}
                </td>
                <td className="px-5 py-3">
                  {o.shippingAddress?.fullName || "—"}
                </td>
                <td className="px-5 py-3 font-medium">
                  ₹{o.totalPrice?.toLocaleString()}
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${badge(o.status)}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o._id, e.target.value)}
                    className="rounded-md border border-gray-200 px-2 py-1 text-xs"
                  >
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <div className="p-8 text-center text-sm text-gray-500">
            No orders found
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
