import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wrench,
  ShoppingCart,
  Headphones,
  Info,
  ArrowRight,
} from "lucide-react";
import { api, API_ENDPOINTS, SOCKET_URL } from "../config/api";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";

/* ----------------- Helper Components ----------------- */

function ActionCard({ icon: Icon, title, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl bg-white p-5 shadow-sm border hover:shadow-md transition flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-medium text-slate-800">{title}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
    </button>
  );
}

/* ----------------- Main Page ----------------- */

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  /* ----------------- Fetch Data ----------------- */
  useEffect(() => {
    if (!user) return;

    fetchData();
    initSocket();

    return () => socket?.disconnect();
  }, [user]);

  const fetchData = async () => {
    try {
      const [ordersRes, repairsRes] = await Promise.all([
        api.get(API_ENDPOINTS.ORDERS.MY_ORDERS),
        api.get(API_ENDPOINTS.REPAIRS.MY_REPAIRS),
      ]);

      setOrders(ordersRes.data || []);
      setRepairs(repairsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------- Socket ----------------- */
  const initSocket = () => {
    const s = io(SOCKET_URL, { transports: ["websocket"] });

    s.on("repair_update", ({ repairId, status }) => {
      setRepairs((prev) =>
        prev.map((r) => (r._id === repairId ? { ...r, status } : r))
      );
    });

    s.on("order_update", ({ orderId, status }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    });

    setSocket(s);
  };

  /* ----------------- Helpers ----------------- */
  const currentRepair = repairs[0];
  const repairSteps = [
    "Pending",
    "Confirmed",
    "In Progress",
    "Diagnosed",
    "Repairing",
    "Quality Check",
    "Completed",
    "Delivered",
  ];

  const stepIndex = repairSteps.indexOf(currentRepair?.status);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your services…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12 space-y-10">

        {/* ----------------- Welcome ----------------- */}
        <section>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 mt-1">
            {user?.name}
          </h1>
        </section>

        {/* ----------------- HERO STATUS ----------------- */}
        {currentRepair ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-lg"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Current Repair
            </p>

            <h2 className="text-2xl font-semibold mt-2">
              {currentRepair.brand} {currentRepair.model}
            </h2>

            <p className="text-slate-600 mt-1">
              Issue: {currentRepair.issue}
            </p>

            {/* Timeline */}
            <div className="mt-6 space-y-3">
              {repairSteps.map((step, i) => {
                const active = i <= stepIndex;
                return (
                  <div
                    key={step}
                    className={`flex items-center gap-3 text-sm ${
                      active ? "text-green-600" : "text-slate-400"
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        active ? "bg-green-500" : "bg-slate-300"
                      }`}
                    />
                    {step}
                  </div>
                );
              })}
            </div>
          </motion.section>
        ) : (
          <section className="bg-white rounded-3xl p-8 shadow">
            <p className="text-slate-600">
              You don’t have any active repairs.
            </p>
          </section>
        )}

        {/* ----------------- ACTIONS ----------------- */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            icon={Wrench}
            title="Request Repair"
            onClick={() => navigate("/repair")}
          />
          <ActionCard
            icon={ShoppingCart}
            title="My Orders"
            onClick={() => navigate("/orders")}
          />
          <ActionCard
            icon={Headphones}
            title="Support"
            onClick={() => navigate("/contact")}
          />
          <ActionCard
            icon={Info}
            title="Profile"
            onClick={() => navigate("/profile")}
          />
        </section>

        {/* ----------------- HISTORY ----------------- */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Orders */}
          <div className="bg-white rounded-3xl p-6 shadow">
            <h3 className="font-semibold mb-4">Recent Orders</h3>

            {orders.slice(0, 4).map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium">
                    Order #{order._id.slice(-6)}
                  </p>
                  <p className="text-xs text-slate-500">
                    ₹{order.totalPrice?.toLocaleString()}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}

            {orders.length === 0 && (
              <p className="text-sm text-slate-500">No orders yet</p>
            )}
          </div>

          {/* Repairs */}
          <div className="bg-white rounded-3xl p-6 shadow">
            <h3 className="font-semibold mb-4">Repair History</h3>

            {repairs.slice(0, 4).map((r) => (
              <div key={r._id} className="p-3 rounded-xl bg-slate-50 mb-2">
                <p className="text-sm font-medium">
                  {r.brand} {r.model}
                </p>
                <p className="text-xs text-slate-500">{r.status}</p>
              </div>
            ))}

            {repairs.length === 0 && (
              <p className="text-sm text-slate-500">No repair history</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
