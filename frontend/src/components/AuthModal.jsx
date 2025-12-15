import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { api, API_ENDPOINTS, setAuthToken } from "../config/api";

/* Slide animation for content */
const variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 }
};

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const navigate = useNavigate();
  const { login, register, refreshProfile } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm({ ...form, [k]: v });

  /* ---------- SIGN IN ---------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login({
        email: form.email,
        password: form.password
      });

      if (res?.success !== false) {
        onClose();
        setTimeout(() => navigate("/dashboard"), 250);
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await register(form);
      if (res?.success !== false) {
        onClose();
        setTimeout(() => navigate("/dashboard"), 250);
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
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const data = await api.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
            credential: response.credential
          });
          setAuthToken(data.token || data.data?.token);
          await refreshProfile();
          onClose();
          navigate("/dashboard");
        } catch {
          setError("Google login failed");
        }
      }
    });
    google.accounts.id.prompt();
  };

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 🔑 layout='size' + overflow-hidden prevents height jump */}
      <motion.div
        layout="size"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{
          opacity: { duration: 0.2, ease: "easeOut" },
          scale: { duration: 0.2, ease: "easeOut" },
          layout: { duration: 0.35, ease: "easeInOut" }
        }}
        className="
          w-full max-w-md mx-4
          bg-white/90 backdrop-blur-xl
          border border-black/10
          rounded-2xl p-6 shadow-xl
          overflow-hidden
        "
      >
        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-900">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {mode === "signin"
            ? "Sign in to continue to Marammat"
            : "Start repairing smarter with Marammat"}
        </p>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Forms */}
        <AnimatePresence mode="wait" initial={false}>
          {mode === "signin" ? (
            <motion.form
              layout
              key="signin"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-6 space-y-4"
              onSubmit={handleLogin}
            >
              <input
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />

              <button
                disabled={loading}
                className="w-full rounded-xl bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-900 transition"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <p className="text-sm text-center text-gray-600">
                Don’t have an account?
                <span
                  className="ml-1 text-gray-900 font-medium cursor-pointer"
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </span>
              </p>
            </motion.form>
          ) : (
            <motion.form
              layout
              key="signup"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-6 space-y-4"
              onSubmit={handleRegister}
            >
              <input
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm"
                placeholder="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
              />

              <button
                disabled={loading}
                className="w-full rounded-xl bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-900 transition"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <p className="text-sm text-center text-gray-600">
                Already have an account?
                <span
                  className="ml-1 text-gray-900 font-medium cursor-pointer"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </span>
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="
            mt-5 w-full rounded-xl border border-black/10
            py-2.5 text-sm text-gray-700
            hover:bg-black/5 transition
          "
        >
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}
