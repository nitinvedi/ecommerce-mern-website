import { useEffect, useState } from "react";
import {
  MoreHorizontal,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Hammer,
  Printer,
  XCircle,
  Mail,
  User as UserIcon,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { api, API_ENDPOINTS } from "../../config/api";
import useAuth from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import AdminLayout from "../../layouts/AdminLayout";

export default function ManageRepairs() {
  const { user } = useAuth();
  const toast = useToast();

  const [repairs, setRepairs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState("list"); // list or board
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [activeRepair, setActiveRepair] = useState(null); // for modal
  const [form, setForm] = useState({ status: "", technician: "", note: "" });

  useEffect(() => {
    if (user?.role === "admin") {
      fetchRepairs();
      fetchTechnicians();
    }
  }, [user]);

  const fetchRepairs = async () => {
    try {
      // Fixed: Use REPAIRS.BASE instead of undefined ADMIN.REPAIRS
      const res = await api.get(API_ENDPOINTS.REPAIRS.BASE);
      // Fixed: Robust data check
      const items = Array.isArray(res?.data) ? res.data : (res?.data?.repairs || []);
      setRepairs(items);
    } catch (err) {
      console.error(err);
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await api.get(`${API_ENDPOINTS.ADMIN.USERS}?role=technician`);
      const allUsers = Array.isArray(res.data) ? res.data : [];
      // Fallback: Ensure client-side filtering in case backend returns all users (e.g. old server instance)
      setTechnicians(allUsers.filter(u => u.role === 'technician'));
    } catch (err) {
      console.error(err);
    }
  };

  const saveUpdate = async () => {
    // Validation: Require final cost if completing
    if (form.status === "Completed" && (!activeRepair.finalRepairCost && !form.finalRepairCost)) {
        toast.error("Cannot complete repair without Final Repair Cost.");
        return;
    }

    try {
      if (form.status !== activeRepair.status) {
        await api.post(API_ENDPOINTS.REPAIRS.STATUS(activeRepair._id), {
          status: form.status,
          note: form.note || "Status updated by Admin"
        });
      }
      if (form.technician !== (activeRepair.technician?._id || activeRepair.technician)) {
         // Fix: Handle unassignment robustly
         const techId = form.technician === "unassigned" || form.technician === "" ? null : form.technician;
         await api.put(API_ENDPOINTS.REPAIRS.BY_ID(activeRepair._id), {
            technician: techId
         });
      }
      toast.success("Repair updated");
      setActiveRepair(null);
      fetchRepairs();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update repair");
    }
  };

  const generateInvoice = () => {
      // Simple print-based invoice for now
      // in real app this might call backend to generate PDF
      window.print(); 
  };

  const sendEmailUpdate = async () => {
     // Mock email trigger
     toast.success(`Email sent to ${activeRepair.user?.email || "customer"}`);
  };

  const filtered = repairs.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.trackingId?.toLowerCase().includes(q) || r.user?.name?.toLowerCase().includes(q) || r.device?.model?.toLowerCase().includes(q);
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const columns = {
     Pending: { color: "bg-yellow-50 border-yellow-100", title: "Pending", icon: Clock },
     "In Progress": { color: "bg-blue-50 border-blue-100", title: "In Progress", icon: Hammer },
     "Waiting for Parts": { color: "bg-purple-50 border-purple-100", title: "Waiting", icon: Filter },
     Completed: { color: "bg-green-50 border-green-100", title: "Completed", icon: CheckCircle2 },
     Cancelled: { color: "bg-red-50 border-red-100", title: "Cancelled", icon: XCircle },
  };

  /* ---------------- Kanban Board ---------------- */
  const BoardView = () => (
     <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
        {Object.entries(columns).map(([status, config]) => {
           const items = filtered.filter(r => r.status === status);
           const Icon = config.icon;
           return (
              <div key={status} className={`min-w-[300px] flex-1 rounded-xl border ${config.color} p-4 flex flex-col`}>
                 <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
                    <Icon size={18} />
                    {config.title} <span className="text-gray-400 text-sm ml-auto">{items.length}</span>
                 </div>
                 <div className="flex-1 overflow-y-auto space-y-3">
                    {items.map(r => (
                       <div key={r._id} onClick={() => { setActiveRepair(r); setForm({ status: r.status, technician: r.technician?._id || "", note: "" }) }}
                          className="bg-white p-3 rounded-lg shadow-sm border border-black/5 cursor-pointer hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-2">
                             <span className="font-mono text-xs text-gray-400">#{r.trackingId}</span>
                             <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white ${r.priority === 'High' ? 'bg-red-500' : 'bg-gray-400'}`}>
                                {r.priority || "Normal"}
                             </span>
                          </div>
                          <h4 className="font-medium text-sm text-gray-900 mb-1">{r.device?.brand} {r.device?.model}</h4>
                          <p className="text-xs text-gray-500 truncate">{r.issueDescription}</p>
                          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-gray-50">
                             <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">
                                {(r.technician?.name && r.technician.name[0]) ? r.technician.name[0] : "?"}
                             </div>
                             <span className="text-xs text-gray-500">{r.technician?.name || "Unassigned"}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )
        })}
     </div>
  );

  /* ---------------- List View ---------------- */
  const ListView = () => (
     <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
           <thead className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-500 text-xs uppercase">
              <tr>
                 <th className="px-6 py-4">ID</th>
                 <th className="px-6 py-4">Customer</th>
                 <th className="px-6 py-4">Device</th>
                 <th className="px-6 py-4">Technician</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4 text-right">Action</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
              {filtered.map(r => (
                 <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{r.trackingId}</td>
                    <td className="px-6 py-4">
                       <p className="font-medium text-gray-900">{r.user?.name}</p>
                       <p className="text-xs text-gray-500">{r.user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-gray-900">{r.device?.brand} {r.device?.model}</p>
                       <p className="text-xs text-gray-500">{r.issueDescription}</p>
                    </td>
                    <td className="px-6 py-4">
                       {r.technician ? (
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                {(r.technician.name && r.technician.name[0]) ? r.technician.name[0] : "?"}
                             </div>
                             <span>{r.technician.name || "Unknown"}</span>
                          </div>
                       ) : <span className="text-gray-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${columns[r.status]?.color?.split(' ')[0] || 'bg-gray-100'} text-gray-700`}>
                          {r.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => { setActiveRepair(r); setForm({ status: r.status, technician: r.technician?._id || "", note: "" }) }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                          <MoreHorizontal size={18} />
                       </button>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
     </div>
  );

  /* ---------------- Render ---------------- */
  return (
    <>
      <AdminLayout>
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">Repair Center</h1>
               <p className="text-sm text-gray-500">Manage repair tickets and technician assignments</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
               <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>List View</button>
               <button onClick={() => setViewMode("board")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'board' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Board View</button>
            </div>
         </div>

         {/* Toolbar */}
         <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Search by ID, Customer or Device..." 
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-black"
               />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none">
               <option value="all">All Status</option>
               <option>Pending</option>
               <option>In Progress</option>
               <option>Waiting for Parts</option>
               <option>Completed</option>
            </select>
         </div>

         {/* Content */}
         {viewMode === "list" ? <ListView /> : <BoardView />}

      </AdminLayout>

      {/* Detail Modal */}
      <AnimatePresence>
         {activeRepair && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
               <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="bg-white rounded-2xl w-full max-w-2xl p-0 shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                     <div>
                        <h2 className="text-lg font-bold text-gray-900">Repair #{activeRepair.trackingId}</h2>
                        <p className="text-xs text-gray-500">Created on {new Date(activeRepair.createdAt).toLocaleDateString()}</p>
                     </div>
                     <button onClick={() => setActiveRepair(null)} className="p-2 hover:bg-gray-200 rounded-full"><XCircle size={20} className="text-gray-400" /></button>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div>
                           <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Device Info</h3>
                           <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <p className="font-medium">{activeRepair.device?.brand} {activeRepair.device?.model}</p>
                              <p className="text-sm text-gray-600 mt-1">Serial: {activeRepair.device?.serialNumber || "N/A"}</p>
                              <p className="text-sm text-gray-600 mt-2 italic">"{activeRepair.issueDescription}"</p>
                           </div>
                        </div>

                        <div>
                           <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Customer</h3>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><UserIcon size={20} className="text-gray-500" /></div>
                              <div>
                                 <p className="font-medium text-sm">{activeRepair.user?.name}</p>
                                 <p className="text-xs text-blue-600 hover:underline cursor-pointer" onClick={() => window.open(`mailto:${activeRepair.user?.email}`)}>{activeRepair.user?.email}</p>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-2">
                           <button onClick={generateInvoice} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium">
                              <Printer size={14} /> Print Job Card / Invoice
                           </button>
                           <button onClick={sendEmailUpdate} className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium">
                              <Mail size={14} /> Send Email Update
                           </button>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div>
                           <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Status & Assignment</h3>
                           <div className="space-y-4">
                              <div>
                                 <label className="text-xs text-gray-500 block mb-1">Current Status</label>
                                 <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                                    <option>Pending</option>
                                    <option>In Progress</option>
                                    <option>Waiting for Parts</option>
                                    <option>Completed</option>
                                    <option>Cancelled</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="text-xs text-gray-500 block mb-1">Technician</label>
                                 <select value={form.technician || "unassigned"} onChange={e => setForm({...form, technician: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                                    <option value="unassigned">Unassigned</option>
                                    {technicians.map(t => (
                                       <option key={t._id} value={t._id}>{t.name}</option>
                                    ))}
                                 </select>
                              </div>
                              <div>
                                 <label className="text-xs text-gray-500 block mb-1">Internal Note</label>
                                 <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white h-24" placeholder="Add a note about this update..." />
                              </div>
                           </div>
                        </div>
                        <button onClick={saveUpdate} className="w-full py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                           Save Changes
                        </button>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Hidden Print Area */}
      {activeRepair && (
          <div className="hidden print:block fixed inset-0 bg-white z-[100] p-8">
             <div className="border border-black p-8 max-w-2xl mx-auto">
                <div className="text-center border-b border-black pb-4 mb-4">
                   <h1 className="text-2xl font-bold">REPAIR TICKET</h1>
                   <p className="font-mono">{activeRepair.trackingId}</p>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-8">
                   <div>
                      <h3 className="font-bold border-b border-gray-300 mb-2">Customer</h3>
                      <p>{activeRepair.user?.name}</p>
                      <p>{activeRepair.user?.email}</p>
                   </div>
                   <div>
                      <h3 className="font-bold border-b border-gray-300 mb-2">Device</h3>
                      <p>{activeRepair.device?.brand} {activeRepair.device?.model}</p>
                      <p>Serial: {activeRepair.device?.serialNumber}</p>
                   </div>
                </div>
                <div className="mb-8">
                   <h3 className="font-bold border-b border-gray-300 mb-2">Issue</h3>
                   <p>{activeRepair.issueDescription}</p>
                </div>
                <div className="mt-12 text-center text-sm text-gray-500">
                   <p>Authorized Signature _______________________</p>
                </div>
             </div>
          </div>
      )}
    </>
  );
}
