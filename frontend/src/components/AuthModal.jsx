import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Mail, Lock, User, ArrowRight, Chrome } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { api, API_ENDPOINTS, setAuthToken } from "../config/api";
import { validate, validateForm } from "../utils/validation";

const variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export default function AuthModal({ open, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState("signin");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, refreshProfile } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    resetToken: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* ---------- SIGN IN ---------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    const { isValid, errors: newErrors } = validateForm(
        { email: form.email, password: form.password },
        { email: validate.email, password: validate.required }
    );
    
    if (!isValid) {
        // Just show generic error or toast?
        // User asked for "proper validation", but login usually keeps it generic for security.
        // But for inputs like "alphabets in phone", we should valid syntax.
        // For login, email syntax check is fine.
        if (newErrors.email) return setError(newErrors.email);
        if (newErrors.password) return setError(newErrors.password);
    }

    setError("");
    setLoading(true);
    try {
      const res = await login({
        email: form.email,
        password: form.password
      });
      if (res?.success !== false) {
          handleAuthSuccess();
      } else {
        setError("Invalid email or password");
      }
    } catch (e) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- SIGN UP ---------- */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    const schema = {
        name: validate.name,
        email: validate.email,
        password: validate.password
    };

    const { isValid, errors: newErrors } = validateForm(form, schema);

    if (!isValid) {
        if (newErrors.name) return setError(newErrors.name);
        if (newErrors.email) return setError(newErrors.email);
        if (newErrors.password) return setError(newErrors.password);
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await register(form);
      if (res?.success !== false) {
        handleAuthSuccess();
      } else {
        setError("Registration failed");
      }
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- GOOGLE ---------- */
  const handleGoogleLogin = () => {
    setError("");
    if (!window.google) return setError("Google auth not loaded");
    
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        console.log("Google Auth Callback Received", response);
        try {
          const data = await api.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
            credential: response.credential
          });
          console.log("Google Login API Success", data);
          setAuthToken(data.token || data.data?.token);
          await refreshProfile();
          handleAuthSuccess();
        } catch (error) {
          console.error("Google Login API Failed", error);
          setError(error.response?.data?.debug || "Google login failed");
        }
      }
    });
    window.google.accounts.id.prompt();
  };

  /* ---------- SUCCESS HANDLER ---------- */
  const handleAuthSuccess = () => {
    onClose();
    if (onAuthSuccess) {
      onAuthSuccess();
      return;
    }

    // Check for Return URL from ProtectedRoute
    // Supports both string (new) and object (legacy) formats for robustness
    let from = "/dashboard";
    if (location.state?.from) {
        from = typeof location.state.from === 'string' 
            ? location.state.from 
            : location.state.from.pathname;
    }
    
    navigate(from, { replace: true });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
             {/* Close Button */}
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors md:text-white md:bg-white/20 md:hover:bg-white/30"
             >
                <X size={20} />
             </button>

             {/* LEFT: Image / Branding */}
             <div className="hidden md:flex md:w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center text-white p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 opacity-90" />
                <img 
                   src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=1000" 
                   className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                   alt="Auth Banner"
                />
                
                <div className="relative z-10 space-y-6">
                   <h2 className="text-4xl font-bold leading-tight">Welcome to the future of shopping.</h2>
                   <p className="text-blue-100 text-lg">Join thousands of users getting the best deals on premium tech every day.</p>
                   
                   <div className="flex gap-4 pt-4">
                      <div className="flex -space-x-4">
                         {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white backdrop-blur-sm" />
                         ))}
                      </div>
                      <div className="flex flex-col text-sm font-medium">
                         <span>10k+ Users</span>
                         <span className="text-blue-200">Trusted Community</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* RIGHT: Form */}
             <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                <div className="max-w-sm mx-auto">
                   <h2 className="text-3xl font-bold text-gray-900 mb-2">
                     {mode === "signin" ? "Welcome Back!" : "Create Account"}
                   </h2>
                   <p className="text-gray-500 mb-8">
                      {mode === "signin" ? "Enter your details to access your account" : "Start your 30-day free trial today"}
                   </p>

                   {error && (
                     <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2"
                     >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        {error}
                     </motion.div>
                   )}

                   <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                      <button 
                         onClick={() => setMode("signin")}
                         className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "signin" ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                         Sign In
                      </button>
                      <button 
                         onClick={() => setMode("signup")}
                         className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "signup" ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                         Sign Up
                      </button>
                   </div>

                   <AnimatePresence mode="wait">
                      {mode === "signin" ? (
                         <motion.form key="signin" variants={variants} initial="initial" animate="animate" exit="exit" onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                               <label className="text-sm font-medium text-gray-700">Email Address</label>
                               <div className="relative">
                                  <Mail size={20} className="absolute left-4 top-3.5 text-gray-400" />
                                  <input
                                     type="email"
                                     value={form.email}
                                     onChange={(e) => update("email", e.target.value)}
                                     className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                     placeholder="name@example.com"
                                     required
                                  />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <div className="flex justify-between">
                                  <label className="text-sm font-medium text-gray-700">Password</label>
                                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">Forgot?</span>
                               </div>
                               <div className="relative">
                                  <Lock size={20} className="absolute left-4 top-3.5 text-gray-400" />
                                  <input
                                     type="password"
                                     value={form.password}
                                     onChange={(e) => update("password", e.target.value)}
                                     className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                     placeholder="••••••••"
                                     required
                                  />
                               </div>
                            </div>
                            <button disabled={loading} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 disabled:opacity-70">
                               {loading ? "Signing in..." : "Sign In"} <ArrowRight size={18} />
                            </button>
                         </motion.form>
                      ) : (
                         <motion.form key="signup" variants={variants} initial="initial" animate="animate" exit="exit" onSubmit={handleRegister} className="space-y-5">
                            <div className="space-y-2">
                               <label className="text-sm font-medium text-gray-700">Full Name</label>
                               <div className="relative">
                                  <User size={20} className="absolute left-4 top-3.5 text-gray-400" />
                                  <input
                                     value={form.name}
                                     onChange={(e) => update("name", e.target.value)}
                                     className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                     placeholder="John Doe"
                                     required
                                  />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-sm font-medium text-gray-700">Email Address</label>
                               <div className="relative">
                                  <Mail size={20} className="absolute left-4 top-3.5 text-gray-400" />
                                  <input
                                     type="email"
                                     value={form.email}
                                     onChange={(e) => update("email", e.target.value)}
                                     className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                     placeholder="name@example.com"
                                     required
                                  />
                               </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">Password</label>
                                  <div className="relative">
                                     <Lock size={20} className="absolute left-4 top-3.5 text-gray-400" />
                                     <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => update("password", e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="••••••••"
                                        required
                                     />
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">Confirm</label>
                                  <div className="relative">
                                     <Lock size={20} className="absolute left-4 top-3.5 text-gray-400" />
                                     <input
                                        type="password"
                                        value={form.confirmPassword}
                                        onChange={(e) => update("confirmPassword", e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="••••••••"
                                        required
                                     />
                                  </div>
                               </div>
                            </div>
                            <button disabled={loading} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 disabled:opacity-70">
                               {loading ? "Creating Account..." : "Create Account"} <ArrowRight size={18} />
                            </button>
                         </motion.form>
                      )}
                   </AnimatePresence>

                   <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                         <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                         <span className="px-2 bg-white text-gray-500">Or continue with</span>
                      </div>
                   </div>

                   <button
                      onClick={handleGoogleLogin}
                      className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                   >
                      <Chrome size={20} className="text-blue-600" />
                      Google
                   </button>
                </div>
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
