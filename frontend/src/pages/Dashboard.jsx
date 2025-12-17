import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  ShoppingCart,
  Headphones,
  Info,
  ArrowRight,
  X
} from "lucide-react";
import { api, API_ENDPOINTS, SOCKET_URL, uploadFile } from "../config/api";
import useAuth from "../hooks/useAuth";
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

  /* ----------------- Disable scroll when modal open ----------------- */
  useEffect(() => {
    document.body.style.overflow = showRepairForm ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [showRepairForm]);

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

      setOrders(Array.isArray(ordersRes?.data?.data) ? ordersRes.data.data : []);
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

    const required = Object.values(repairForm).every(Boolean);
    if (!required) {
      toast.error("Please fill all fields");
      return;
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
      toast.error("Failed to submit repair");
    } finally {
      setSubmittingRepair(false);
    }
  };

  /* ----------------- Socket ----------------- */
  const initSocket = () => {
    const token = localStorage.getItem("token");
    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token }
    });

    s.on("order_update", ({ orderId, status }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    });

    setSocket(s);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12 space-y-10">

        {/* Actions */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard icon={Wrench} title="Request Repair" onClick={toggleRepairForm} />
          <ActionCard icon={ShoppingCart} title="My Orders" onClick={() => navigate("/orders")} />
          <ActionCard icon={Headphones} title="Support" onClick={() => navigate("/contact")} />
          <ActionCard icon={Info} title="Profile" onClick={() => navigate("/profile")} />
        </section>

        {/* ================= MODAL OVERLAY ================= */}
        <AnimatePresence>
          {showRepairForm && (
            <motion.div
              className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleRepairForm}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-xl space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Request a Repair</h3>
                  <button onClick={toggleRepairForm}>
                    <X />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {Object.entries(repairForm).map(([key, value]) => (
                    <input
                      key={key}
                      value={value}
                      placeholder={key}
                      onChange={(e) =>
                        setRepairForm({ ...repairForm, [key]: e.target.value })
                      }
                      className="rounded-lg border px-3 py-2"
                    />
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={submitRepair}
                    disabled={submittingRepair}
                    className="bg-black text-white px-6 py-2 rounded-lg"
                  >
                    {submittingRepair ? "Submitting…" : "Submit"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
