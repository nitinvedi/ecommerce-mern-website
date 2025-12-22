import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Trash2,
  Edit2,
  Shield,
  User as UserIcon,
  Download,
  CheckSquare,
  Square,
  MoreHorizontal,
  Eye,
  Calendar
} from "lucide-react";

import { api, API_ENDPOINTS } from "../../config/api";
import useAuth from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import AdminLayout from "../../layouts/AdminLayout";
import { getErrorMessage } from "../../utils/errorHandler.js";


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

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Modals
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
    phone: ""
  });

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.USERS);
      const items = Array.isArray(res?.data) ? res.data : [];
      setUsers(items);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to load users"));
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
      toast.error(getErrorMessage(err, "Delete failed"));
    }
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} users?`)) return;
    // In a real app, use a bulk delete endpoint. Here, we loop (not ideal but works for small sets)
    try {
      await Promise.all([...selectedIds].map(id => api.delete(API_ENDPOINTS.USERS.BY_ID(id))));
      toast.success("Users deleted");
      setSelectedIds(new Set());
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Some deletes failed"));
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Name", "Email", "Role", "Phone", "Joined Date"];
    const rows = filtered.map(u => [
      u._id,
      u.name,
      u.email,
      u.role,
      u.phone || "",
      new Date(u.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
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
      await api.put(API_ENDPOINTS.USERS.BY_ID(editing._id), form);
      toast.success("User updated");
      setEditing(null);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed"));
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Manage Users
            </h1>
            <p className="text-sm text-gray-500">
              {users.length} registered users
            </p>
          </div>
          <div className="flex gap-2">
             {selectedIds.size > 0 && (
                <button 
                  onClick={deleteSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={16} /> Delete ({selectedIds.size})
                </button>
             )}
             <button 
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
             >
                <Download size={16} /> Export CSV
             </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative max-w-sm flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-black/10 pl-9 pr-3 py-2 text-sm"
            />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="technician">Technician</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
           <div className="text-center py-12">
             <div className="animate-spin w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full mx-auto mb-2" />
             <p className="text-sm text-gray-500">Loading users...</p>
           </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/10 p-10 text-center text-sm text-gray-500">
            No users found matching your filters.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                   <tr>
                      <th className="px-6 py-4 w-12 text-center">
                        <button onClick={() => {
                           if (selectedIds.size === filtered.length) setSelectedIds(new Set());
                           else setSelectedIds(new Set(filtered.map(u => u._id)));
                        }}>
                           {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {filtered.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                         <td className="px-6 py-4 text-center">
                           <button onClick={() => toggleSelect(u._id)} className="text-gray-400 hover:text-gray-600">
                              {selectedIds.has(u._id) ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                           </button>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm">
                                  {u.name?.[0]?.toUpperCase()}
                               </div>
                               <div>
                                  <p className="font-medium text-gray-900">{u.name}</p>
                                  <p className="text-xs text-gray-500">{u.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge(u.role)} uppercase`}>
                               {u.role}
                            </span>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-green-500" />
                               <span className="text-sm text-gray-600">Active</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => setViewing(u)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="View Details">
                                  <Eye size={16} />
                               </button>
                               <button onClick={() => openEdit(u)} className="p-2 hover:bg-gray-100 rounded-lg text-blue-600" title="Edit">
                                  <Edit2 size={16} />
                               </button>
                               {u._id !== currentUser?._id && (
                                  <button onClick={() => deleteUser(u._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600" title="Delete">
                                     <Trash2 size={16} />
                                  </button>
                               )}
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </AdminLayout>

      {/* Edit Modal */}
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
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <input
                    className={input}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Phone</label>
                  <input
                    className={input}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Role</label>
                  <select
                    className={input}
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
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
                  Save Changes
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

      {/* View Details Modal */}
      <AnimatePresence>
        {viewing && (
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
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl overflow-hidden"
            >
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400">
                        {viewing.name?.[0]?.toUpperCase()}
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-gray-900">{viewing.name}</h2>
                        <p className="text-sm text-gray-500">{viewing.email}</p>
                     </div>
                  </div>
                  <button onClick={() => setViewing(null)} className="p-2 hover:bg-gray-100 rounded-lg"><MoreHorizontal /></button>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                     <p className="text-xs text-gray-500 mb-1">Role</p>
                     <p className="font-medium capitalize">{viewing.role}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                     <p className="text-xs text-gray-500 mb-1">Phone</p>
                     <p className="font-medium">{viewing.phone || "Not set"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                     <p className="text-xs text-gray-500 mb-1">Joined On</p>
                     <p className="font-medium">{new Date(viewing.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                     <p className="text-xs text-gray-500 mb-1">User ID</p>
                     <p className="font-medium text-xs font-mono truncate" title={viewing._id}>{viewing._id}</p>
                  </div>
               </div>

               <button 
                  onClick={() => setViewing(null)}
                  className="w-full py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800"
               >
                  Close Details
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
