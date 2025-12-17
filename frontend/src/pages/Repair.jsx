import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { API_ENDPOINTS, uploadFile } from "../config/api";

/* ---------------- Config ---------------- */
const STEPS = [
  { title: "Device", subtitle: "Tell us about your device" },
  { title: "Problem", subtitle: "Describe the issue" },
  { title: "Pickup", subtitle: "Pickup details" },
  { title: "Review", subtitle: "Confirm & submit" },
];

const input =
  "w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/20 transition";

const label = "text-xs font-medium text-gray-500";

const pageVariants = {
  initial: (d) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
  animate: { opacity: 1, x: 0 },
  exit: (d) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
};

export default function Repair() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [authModal, setAuthModal] = useState(false);

  const [formData, setFormData] = useState({
    deviceType: "",
    brand: "",
    model: "",
    deviceColor: "",
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ---------------- Validation (Toast only) ---------------- */
  const validateStep = () => {
    if (step === 0) {
      if (!formData.deviceType)
        return toast.error("Please select a device type"), false;
      if (!formData.brand)
        return toast.error("Brand is required"), false;
      if (!formData.model)
        return toast.error("Model is required"), false;
    }

    if (step === 1) {
      if (!formData.issue)
        return toast.error("Please select an issue"), false;
      if (!formData.problemDescription)
        return toast.error("Please describe the problem"), false;
    }

    if (step === 2) {
      if (!formData.fullName)
        return toast.error("Full name is required"), false;
      if (!/^\d{10}$/.test(formData.phoneNumber))
        return toast.error("Enter a valid 10-digit phone number"), false;
      if (!formData.pickupAddress)
        return toast.error("Pickup address is required"), false;
      if (!formData.city)
        return toast.error("City is required"), false;
      if (!/^\d{6}$/.test(formData.pincode))
        return toast.error("Invalid pincode"), false;
      if (!formData.pickupDate)
        return toast.error("Pickup date is required"), false;
      if (!formData.pickupTimeSlot)
        return toast.error("Please select a pickup time slot"), false;
    }

    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setDirection(1);
    setStep((s) => s + 1);
  };

  const back = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const submit = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      setAuthModal(true);
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));

      await uploadFile(API_ENDPOINTS.REPAIRS.BASE, fd);

      toast.success("Repair request submitted successfully");
      navigate("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex gap-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i <= step ? "bg-black" : "bg-black/10"
                }`}
              />
            ))}
          </div>

          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            {STEPS[step].title}
          </h1>
          <p className="text-sm text-gray-500">
            {STEPS[step].subtitle}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white border border-black/5 p-8 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {step === 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={label}>Device type</label>
                    <select name="deviceType" onChange={handleChange} className={input}>
                      <option value="">Select</option>
                      <option>Mobile</option>
                      <option>Tablet</option>
                      <option>Laptop</option>
                    </select>
                  </div>
                  <div>
                    <label className={label}>Brand</label>
                    <input name="brand" onChange={handleChange} className={input} />
                  </div>
                  <div>
                    <label className={label}>Model</label>
                    <input name="model" onChange={handleChange} className={input} />
                  </div>
                  <div>
                    <label className={label}>Color (optional)</label>
                    <input name="deviceColor" onChange={handleChange} className={input} />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className={label}>Issue</label>
                    <select name="issue" onChange={handleChange} className={input}>
                      <option value="">Select</option>
                      <option>Screen</option>
                      <option>Battery</option>
                      <option>Camera</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={label}>Description</label>
                    <textarea
                      rows={4}
                      name="problemDescription"
                      onChange={handleChange}
                      className={input}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <input name="fullName" placeholder="Full name" onChange={handleChange} className={input} />
                  <input name="phoneNumber" placeholder="Phone number" onChange={handleChange} className={input} />
                  <textarea
                    rows={3}
                    name="pickupAddress"
                    placeholder="Pickup address"
                    onChange={handleChange}
                    className={`${input} md:col-span-2`}
                  />
                  <input name="city" placeholder="City" onChange={handleChange} className={input} />
                  <input name="pincode" placeholder="Pincode" onChange={handleChange} className={input} />
                  <input type="date" name="pickupDate" onChange={handleChange} className={input} />
                  <select name="pickupTimeSlot" onChange={handleChange} className={input}>
                    <option value="">Time slot</option>
                    <option>9–12</option>
                    <option>12–3</option>
                    <option>3–6</option>
                  </select>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3 text-sm">
                  {Object.entries(formData).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b py-2">
                      <span className="text-gray-500 capitalize">
                        {k.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span>{v || "-"}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-10 flex items-center justify-between">
            {step > 0 && (
              <button onClick={back} className="text-sm text-gray-500 hover:text-black">
                ← Back
              </button>
            )}

            <button
              onClick={step < 3 ? next : submit}
              disabled={loading}
              className="ml-auto rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60"
            >
              {step < 3 ? "Continue" : loading ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </div>
      </div>

      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
    </div>
  );
}
