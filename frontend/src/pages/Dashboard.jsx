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
import { api, API_ENDPOINTS, SOCKET_URL, uploadFile } from "../config/api";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";
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
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [submittingRepair, setSubmittingRepair] = useState(false);
  const [repairForm, setRepairForm] = useState({
    deviceType: "",
    brand: "",
    model: "",
    issue: "",
    problemDescription: "",
    fullName: "",
    phoneNumber: "",
    pickupAddress: "",
    city: "",
    pincode: "",
    pickupDate: "",
    pickupTimeSlot: "",
  });

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

  const toggleRepairForm = () => {
    setShowRepairForm((v) => !v);
  };

  const submitRepair = async () => {
    if (submittingRepair) return;
    const required = [
      "deviceType",
      "brand",
      "model",
      "issue",
      "problemDescription",
      "fullName",
      "phoneNumber",
      "pickupAddress",
      "city",
      "pincode",
      "pickupDate",
      "pickupTimeSlot",
    ];
    for (const field of required) {
      if (!repairForm[field]) {
        toast.error("Please fill all fields");
        return;
      }
    }
    setSubmittingRepair(true);
    try {
      const fd = new FormData();
      Object.entries(repairForm).forEach(([k, v]) => fd.append(k, v));
      await uploadFile(API_ENDPOINTS.REPAIRS.BASE, fd);
      await fetchData();
      setShowRepairForm(false);
      setRepairForm({
        deviceType: "",
        brand: "",
        model: "",
        issue: "",
        problemDescription: "",
        fullName: "",
        phoneNumber: "",
        pickupAddress: "",
        city: "",
        pincode: "",
        pickupDate: "",
        pickupTimeSlot: "",
      });
      toast.success("Repair request submitted");
    } catch (err) {
      console.error("Repair submit failed", err);
      toast.error("Failed to submit repair");
    } finally {
      setSubmittingRepair(false);
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
            onClick={toggleRepairForm}
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

        {showRepairForm && (
          <section className="bg-white rounded-3xl p-6 shadow space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Request a Repair</h3>
              <button
                onClick={toggleRepairForm}
                className="text-sm text-gray-500 hover:text-black"
              >
                Close
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <select
                value={repairForm.deviceType}
                onChange={(e) => setRepairForm({ ...repairForm, deviceType: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2"
              >
                <option value="">Device type</option>
                <option>Mobile</option>
                <option>Tablet</option>
                <option>Laptop</option>
              </select>
              <input
                placeholder="Brand"
                value={repairForm.brand}
                onChange={(e) => setRepairForm({ ...repairForm, brand: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2"
              />
              <input
                placeholder="Model"
                value={repairForm.model}
                onChange={(e) => setRepairForm({ ...repairForm, model: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2"
              />
              <select
                value={repairForm.issue}
                onChange={(e) => setRepairForm({ ...repairForm, issue: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2"
              >
                <option value="">Issue</option>
                <option>Screen Damage</option>
                <option>Battery</option>
                <option>Camera</option>
                <option>Mic</option>
                <option>Not Turning On</option>
                <option>Other</option>
              </select>
              <textarea
                placeholder="Problem description"
                value={repairForm.problemDescription}
                onChange={(e) => setRepairForm({ ...repairForm, problemDescription: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2 md:col-span-2"
                rows={3}
              />
              <input
                placeholder="Full name"
                value={repairForm.fullName}
                onChange={(e) => setRepairForm({ ...repairForm, fullName: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2"
              />
              <input
                placeholder="Phone number"
                value={repairForm.phoneNumber}
                onChange={(e) => setRepairForm({ ...repairForm, phoneNumber: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2"
              />
              <input
                placeholder="Pickup address"
                value={repairForm.pickupAddress}
                onChange={(e) => setRepairForm({ ...repairForm, pickupAddress: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2 md:col-span-2"
              />
              <input
                placeholder="City"
                value={repairForm.city}
                onChange={(e) => setRepairForm({ ...repairForm, city: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2"
              />
              <input
                placeholder="Pincode"
                value={repairForm.pincode}
                onChange={(e) => setRepairForm({ ...repairForm, pincode: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2"
              />
              <input
                type="date"
                value={repairForm.pickupDate}
                onChange={(e) => setRepairForm({ ...repairForm, pickupDate: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2"
              />
              <select
                value={repairForm.pickupTimeSlot}
                onChange={(e) => setRepairForm({ ...repairForm, pickupTimeSlot: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2"
              >
                <option value="">Pickup slot</option>
                <option>9–12</option>
                <option>12–3</option>
                <option>3–6</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={submitRepair}
                disabled={submittingRepair}
                className="rounded-lg bg-black px-5 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-60"
              >
                {submittingRepair ? "Submitting…" : "Submit request"}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
