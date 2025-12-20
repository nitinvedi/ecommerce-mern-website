import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Save, DollarSign, PenTool, CheckCircle } from "lucide-react";
import { api, API_ENDPOINTS, SOCKET_URL } from "../../config/api";
import { useToast } from "../../context/ToastContext";
import useAuth from "../../hooks/useAuth";

export default function TechnicianJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit States
  const [status, setStatus] = useState("");
  const [finalCost, setFinalCost] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.REPAIRS.BY_ID(id));
      const data = res.data;
      setJob(data);
      
      // Init states
      setStatus(data.status);
      setFinalCost(data.finalRepairCost || "");
    } catch (error) {
      toast.error("Failed to load job details");
      navigate("/technician/jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
        const promises = [];

        // 1. Update Status & Note
        if (status !== job.status || note) {
            promises.push(api.post(API_ENDPOINTS.REPAIRS.STATUS(id), {
                status,
                note
            }));
        }

        // 2. Update Cost (General Update)
        // Only if cost changed or status is becoming Completed (require cost?)
        if (finalCost !== job.finalRepairCost) {
            promises.push(api.put(API_ENDPOINTS.REPAIRS.BY_ID(id), {
                finalRepairCost: Number(finalCost)
            }));
        }

        if (promises.length > 0) {
            await Promise.all(promises);
            toast.success("Job updated successfully");
            setNote(""); // Clear note after sending
            fetchJob(); // Refresh
        } else {
            toast.info("No changes to save");
        }

    } catch (error) {
        console.error(error);
        toast.error("Failed to update job");
    } finally {
        setSaving(false);
    }
  };

  const statusOptions = [
    "Confirmed",
    "Diagnosed",
    "Repairing",
    "Quality Check",
    "Completed",
    "Delivered"
  ];

  if (loading) return <div className="p-10 text-center">Loading job details...</div>;
  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/technician/jobs')} className="p-2 hover:bg-gray-100 rounded-full transition">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    {job.brand} {job.model}
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {job.trackingId}
                    </span>
                </h1>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                job.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
                {job.status}
            </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Job Info */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={18} /> Customer Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-medium">{job.fullName}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium text-blue-600">{job.phoneNumber}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Address</p>
                        <p className="font-medium">{job.pickupAddress}, {job.city}</p>
                    </div>
                </div>
            </div>

            {/* Device Issue */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <PenTool size={18} /> Diagnostics
                </h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Reported Issue</p>
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                            {job.issue}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Problem Description</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {job.problemDescription}
                        </p>
                    </div>
                    {/* Images */}
                    {job.images && job.images.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Attached Images</p>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {job.images.map((img, i) => (
                                    <img 
                                        key={i} 
                                        src={img.startsWith('http') ? img : `${SOCKET_URL}${img}`} 
                                        alt="Device" 
                                        className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* History Timeline */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar size={18} /> History
                </h3>
                <div className="space-y-4">
                    {job.statusUpdates?.slice().reverse().map((update, idx) => (
                        <div key={idx} className="flex gap-3">
                            <div className="mt-1.5 w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{update.status}</p>
                                {update.note && <p className="text-xs text-gray-500 mt-0.5">{update.note}</p>}
                                <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(update.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-6">Job Actions</h3>
                
                <div className="space-y-5">
                    {/* Update Status */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Update Status
                        </label>
                        <select 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 outline-none"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Final Cost */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Final Repair Cost (₹)
                        </label>
                        <div className="relative">
                            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="number" 
                                value={finalCost} 
                                onChange={(e) => setFinalCost(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-8 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 outline-none font-medium"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Est. Cost: ₹{job.estimatedRepairCost}</p>
                    </div>

                    {/* Add Note */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Add Internal Note
                        </label>
                        <textarea 
                            rows={3} 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Describe diagnostics or work done..."
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 outline-none resize-none"
                        />
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : <><Save size={16} /> Save Changes</>}
                    </button>
                    
                    {status === 'Completed' && !finalCost && (
                         <p className="text-center text-xs text-red-500">
                            Please set final cost before completing.
                        </p>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
