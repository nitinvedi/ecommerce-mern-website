import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, Search, Edit2, Trash2, User, Clock, CheckCircle2 } from 'lucide-react';
import { api, API_ENDPOINTS } from '../../config/api.js';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import Navbar from '../../components/Navbar.jsx';

export default function ManageRepairs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', note: '' });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchRepairs();
  }, [user, navigate]);

  const fetchRepairs = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.REPAIRS.BASE);
      setRepairs(response.data || []);
    } catch (error) {
      console.error('Error fetching repairs:', error);
      toast.error('Failed to load repairs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRepair || !statusUpdate.status) return;

    try {
      await api.post(API_ENDPOINTS.REPAIRS.STATUS(selectedRepair._id), statusUpdate);
      toast.success('Repair status updated successfully');
      setShowStatusModal(false);
      setSelectedRepair(null);
      setStatusUpdate({ status: '', note: '' });
      fetchRepairs();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update repair status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Delivered':
        return 'bg-green-500/20 text-green-400';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-400';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'In Progress':
      case 'Repairing':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch = repair.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || repair.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-xl">Loading repairs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Manage Repairs</h1>
          <p className="text-slate-400">View and update repair status</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search repairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option>
            <option value="Diagnosed">Diagnosed</option>
            <option value="Repairing">Repairing</option>
            <option value="Quality Check">Quality Check</option>
            <option value="Completed">Completed</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Repairs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepairs.map((repair) => (
            <motion.div
              key={repair._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">{repair.brand} {repair.model}</h3>
                    <p className="text-slate-400 text-sm">ID: {repair.trackingId}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(repair.status)}`}>
                  {repair.status}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p className="text-slate-300"><strong>Issue:</strong> {repair.issue}</p>
                <p className="text-slate-300"><strong>Device:</strong> {repair.deviceType}</p>
                {repair.estimatedRepairCost > 0 && (
                  <p className="text-slate-300"><strong>Est. Cost:</strong> ₹{repair.estimatedRepairCost}</p>
                )}
                <p className="text-slate-400 text-xs">
                  Created: {new Date(repair.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedRepair(repair);
                    setStatusUpdate({ status: repair.status, note: '' });
                    setShowStatusModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Update Status
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRepairs.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-xl">No repairs found</p>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedRepair && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Update Repair Status</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Diagnosed">Diagnosed</option>
                    <option value="Repairing">Repairing</option>
                    <option value="Quality Check">Quality Check</option>
                    <option value="Completed">Completed</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Note (Optional)</label>
                  <textarea
                    value={statusUpdate.note}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, note: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleStatusUpdate}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Update Status
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedRepair(null);
                    setStatusUpdate({ status: '', note: '' });
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

