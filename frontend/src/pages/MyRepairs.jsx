import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, Clock, CheckCircle, AlertCircle, ArrowRight, Calendar, Search } from "lucide-react";
import { api, API_ENDPOINTS } from "../config/api";

const MyRepairs = () => {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.REPAIRS.MY_REPAIRS);
      setRepairs(response.data || []);
    } catch (error) {
      console.error("Failed to fetch repairs", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "in_progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "diagnosing": return "bg-purple-100 text-purple-700 border-purple-200";
      case "received": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return <CheckCircle size={16} />;
      case "in_progress": return <Wrench size={16} />;
      case "diagnosing": return <Search size={16} />;
      case "received": return <Clock size={16} />;
      case "cancelled": return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredRepairs = repairs.filter(r => 
    r.trackingId.toLowerCase().includes(search.toLowerCase()) || 
    r.model.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] pt-24 pb-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-28 pb-12 font-sans">
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1d1f]">My Repairs</h1>
            <p className="text-gray-500 mt-1">Track and manage your service requests.</p>
          </div>
          <Link 
            to="/repair" 
            className="bg-[#0071e3] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#0077ed] transition-colors inline-flex items-center gap-2"
          >
            <Wrench size={18} /> Book New Repair
          </Link>
        </div>

        {/* Search */}
        {repairs.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-8 shadow-sm border border-gray-200 flex items-center gap-3">
            <Search className="text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Ticket ID or Device Model..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-[#1d1d1f] placeholder:text-gray-400"
            />
          </div>
        )}

        {/* Repairs List */}
        <div className="space-y-4">
          {filteredRepairs.length > 0 ? (
            filteredRepairs.map((repair) => (
              <motion.div
                key={repair._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/status/${repair.trackingId}`)}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#0071e3] group-hover:text-white transition-colors">
                      <Wrench size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg text-[#1d1d1f]">{repair.model}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(repair.status)}`}>
                          {getStatusIcon(repair.status)} {repair.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Ticket ID: <span className="font-medium text-[#1d1d1f]">{repair.trackingId}</span></p>
                      <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                         <Calendar size={12} /> Booked on {new Date(repair.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Right: Action */}
                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-gray-400 uppercase font-bold">Est. Cost</p>
                        <p className="font-semibold text-[#1d1d1f]">
                            {repair.estimatedCost ? `₹${repair.estimatedCost}` : 'Pending Quote'}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#0071e3] group-hover:text-[#0071e3] transition-colors">
                        <ArrowRight size={20} />
                    </div>
                  </div>

                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Wrench size={32} />
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No repairs found</h3>
              <p className="text-gray-500 mb-6">You haven't booked any repairs yet.</p>
              <Link to="/repair" className="text-[#0071e3] font-medium hover:underline">
                Book your first repair &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRepairs;
