import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  AlertTriangle
} from "lucide-react";
import { api, API_ENDPOINTS } from "../../config/api";
import useAuth from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";

const input =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-black/20";

const label = "text-xs font-medium text-gray-500";

export default function TechnicianProducts() {
  const { user } = useAuth();
  const toast = useToast();

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Screen",
    description: "",
    price: "",
    stock: "",
    reorderLevel: 5,
    supplier: ""
  });

  useEffect(() => {
    if (user?.role === "technician") {
      fetchParts();
    }
  }, [user]);

  const fetchParts = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.PARTS.BASE);
      const items = res.data || [];
      setParts(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Fetch parts failed", err);
      toast.error("Failed to load inventory");
      setParts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return parts.filter(
      (p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );
  }, [parts, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      sku: "",
      category: "Screen",
      description: "",
      price: "",
      stock: "",
      reorderLevel: 5,
      supplier: ""
    });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      sku: p.sku || "",
      category: p.category || "Screen",
      description: p.description || "",
      price: p.price || "",
      stock: p.stock || "",
      reorderLevel: p.reorderLevel || 5,
      supplier: p.supplier || ""
    });
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        reorderLevel: Number(form.reorderLevel)
    };

    try {
      if (editing) {
        await api.put(API_ENDPOINTS.PARTS.BY_ID(editing._id), payload);
        toast.success("Part updated");
      } else {
        await api.post(API_ENDPOINTS.PARTS.BASE, payload);
        toast.success("Part added");
      }
      setShowModal(false);
      fetchParts();
    } catch (err) {
      console.error("Save failed", err);
      toast.error(err.message || "Failed to save part");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this part?")) return;
    try {
        await api.delete(API_ENDPOINTS.PARTS.BY_ID(id));
        toast.success("Part removed");
        fetchParts();
    } catch (err) {
        toast.error("Failed to delete part");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Parts Inventory
            </h1>
            <p className="text-sm text-gray-500">
              Manage spare parts and stock levels
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            <Plus size={16} />
            Add Part
          </button>
        </div>

        <div className="relative mb-6 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parts by name/SKU..."
            className="w-full rounded-lg border border-black/10 pl-9 pr-3 py-2 text-sm"
          />
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading inventory…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/10 p-10 text-center text-sm text-gray-500">
            No parts found
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
                const isLowStock = p.stock <= (p.reorderLevel || 5);
                return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border bg-white p-5 shadow-sm ${isLowStock ? 'border-amber-200 bg-amber-50/30' : 'border-black/5'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{p.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">{p.sku}</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      {p.category}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="font-semibold text-gray-900">
                    ₹{p.price?.toLocaleString()}
                  </p>
                  <div className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${isLowStock ? 'bg-red-100 text-red-700 font-bold' : 'text-gray-500 bg-gray-100'}`}>
                    {isLowStock && <AlertTriangle size={10} />}
                    Stock: {p.stock}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 flex items-center justify-center gap-1 bg-white"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p._id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 bg-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            )})}
          </div>
        )}

        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            >
              <motion.form
                onSubmit={save}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {editing ? "Edit Part" : "Add Part"}
                  </h2>
                  <button type="button" onClick={() => setShowModal(false)}>
                    <X />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label}>Part Name</label>
                    <input
                      className={input}
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={label}>SKU</label>
                    <input
                      className={input}
                      value={form.sku}
                      onChange={(e) =>
                        setForm({ ...form, sku: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                      <label className={label}>Category</label>
                      <select 
                        className={input}
                        value={form.category} 
                        onChange={e => setForm({...form, category: e.target.value})}
                      >
                          <option>Screen</option>
                          <option>Battery</option>
                          <option>Camera</option>
                          <option>Motherboard</option>
                          <option>Accessory</option>
                          <option>General</option>
                      </select>
                  </div>
                  <div>
                      <label className={label}>Supplier</label>
                      <input 
                        className={input}
                        value={form.supplier} 
                        onChange={e => setForm({...form, supplier: e.target.value})} 
                      />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={label}>Description</label>
                    <textarea
                      rows={2}
                      className={input}
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>Unit Price (₹)</label>
                    <input
                      type="number"
                      className={input}
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={label}>Stock Qty</label>
                    <input
                      type="number"
                      className={input}
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="flex-1 rounded-lg bg-black py-2 text-sm text-white hover:bg-gray-900">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border border-black/10 px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


