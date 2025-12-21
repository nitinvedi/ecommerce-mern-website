import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, Wrench, Search, Package, MessageSquare, AlertCircle } from "lucide-react";
import io from "socket.io-client";
import { SOCKET_URL, api, API_ENDPOINTS } from "../config/api.js";

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling']
});

export default function LiveUpdates() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("Loading...");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchRepair = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.REPAIRS.TRACK(id));
        if (response.data) {
          setRepair(response.data);
          setCurrentStatus(response.data.status || 'Pending');
          if (response.data.statusUpdates?.length > 0) {
            setStatusUpdates(response.data.statusUpdates.map(update => ({
              status: update.status,
              note: update.note || '',
              time: update.createdAt,
            })).reverse()); // Show newest first
          }
        }
      } catch (error) {
        console.error('Error fetching repair:', error);
        setCurrentStatus('Not Found');
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [id]);

  useEffect(() => {
    if (!repair?._id) return;

    socket.emit("join_repair", repair._id);
    socket.on("connect", () => setConnected(true));

    socket.on("repair_update", (data) => {
      if (data.repairId === repair._id) {
        setCurrentStatus(data.status);
        setStatusUpdates((prev) => [
          {
            status: data.status,
            note: data.note || '',
            time: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    });

    return () => {
      socket.emit("leave_repair", repair._id);
      socket.off("repair_update");
    };
  }, [repair]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle2 className="text-green-500" />;
      case 'in_progress': return <Wrench className="text-blue-500" />;
      case 'diagnosing': return <Search className="text-purple-500" />;
      case 'received': return <Clock className="text-yellow-500" />;
      default: return <Clock className="text-gray-400" />;
    }
  };

  const getStatusStep = (current) => {
    const steps = ['Pending', 'Received', 'Diagnosing', 'In_Progress', 'Completed'];
    return steps.indexOf(current) + 1;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
         <div className="w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!repair) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
             <AlertCircle size={40} className="text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Repair Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't find a repair ticket with ID: <span className="font-mono font-medium text-black">{id}</span></p>
        <button onClick={() => navigate('/')} className="text-[#0071e3] font-medium hover:underline">
            Return Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans pt-20 pb-12">
      {/* Navbar Placeholder for spacing */}
      
      <div className="max-w-[800px] mx-auto px-6">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#0071e3] font-medium mb-8 hover:underline">
            <ArrowLeft size={18} /> Back
        </button>

        {/* Header Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-200 mb-6 relative overflow-hidden"
        >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-600 mb-3">
                        {connected ? <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> : <span className="w-2 h-2 rounded-full bg-gray-400"/>}
                        {connected ? "Live Connection" : "Offline"}
                    </div>
                    <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">{repair.deviceType} Repair</h1>
                    <p className="text-gray-500 text-lg">{repair.brand} {repair.model} • <span className="font-mono text-black">{repair.trackingId}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <div className="text-2xl font-bold text-[#0071e3] capitalize">{currentStatus.replace('_', ' ')}</div>
                </div>
            </div>
            {/* Soft Bg Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-200 mb-6"
        >
             <div className="relative h-2 bg-gray-100 rounded-full mb-12 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(getStatusStep(currentStatus) / 5) * 100}%` }}
                    className="absolute top-0 left-0 h-full bg-[#0071e3]"
                />
             </div>
             
             <div className="grid grid-cols-5 gap-2 text-center text-xs font-medium text-gray-400">
                {['Pending', 'Received', 'Diagnosing', 'In Progress', 'Completed'].map((s, i) => (
                    <div key={i} className={`flex flex-col items-center gap-2 ${getStatusStep(currentStatus) > i ? 'text-[#1d1d1f]' : ''}`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${getStatusStep(currentStatus) > i ? 'border-[#0071e3] bg-[#0071e3] text-white' : 'border-gray-200 bg-white'}`}>
                             {getStatusStep(currentStatus) > i ? <CheckCircle2 size={16} /> : i + 1}
                         </div>
                         <span className="hidden md:block">{s}</span>
                    </div>
                ))}
             </div>
        </motion.div>

        {/* Timeline Updates */}
        <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
        >
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-6 px-2">Activity Log</h3>
            <div className="space-y-6 pl-4 border-l-2 border-gray-200 ml-4">
                {statusUpdates.map((update, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative pl-8 pb-2"
                    >
                        <div className="absolute top-0 left-[-21px] w-10 h-10 bg-white border-4 border-[#f5f5f7] rounded-full flex items-center justify-center text-[#0071e3]">
                            {getStatusIcon(update.status)}
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                             <div className="flex justify-between items-start mb-2">
                                 <h4 className="font-bold text-[#1d1d1f] capitalize">{update.status.replace('_', ' ')}</h4>
                                 <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                     {new Date(update.time).toLocaleDateString()} • {new Date(update.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                             </div>
                             {update.note && (
                                 <div className="flex gap-3 mt-3 bg-blue-50/50 p-3 rounded-xl">
                                     <MessageSquare size={16} className="text-[#0071e3] mt-1 shrink-0" />
                                     <p className="text-sm text-gray-600 leading-relaxed">{update.note}</p>
                                 </div>
                             )}
                        </div>
                    </motion.div>
                ))}
                
                {statusUpdates.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No updates yet. Your device is in the queue.
                    </div>
                )}
            </div>
        </motion.div>

      </div>
    </div>
  );
}
