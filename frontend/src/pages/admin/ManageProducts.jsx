import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Copy,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Tags,
  CheckSquare,
  Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { api, API_ENDPOINTS, uploadForm } from "../../config/api";
import useAuth from "../../hooks/useAuth";
import AdminLayout from "../../layouts/AdminLayout";

/* ---------------- UI Helpers ---------------- */
const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-black/20";
const labelClass = "text-xs font-medium text-gray-500 mb-1 block";

export default function ManageProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Selection
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modals
  const [showModal, setShowModal] = useState(false); // Create/Edit
  const [showBulkModal, setShowBulkModal] = useState(false); // Bulk Price
  
  const [editing, setEditing] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    isActive: true,
    isRefurbished: false,
    images: [] // existing images URLs
  });
  const [files, setFiles] = useState([]); // new files
  const [bulkAction, setBulkAction] = useState({ type: "increase", value: 0 }); // percentage

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    if (user?.role === "admin") fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.PRODUCTS.BASE);
      // Fixed: sendPaginated returns { data: { items: [...], pagination: {...} } }
      // So products are in res.data.items
      const items = res?.data?.items || []; 
      setProducts(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Actions ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
     if (!window.confirm(`Delete ${selectedIds.size} products?`)) return;
     try {
        await Promise.all([...selectedIds].map(id => api.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id))));
        setSelectedIds(new Set());
        fetchProducts();
     } catch (err) {
        alert("Some deletes failed");
     }
  };

  const handleBulkUpdate = async () => {
     if (bulkAction.value <= 0) return;
     try {
        // In real app, use bulk update endpoint. Here we loop.
        const multiplier = bulkAction.type === "increase" 
           ? 1 + (bulkAction.value / 100) 
           : 1 - (bulkAction.value / 100);
        
        const updates = products.filter(p => selectedIds.has(p._id)).map(p => {
           return api.put(API_ENDPOINTS.PRODUCTS.BY_ID(p._id), {
              ...p,
              price: Math.round(p.price * multiplier)
           });
        });

        await Promise.all(updates);
        setShowBulkModal(false);
        setSelectedIds(new Set());
        fetchProducts();
     } catch (err) {
        alert("Bulk update failed");
     }
  };

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("brand", form.brand);
    fd.append("description", form.description);
    fd.append("price", Number(form.price));
    fd.append("stock", Number(form.stock));
    fd.append("category", form.category);
    fd.append("isActive", form.isActive);
    fd.append("isRefurbished", form.isRefurbished);
    
    if (form.images?.length) {
       fd.append("existingImages", JSON.stringify(form.images)); 
    }
    
    files.forEach((file) => fd.append("productImages", file));

    try {
      if (editing) {
        await uploadForm(API_ENDPOINTS.PRODUCTS.BY_ID(editing._id), fd, "PUT");
      } else {
        await uploadForm(API_ENDPOINTS.PRODUCTS.BASE, fd, "POST");
      }
      setShowModal(false);
      setEditing(null);
      setFiles([]);
      fetchProducts();
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save product");
    }
  };

  const cloneProduct = (product) => {
      setForm({
         ...product,
         name: `${product.name} (Copy)`,
         images: product.images || [], 
      });
      setFiles([]);
      setEditing(null); 
      setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      isActive: product.isActive,
      isRefurbished: product.isRefurbished || false,
      images: product.images || []
    });
    setFiles([]);
    setShowModal(true);
  };

  const toggleSelect = (id) => {
     const next = new Set(selectedIds);
     if (next.has(id)) next.delete(id);
     else next.add(id);
     setSelectedIds(next);
  };

  /* ---------------- Derived ---------------- */
  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);
  
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  /* ---------------- Render ---------------- */
  return (
    <>
      <AdminLayout>
         {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-sm text-gray-500">{products.length} items in inventory</p>
          </div>
          <div className="flex gap-2">
            {selectedIds.size > 0 ? (
               <>
                  <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
                     <Trash2 size={16} /> Delete ({selectedIds.size})
                  </button>
                  <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200">
                     <Tags size={16} /> Update Price
                  </button>
               </>
            ) : (
                <button
                  onClick={() => {
                    setEditing(null);
                    setForm({ name: "", brand: "", description: "", price: "", stock: "", category: "", isActive: true, images: [] });
                    setFiles([]);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  <Plus size={16} /> Add Product
                </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm items-center">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 placeholder="Search products..."
                 className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-black"
              />
           </div>
           <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-black"
           >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
           <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 uppercase text-gray-500 font-semibold text-xs">
                 <tr>
                    <th className="px-6 py-4 w-12 text-center">
                        <button onClick={() => {
                           if (selectedIds.size === filtered.length) setSelectedIds(new Set());
                           else setSelectedIds(new Set(filtered.map(u => u._id)));
                        }}>
                           {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                    </th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filtered.map(p => {
                    const lowStock = p.stock < 10;
                    return (
                       <tr key={p._id} className={`hover:bg-gray-50 transition-colors ${lowStock ? "bg-red-50/30" : ""}`}>
                          <td className="px-6 py-4 text-center">
                             <button onClick={() => toggleSelect(p._id)} className="text-gray-400 hover:text-gray-600">
                                {selectedIds.has(p._id) ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                             </button>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                {p.images?.[0] ? (
                                   <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                ) : (
                                   <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                      <ImageIcon size={16} />
                                   </div>
                                )}
                                <div>
                                   <p className="font-medium text-gray-900">{p.name}</p>
                                   <p className="text-xs text-gray-500">{p.brand}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                {p.category}
                             </span>
                          </td>
                          <td className="px-6 py-4 font-medium">₹{p.price.toLocaleString()}</td>
                          <td className="px-6 py-4">
                             {lowStock ? (
                                <div className="flex items-center gap-1.5 text-red-600 font-medium">
                                   <AlertTriangle size={14} />
                                   {p.stock} Low
                                </div>
                             ) : (
                                <span className="text-green-600 font-medium">{p.stock} in stock</span>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button onClick={() => cloneProduct(p)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg" title="Clone">
                                   <Copy size={16} />
                                </button>
                                <button onClick={() => openEdit(p)} className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg" title="Edit">
                                   <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(p._id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Delete">
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    );
                 })}
              </tbody>
           </table>
           {!loading && filtered.length === 0 && <div className="p-10 text-center text-gray-500">No products found.</div>}
        </div>
      </AdminLayout>

      {/* Create/Edit Modal */}
      <AnimatePresence>
         {showModal && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
               <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-lg font-bold">{editing ? "Edit Product" : "New Product"}</h2>
                     <button onClick={() => setShowModal(false)}><Trash2 className="rotate-45" size={24} /></button>
                  </div>
                  
                  <form onSubmit={save} className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className={labelClass}>Name</label>
                           <input className={inputClass} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                        </div>
                        <div>
                           <label className={labelClass}>Brand</label>
                           <input className={inputClass} value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} required />
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className={labelClass}>Price (₹)</label>
                           <input type="number" className={inputClass} value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                        </div>
                        <div>
                           <label className={labelClass}>Stock</label>
                           <input type="number" className={inputClass} value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
                        </div>
                     </div>

                     <div>
                        <label className={labelClass}>Category</label>
                        <input className={inputClass} value={form.category} onChange={e => setForm({...form, category: e.target.value})} required list="cat-suggestions" />
                        <datalist id="cat-suggestions">
                           {categories.map(c => <option key={c} value={c} />)}
                        </datalist>
                     </div>

                     <div>
                        <label className={labelClass}>Description</label>
                        <textarea className={inputClass} rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                     </div>

                     <div>
                        <label className={labelClass}>Images</label>
                        <div className="flex gap-2 flex-wrap mb-2">
                           {form.images.map((img, i) => (
                              <div key={i} className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden group">
                                 <img src={img} alt="" className="w-full h-full object-cover" />
                                 <button type="button" onClick={() => setForm({...form, images: form.images.filter((_, idx) => idx !== i)})} 
                                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={12} />
                                 </button>
                              </div>
                           ))}
                        </div>
                        <input type="file" multiple onChange={e => setFiles([...e.target.files])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                     </div>

                     <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                           <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} id="isActive" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                           <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Product</label>
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="checkbox" checked={form.isRefurbished} onChange={e => setForm({...form, isRefurbished: e.target.checked})} id="isRefurbished" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                           <label htmlFor="isRefurbished" className="text-sm font-medium text-gray-700">Refurbished</label>
                        </div>
                     </div>

                     <div className="flex gap-3 mt-6">
                        <button type="submit" className="flex-1 bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800">Save Product</button>
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                     </div>
                  </form>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Bulk Price Modal */}
      <AnimatePresence>
         {showBulkModal && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
               <motion.div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
                  <h2 className="text-lg font-bold mb-4">Bulk Price Update</h2>
                  <p className="text-sm text-gray-500 mb-4">Updating {selectedIds.size} products.</p>
                  
                  <div className="space-y-4">
                     <div className="flex gap-2">
                        <button onClick={() => setBulkAction({...bulkAction, type: 'increase'})} 
                           className={`flex-1 py-2 rounded-lg text-sm font-medium ${bulkAction.type === 'increase' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                           <TrendingUp size={16} className="inline mr-1" /> Increase
                        </button>
                        <button onClick={() => setBulkAction({...bulkAction, type: 'decrease'})} 
                           className={`flex-1 py-2 rounded-lg text-sm font-medium ${bulkAction.type === 'decrease' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                           <TrendingDown size={16} className="inline mr-1" /> Decrease
                        </button>
                     </div>
                     <div>
                        <label className={labelClass}>Percentage (%)</label>
                        <input type="number" min="0" max="100" className={inputClass} value={bulkAction.value} onChange={e => setBulkAction({...bulkAction, value: Number(e.target.value)})} />
                     </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                     <button onClick={handleBulkUpdate} className="flex-1 bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800">Apply Update</button>
                     <button onClick={() => setShowBulkModal(false)} className="px-4 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </>
  );
}
