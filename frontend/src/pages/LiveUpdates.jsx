import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import io from "socket.io-client";

const socket = io("http://localhost:4000"); // change to your backend URL

export default function LiveUpdates() {
  const { id } = useParams();

  const [statusUpdates, setStatusUpdates] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("Connecting...");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Connect
    socket.emit("join_repair", id);

    socket.on("connect", () => {
      setConnected(true);
    });

    // Receive updates LIVE
    socket.on("repair_update", (data) => {
      setCurrentStatus(data.status);
      setStatusUpdates((prev) => [
        {
          status: data.status,
          note: data.note,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    });

    return () => {
      socket.emit("leave_repair", id);
      socket.off("repair_update");
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-5 py-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-3xl font-bold">Repair Request Submitted</h1>
          <p className="text-gray-400 mt-1">
            Tracking ID: <span className="text-blue-400 font-medium">{id}</span>
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
        <div className="text-center mt-10">
          <Link
            to="/"
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
