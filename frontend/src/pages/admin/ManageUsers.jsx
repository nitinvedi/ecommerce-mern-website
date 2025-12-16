import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "user", phone: "" });

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    if (currentUser?.role === "admin") fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.USERS);

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

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      phone: user.phone || ""
    });
  };

  const saveUser = async () => {
    if (!editing) return;
    try {
      await api.put(API_ENDPOINTS.ADMIN.USER_BY_ID(editing._id), form);
      toast.success("User updated");
      setEditing(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
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
    <>
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
                  onClick={() => openEdit(u)}
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

    <AnimatePresence>
      {editing && (
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
              <h2 className="text-lg font-semibold">Edit user</h2>
              <button onClick={() => setEditing(null)}>✕</button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-gray-500">Name</label>
                <input
                  className={input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Email</label>
                <input
                  className={input}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Phone</label>
                <input
                  className={input}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Role</label>
                <select
                  className={input}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={saveUser}
                className="flex-1 rounded-lg bg-black py-2 text-sm text-white hover:bg-gray-900"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
