import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Save, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";
import { api, API_ENDPOINTS } from "../config/api";
import { useToast } from "../context/ToastContext";

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: ""
    }
  });

  /* ---------------- Load profile ---------------- */
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    (async () => {
      try {
        const { data } = await api.get(API_ENDPOINTS.USERS.PROFILE);
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            zip: data.address?.zip || ""
          }
        });
      } catch {
        toast.error("Failed to load profile");
      }
    })();
  }, [user, navigate, toast]);

  /* ---------------- Handlers ---------------- */
  const update = (k, v) => {
    if (k.startsWith("address.")) {
      const field = k.split(".")[1];
      setForm((f) => ({
        ...f,
        address: { ...f.address, [field]: v }
      }));
    } else {
      setForm((f) => ({ ...f, [k]: v }));
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!form.name || form.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Enter a valid email");
      return;
    }
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      toast.error("Enter a valid 10-digit phone");
      return;
    }
    setLoading(true);
    try {
      await api.put(API_ENDPOINTS.USERS.PROFILE, form);
      await refreshProfile();
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      toast.error("Fill all password fields");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setChangingPwd(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      toast.success("Password updated");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setChangingPwd(false);
    }
  };

  if (!user) return null;

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-500">
              Manage your personal information
            </p>
          </div>

          <button
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 transition"
          >
            <Pencil size={16} />
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white border border-black/5 shadow-sm p-8"
        >
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-semibold">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>

            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={saveProfile} className="space-y-8">
            {/* Basic */}
            <Section title="Basic information">
              <Field
                icon={<User size={16} />}
                label="Full name"
                value={form.name}
                disabled={!editing}
                onChange={(v) => update("name", v)}
              />
              <Field
                icon={<Mail size={16} />}
                label="Email"
                value={form.email}
                disabled={!editing}
                onChange={(v) => update("email", v)}
              />
              <Field
                icon={<Phone size={16} />}
                label="Phone"
                value={form.phone}
                disabled={!editing}
                onChange={(v) => update("phone", v)}
              />
            </Section>

            {/* Address */}
            <Section title="Address">
              <Field
                icon={<MapPin size={16} />}
                label="Street"
                value={form.address.street}
                disabled={!editing}
                onChange={(v) => update("address.street", v)}
              />
              <div className="grid md:grid-cols-3 gap-4">
                <Field
                  label="City"
                  value={form.address.city}
                  disabled={!editing}
                  onChange={(v) => update("address.city", v)}
                />
                <Field
                  label="State"
                  value={form.address.state}
                  disabled={!editing}
                  onChange={(v) => update("address.state", v)}
                />
                <Field
                  label="ZIP"
                  value={form.address.zip}
                  disabled={!editing}
                  onChange={(v) => update("address.zip", v)}
                />
              </div>
            </Section>

            {/* Save */}
            {editing && (
              <div className="pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-900 transition disabled:opacity-60"
                >
                  <Save size={16} />
                  {loading ? "Saving…" : "Save changes"}
                </button>
              </div>
            )}
          </form>

        {/* Change password */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Change password
          </h3>
          <form onSubmit={changePassword} className="grid md:grid-cols-3 gap-4">
            <input
              type="password"
              placeholder="Current password"
              value={pwdForm.currentPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm"
            />
            <input
              type="password"
              placeholder="New password"
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={pwdForm.confirmPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm"
            />
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={changingPwd}
                className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60"
              >
                {changingPwd ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------- Reusable UI ---------------- */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, disabled, icon }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition
            ${icon ? "pl-10" : ""}
            ${disabled ? "bg-gray-50 text-gray-500" : "focus:ring-2 focus:ring-black/20"}
          `}
        />
      </div>
    </div>
  );
}
