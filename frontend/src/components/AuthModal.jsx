import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Mail, Lock, User, ArrowRight, Chrome, KeyRound, ArrowLeft } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { api, API_ENDPOINTS, setAuthToken } from "../config/api";
import { validate, validateForm } from "../utils/validation";
import { getErrorMessage } from "../utils/errorHandler.js";


const variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export default function AuthModal({ open, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState("signin"); // signin, signup, forgot, reset
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
  const [successMsg, setSuccessMsg] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Reset state when switching modes
  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
    // Keep email if switching between related modes for better UX
    if (newMode === 'signin' || newMode === 'signup') {
        const email = form.email;
        setForm({
            name: "",
            email: email,
            password: "",
            confirmPassword: "",
            resetToken: ""
        });
    }
  };

  /* ---------- SIGN IN ---------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    const { isValid, errors: newErrors } = validateForm(
        { email: form.email, password: form.password },
        { email: validate.email, password: validate.required }
    );
    
    if (!isValid) {
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
      setError(getErrorMessage(e, "Login failed"));
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
      setError(getErrorMessage(e, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  /* ---------- FORGOT PASSWORD ---------- */
  const handleForgotPassword = async (e) => {
      e.preventDefault();
      setError("");
      setSuccessMsg("");

      if (!validate.email(form.email)) {
          return setError("Please enter a valid email address");
      }

      setLoading(true);
      try {
          const res = await api.post(API_ENDPOINTS.AUTH.FORGOT, { email: form.email });
          
          if (res.data?.resetToken) {
              // Dev/Demo mode: Auto-fill token for easier testing
              setForm(prev => ({ ...prev, resetToken: res.data.resetToken }));
              setSuccessMsg("Reset token generated! Changing to update password screen...");
              // Small delay to let user see the success message
              setTimeout(() => {
                  setMode("reset");
                  setError(""); 
                  setSuccessMsg("Token pre-filled. Please set a new password.");
              }, 1500);
          } else {
             // Production mode: Email sent
             setSuccessMsg("If an account exists, a reset link has been sent.");
          }
      } catch (e) {
          console.error(e);
          setError(getErrorMessage(e, "Failed to process request"));
      } finally {
          setLoading(false);
      }
  };

  /* ---------- RESET PASSWORD ---------- */
  const handleResetPassword = async (e) => {
      e.preventDefault();
      setError("");
      setSuccessMsg("");

      if (!form.resetToken) return setError("Reset token is missing");
      if (!validate.password(form.password)) return setError("Password must be at least 8 chars with upper, lower, number & special char");
      if (form.password !== form.confirmPassword) return setError("Passwords do not match");

      setLoading(true);
      try {
          await api.post(API_ENDPOINTS.AUTH.RESET, {
              token: form.resetToken,
              newPassword: form.password
          });
          setSuccessMsg("Password reset successfully! Redirecting to login...");
          setTimeout(() => {
              setMode("signin");
              setSuccessMsg("Please login with your new password");
              setForm(f => ({ ...f, password: "", confirmPassword: "", resetToken: "" }));
          }, 2000);
      } catch (e) {
          setError(getErrorMessage(e, "Failed to reset password"));
      } finally {
          setLoading(false);
      }
  };

  /* ---------- GOOGLE ---------- */
  useEffect(() => {
    // Render button only when modal is open and in signin/signup mode
    if (open && (mode === "signin" || mode === "signup")) {
       if (window.google?.accounts?.id) {
           window.google.accounts.id.renderButton(
               document.getElementById("google-signin-button"),
               { 
                   theme: "outline", 
                   size: "large", 
                   width: '100%', // Attempt to fill, though Google caps it
                   text: mode === "signup" ? "signup_with" : "signin_with",
                   shape: "pill"
               }
           );
       }
    }
  }, [open, mode]);

  // Keep this handler for reference, but button uses internal callback defined in index.html (if configured) OR we need to pass it?
  // Actually, we initialized it in `GoogleOneTap`. But `renderButton` might need it re-initialized if we want a specific callback here?
  // Wait, `GoogleOneTap` initializes the client globally with a callback.
  // The global callback handles the response. We just need to render the button. 
  // If we want specific logic (like closing modal), we might need to listen to the global event or rely on `refreshProfile` triggering context update which closes modal?
  // Ah, `GoogleOneTap` handles login. But `AuthModal` needs to close.
  // We should probably define the callback here too or rely on `user` change effect to close modal?
  // Let's rely on AuthContext user change?
  // AuthModal doesn't listen to user change to close... let's add that.

  // Effect to close modal on successful login
  const { user } = useAuth();
  useEffect(() => {
      if (user && open) {
          handleAuthSuccess();
      }
  }, [user]);

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
             <div className="hidden md:flex md:w-1/2 bg-black relative overflow-hidden items-center justify-center text-white p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-90" />
                <img 
                   src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=1000" 
                   className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 grayscale"
                   alt="Auth Banner"
                />
                
                <div className="relative z-10 space-y-6">
                   <h2 className="text-4xl font-bold leading-tight">Welcome to the future of shopping.</h2>
                   <p className="text-gray-300 text-lg">Join thousands of users getting the best deals on premium tech every day.</p>
                   
                   <div className="flex gap-4 pt-4">
                      <div className="flex -space-x-4">
                         {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full bg-white/10 border-2 border-white/50 backdrop-blur-sm" />
                         ))}
                      </div>
                      <div className="flex flex-col text-sm font-medium">
                         <span>10k+ Users</span>
                         <span className="text-gray-400">Trusted Community</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* RIGHT: Form */}
             <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                <div className="max-w-sm mx-auto">
                   
                   {/* Header Text */}
                   <h2 className="text-3xl font-bold text-gray-900 mb-2">
                     {mode === "signin" && "Welcome Back!"}
                     {mode === "signup" && "Create Account"}
                     {mode === "forgot" && "Forgot Password?"}
                     {mode === "reset" && "Reset Password"}
                   </h2>
                   <p className="text-gray-500 mb-8">
                      {mode === "signin" && "Enter your details to access your account"}
                      {mode === "signup" && "Start your 30-day free trial today"}
                      {mode === "forgot" && "Enter your email to reset your password"}
                      {mode === "reset" && "Enter your new password below"}
                   </p>

                   {/* Error Alert */}
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

                   {/* Success Alert */}
                   {successMsg && (
                     <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl bg-green-50 text-green-600 text-sm border border-green-100 flex items-center gap-2"
                     >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                        {successMsg}
                     </motion.div>
                   )}

                   {/* Tabs (Only show for signin/signup) */}
                   {(mode === "signin" || mode === "signup") && (
                       <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                          <button 
                             onClick={() => switchMode("signin")}
                             className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "signin" ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                             Sign In
                          </button>
                          <button 
                             onClick={() => switchMode("signup")}
                             className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "signup" ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                             Sign Up
                          </button>
                       </div>
                   )}

                   <AnimatePresence mode="wait">
                      {/* SIGN IN FORM */}
                      {mode === "signin" && (
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
                                  <span onClick={() => switchMode("forgot")} className="text-sm text-blue-600 hover:underline cursor-pointer">Forgot?</span>
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
                      )}

                      {/* SIGN UP FORM */}
                      {mode === "signup" && (
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
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                   <input
                                      type="checkbox"
                                      id="terms"
                                      checked={form.termsAgreed || false}
                                      onChange={(e) => update("termsAgreed", e.target.checked)}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                   />
                                   <label htmlFor="terms" className="text-sm text-gray-600 select-none cursor-pointer">
                                      I agree to the <span className="text-blue-600 font-medium hover:underline">Terms & Conditions</span>
                                   </label>
                                </div>
                                <button disabled={loading} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 disabled:opacity-70">
                                   {loading ? "Creating Account..." : "Create Account"} <ArrowRight size={18} />
                                </button>
                            </div>
                         </motion.form>
                      )}

                      {/* FORGOT PASSWORD FORM */}
                      {mode === "forgot" && (
                         <motion.form key="forgot" variants={variants} initial="initial" animate="animate" exit="exit" onSubmit={handleForgotPassword} className="space-y-5">
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

                            <button disabled={loading} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 disabled:opacity-70">
                               {loading ? "Sending Link..." : "Send Reset Link"} <ArrowRight size={18} />
                            </button>
                            
                            <div className="text-center">
                                <button type="button" onClick={() => switchMode("signin")} className="text-sm text-gray-500 hover:text-gray-900 font-medium inline-flex items-center gap-1">
                                    <ArrowLeft size={16} /> Back to Sign In
                                </button>
                            </div>
                         </motion.form>
                      )}

                      {/* RESET PASSWORD FORM */}
                      {mode === "reset" && (
                         <motion.form key="reset" variants={variants} initial="initial" animate="animate" exit="exit" onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-2">
                               <label className="text-sm font-medium text-gray-700">Reset Token</label>
                               <div className="relative">
                                  <KeyRound size={20} className="absolute left-4 top-3.5 text-gray-400" />
                                  <input
                                     type="text"
                                     value={form.resetToken}
                                     onChange={(e) => update("resetToken", e.target.value)}
                                     className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                     placeholder="Paste token here"
                                     required
                                  />
                               </div>
                            </div>

                            <div className="space-y-2">
                               <label className="text-sm font-medium text-gray-700">New Password</label>
                               <div className="relative">
                                  <Lock size={20} className="absolute left-4 top-3.5 text-gray-400" />
                                  <input
                                     type="password"
                                     value={form.password}
                                     onChange={(e) => update("password", e.target.value)}
                                     className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                     placeholder="New password (min 8 chars)"
                                     required
                                  />
                               </div>
                            </div>

                            <div className="space-y-2">
                               <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                               <div className="relative">
                                  <Lock size={20} className="absolute left-4 top-3.5 text-gray-400" />
                                  <input
                                     type="password"
                                     value={form.confirmPassword}
                                     onChange={(e) => update("confirmPassword", e.target.value)}
                                     className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                     placeholder="Confirm new password"
                                     required
                                  />
                               </div>
                            </div>

                            <button disabled={loading} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 disabled:opacity-70">
                               {loading ? "Resetting..." : "Reset Password"} <ArrowRight size={18} />
                            </button>
                            
                            <div className="text-center">
                                <button type="button" onClick={() => switchMode("signin")} className="text-sm text-gray-500 hover:text-gray-900 font-medium inline-flex items-center gap-1">
                                    <ArrowLeft size={16} /> Back to Sign In
                                </button>
                            </div>
                         </motion.form>
                      )}

                   </AnimatePresence>

                   {/* Separator & Google Auth (Only for Signin/Signup) */}
                   {(mode === "signin" || mode === "signup") && (
                       <>
                           <div className="relative my-8">
                              <div className="absolute inset-0 flex items-center">
                                 <div className="w-full border-t border-gray-200"></div>
                              </div>
                              <div className="relative flex justify-center text-sm">
                                 <span className="px-2 bg-white text-gray-500">Or continue with</span>
                              </div>
                           </div>

                           <div id="google-signin-button" className="flex justify-center h-[50px]"></div>
                       </>
                   )}
                </div>
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
