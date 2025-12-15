import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Trash2,
  Edit2,
  Shield,
  User as UserIcon
} from "lucide-react";
import { api, API_ENDPOINTS } from "../../config/api";
import useAuth from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import AdminLayout from "../../layouts/AdminLayout";

/* ---------------- UI helpers ---------------- */
const input =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-black/20";

const badge = (role) => {
  const map = {
    admin: "bg-purple-100 text-purple-700",
    technician: "bg-orange-100 text-orange-700",
    user: "bg-blue-100 text-blue-700"
  };
  return map[role] || "bg-gray-100 text-gray-600";
};

/* ---------------- Page ---------------- */
export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]); // always array
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    if (currentUser?.role === "admin") fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.USERS.BASE);

      // 🔒 SAFE NORMALIZATION
      const items =
        res?.data?.items ||
        res?.data?.users ||
        res?.data?.data ||
        [];

      setUsers(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Actions ---------------- */
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;

    try {
      await api.delete(API_ENDPOINTS.USERS.BY_ID(id));
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  /* ---------------- Derived ---------------- */
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());

      const matchRole = role === "all" || u.role === role;
      return matchSearch && matchRole;
    });
  }, [users, search, role]);

  /* ---------------- Render ---------------- */
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Manage Users
        </h1>
        <p className="text-sm text-gray-500">
          View and manage platform users
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
            placeholder="Search users…"
            className="w-full rounded-lg border border-black/10 pl-9 pr-3 py-2 text-sm"
          />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
        >
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="technician">Technician</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading users…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/10 p-10 text-center text-sm text-gray-500">
          No users found
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-black/5 bg-white p-5 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5">
                  {u.role === "admin" ? (
                    <Shield className="text-purple-600" />
                  ) : (
                    <UserIcon className="text-blue-600" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {u.email}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${badge(
                    u.role
                  )}`}
                >
                  {u.role?.toUpperCase()}
                </span>

                {u.phone && (
                  <span className="text-xs text-gray-500">
                    {u.phone}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
                  onClick={() =>
                    toast.info("Edit user coming soon")
                  }
                >
                  <Edit2 size={14} className="inline mr-1" />
                  Edit
                </button>

                {u._id !== currentUser?._id && (
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
