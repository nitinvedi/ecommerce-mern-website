import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, MapPin, Save, Pencil, Lock, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { api, API_ENDPOINTS } from "../config/api";
import { useToast } from "../context/ToastContext";

import DashboardSidebar from "../components/DashboardSidebar.jsx";

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
    if (!form.name || form.name.trim().length < 2) {
      return toast.error("Name must be at least 2 characters");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return toast.error("Enter a valid email");
    }
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      return toast.error("Enter a valid 10-digit phone");
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
      return toast.error("Fill all password fields");
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return toast.error("New passwords do not match");
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">


      <div className="flex max-w-[1600px] mx-auto">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-12 pt-24">
           
           <div className="mb-8 flex items-center justify-between">
              <div>
                 <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                 <p className="text-gray-500">Manage your account settings and preferences.</p>
              </div>
              <button
                 onClick={() => setEditing(!editing)}
                 className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${
                    editing 
                       ? "bg-red-50 text-red-600 border border-red-100" 
                       : "bg-black text-white hover:bg-gray-900"
                 }`}
              >
                 <Pencil size={16} />
                 {editing ? "Cancel Editing" : "Edit Profile"}
              </button>
           </div>

           <div className="grid lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: Avatar & Quick Stats */}
              <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                    <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">
                       {user.name?.[0]?.toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500 mb-6">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 py-2 rounded-full">
                       <Mail size={16} />
                       {user.email}
                    </div>
                 </div>

                 {/* Password Reset */}
                 <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                       <Lock size={20} className="text-gray-400" /> Security
                    </h3>
                    <form onSubmit={changePassword} className="space-y-4">
                       <div>
                          <input
                             type="password"
                             value={pwdForm.currentPassword}
                             onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                             placeholder="Current Password"
                             className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black/10 outline-none text-sm transition-all"
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <input
                             type="password"
                             value={pwdForm.newPassword}
                             onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                             placeholder="New"
                             className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black/10 outline-none text-sm transition-all"
                          />
                          <input
                             type="password"
                             value={pwdForm.confirmPassword}
                             onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                             placeholder="Confirm"
                             className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black/10 outline-none text-sm transition-all"
                          />
                       </div>
                       <button
                          disabled={changingPwd}
                          className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                       >
                          <KeyRound size={16} />
                          {changingPwd ? "Updating..." : "Update Password"}
                       </button>
                    </form>
                 </div>
              </div>

              {/* RIGHT COLUMN: Details Form */}
              <div className="lg:col-span-2">
                 <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full">
                    <form onSubmit={saveProfile} className="space-y-8">
                       {/* Personal Info */}
                       <div>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                             <User size={16} /> Personal Information
                          </h3>
                          <div className="grid md:grid-cols-2 gap-6">
                             <Field
                                label="Full Name"
                                value={form.name}
                                onChange={(v) => update("name", v)}
                                disabled={!editing}
                             />
                             <Field
                                label="Email Address"
                                value={form.email}
                                onChange={(v) => update("email", v)}
                                disabled={!editing}
                             />
                             <Field
                                label="Phone Number"
                                value={form.phone}
                                onChange={(v) => update("phone", v)}
                                disabled={!editing}
                                placeholder="+91"
                             />
                          </div>
                       </div>

                       <div className="h-px bg-gray-100" />

                       {/* Address */}
                       <div>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                             <MapPin size={16} /> Shipping Address
                          </h3>
                          <div className="space-y-6">
                             <Field
                                label="Street Address"
                                value={form.address.street}
                                onChange={(v) => update("address.street", v)}
                                disabled={!editing}
                                fullWidth
                             />
                             <div className="grid md:grid-cols-3 gap-6">
                                <Field
                                   label="City"
                                   value={form.address.city}
                                   onChange={(v) => update("address.city", v)}
                                   disabled={!editing}
                                />
                                <Field
                                   label="State / Province"
                                   value={form.address.state}
                                   onChange={(v) => update("address.state", v)}
                                   disabled={!editing}
                                />
                                <Field
                                   label="ZIP Code"
                                   value={form.address.zip}
                                   onChange={(v) => update("address.zip", v)}
                                   disabled={!editing}
                                />
                             </div>
                          </div>
                       </div>

                       {/* Action Bar */}
                       <AnimatePresence>
                          {editing && (
                             <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="pt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white"
                             >
                                <button
                                   type="button"
                                   onClick={() => setEditing(false)}
                                   className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                                >
                                   Cancel
                                </button>
                                <button
                                   type="submit"
                                   disabled={loading}
                                   className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                >
                                   <Save size={18} />
                                   {loading ? "Saving Changes..." : "Save Changes"}
                                </button>
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </form>
                 </div>
              </div>

           </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, disabled, placeholder, fullWidth }) {
   return (
      <div className={fullWidth ? "col-span-full" : ""}>
         <label className="block text-xs font-semibold text-gray-500 mb-2 ml-1">{label}</label>
         <input
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-5 py-3.5 rounded-xl border font-medium text-gray-900 transition-all
               ${disabled 
                  ? "bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed" 
                  : "bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
               }`}
         />
      </div>
   );
}
