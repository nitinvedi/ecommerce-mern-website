import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
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

    // Fetch repair by tracking ID
    const fetchRepair = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.REPAIRS.TRACK(id));
        if (response.data) {
          setRepair(response.data);
          setCurrentStatus(response.data.status || 'Pending');
          if (response.data.statusUpdates && response.data.statusUpdates.length > 0) {
            setStatusUpdates(response.data.statusUpdates.map(update => ({
              status: update.status,
              note: update.note || '',
              time: new Date(update.createdAt).toLocaleTimeString(),
            })));
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

    // Connect to socket with repair ID
    socket.emit("join_repair", repair._id);

    socket.on("connect", () => {
      setConnected(true);
    });

    // Receive updates LIVE
    socket.on("repair_update", (data) => {
      if (data.repairId === repair._id) {
        setCurrentStatus(data.status);
        setStatusUpdates((prev) => [
          {
            status: data.status,
            note: data.note || '',
            time: new Date().toLocaleTimeString(),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!repair) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Repair not found</p>
          <Link
            to="/"
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition inline-block"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute top-6 left-6 z-10">
         <button onClick={() => navigate(-1)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">
            <ArrowLeft size={20} />
         </button>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-3xl font-bold">Repair Request Tracking</h1>
          <p className="text-gray-400 mt-1">
            Tracking ID: <span className="text-blue-400 font-medium">{repair.trackingId}</span>
          </p>
          <p className="text-gray-400 mt-1">
            Device: <span className="text-white">{repair.brand} {repair.model}</span>
          </p>

          <p className="mt-2">
            {connected ? (
              <span className="text-green-400">Live Connected</span>
            ) : (
              <span className="text-yellow-400">Connecting...</span>
            )}
          </p>
        </motion.div>

        {/* Current Status Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900 p-5 rounded-xl mb-8 border border-gray-700"
        >
          <h2 className="text-xl font-semibold">Current Status</h2>
          <p className="text-gray-300 mt-2 text-lg">{currentStatus}</p>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-5">
          {statusUpdates.length === 0 && (
            <p className="text-gray-500 text-center">
              Waiting for first update...
            </p>
          )}

          {statusUpdates.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 bg-gray-900 p-4 rounded-xl border border-gray-700"
            >
              {/* Dot */}
              <div className="w-3 h-3 mt-2 rounded-full bg-blue-400"></div>

              {/* Text */}
              <div>
                <p className="text-white font-medium">{item.status}</p>
                {item.note && (
                  <p className="text-gray-400 text-sm mt-1">{item.note}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 space-x-4">
          <Link
            to="/dashboard"
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition inline-block"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/"
            className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition inline-block"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
