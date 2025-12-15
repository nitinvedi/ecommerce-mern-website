import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  X
} from "lucide-react";
import { api, API_ENDPOINTS } from "../../config/api";
import useAuth from "../../hooks/useAuth";
import Navbar from "../../components/Navbar";
import { useToast } from "../../context/ToastContext";

const input =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-black/20";

const label = "text-xs font-medium text-gray-500";

export default function TechnicianProducts() {
  const { user } = useAuth();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    stock: "",
    category: "Mobile",
    isActive: true
  });

  useEffect(() => {
    if (user?.role === "technician") {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.PRODUCTS.BASE);
      const items =
        res?.data?.items ||
        res?.data?.products ||
        res?.data?.data?.items ||
        res?.data?.data ||
        [];
      setProducts(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Fetch products failed", err);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      brand: "",
      description: "",
      price: "",
      stock: "",
      category: "Mobile",
      isActive: true
    });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      brand: p.brand || "",
      description: p.description || "",
      price: p.price || "",
      stock: p.stock || "",
      category: p.category || "Mobile",
      isActive: p.isActive !== false
    });
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images && form.images.length
        ? form.images
        : ["/uploads/products/default.png"]
    };

    try {
      if (editing) {
        await api.put(API_ENDPOINTS.PRODUCTS.BY_ID(editing._id), payload);
        toast.success("Product updated");
      } else {
        await api.post(API_ENDPOINTS.PRODUCTS.BASE, payload);
        toast.success("Product created");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Failed to save product");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Request admin to delete this product?")) return;
    // Technicians cannot hard-delete; surface a friendly message.
    toast.info("Only admins can delete products. Please contact an admin.");
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Technician Products
            </h1>
            <p className="text-sm text-gray-500">
              Add and update products you work with
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            <Plus size={16} />
            Add product
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
            placeholder="Search products..."
            className="w-full rounded-lg border border-black/10 pl-9 pr-3 py-2 text-sm"
          />
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading products…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/10 p-10 text-center text-sm text-gray-500">
            No products found
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-black/5 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{p.name}</h3>
                    <p className="text-xs text-gray-500">{p.brand}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {p.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <p className="font-semibold text-gray-900">
                    ₹{p.price?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Stock: {p.stock}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 flex items-center justify-center gap-1"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p._id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
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
                    {editing ? "Edit product" : "Add product"}
                  </h2>
                  <button type="button" onClick={() => setShowModal(false)}>
                    <X />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label}>Name</label>
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
                    <label className={label}>Brand</label>
                    <input
                      className={input}
                      value={form.brand}
                      onChange={(e) =>
                        setForm({ ...form, brand: e.target.value })
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={label}>Description</label>
                    <textarea
                      rows={3}
                      className={input}
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={label}>Price</label>
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
                    <label className={label}>Stock</label>
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


