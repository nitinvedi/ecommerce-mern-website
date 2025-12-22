import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "../context/ToastContext.jsx";
import { getErrorMessage } from "../utils/errorHandler.js";

import { api, API_ENDPOINTS } from "../config/api.js";
import { validate, validateForm } from "../utils/validation.js";

export default function Contact() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: newErrors } = validateForm(form, {
        name: validate.name,
        email: validate.email,
        message: (v) => validate.required(v, "Message")
    });
    setErrors(newErrors);

    if (!isValid) {
      toast.error("Please fix errors");
      return;
    }

    try {
      setLoading(true);

      await api.post(API_ENDPOINTS.USERS.CONTACT, {
        name: form.name,
        email: form.email,
        message: form.message,
      });

      toast.success("Message sent. We’ll reply shortly.");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send message"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ================= Left ================= */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
              Let’s talk.
            </h1>

            <p className="mt-6 text-lg text-gray-500 max-w-md">
              Questions about repairs, parts, or partnerships?
              Our team usually replies within a few hours.
            </p>

            <div className="mt-10 space-y-4 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div className="flex flex-col">
                  <span>Shop No.- 302, Model Town,</span>
                  <span>Near Shiv Chowk, Rewari (Hr.)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                Rammobiles2021@gmail.com
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div className="flex flex-col">
                    <span>+91 7015313247</span>
                    <span>+91 8684085974</span>
                </div>
              </div>
            </div>

            <p className="mt-12 text-xs text-gray-400">
              Mon–Sat · 9am–7pm IST
            </p>
          </motion.div>

          {/* ================= Form ================= */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="bg-white rounded-2xl border border-black/5 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs text-gray-500">Your name</label>
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  className={`w-full bg-transparent border-b py-2 text-sm focus:outline-none ${errors.name ? 'border-red-500' : 'border-black/10 focus:border-black'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs text-gray-500">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  className={`w-full bg-transparent border-b py-2 text-sm focus:outline-none ${errors.email ? 'border-red-500' : 'border-black/10 focus:border-black'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs text-gray-500">Message</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-black/10 py-2 text-sm resize-none focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-full bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-900 transition disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send message"}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
