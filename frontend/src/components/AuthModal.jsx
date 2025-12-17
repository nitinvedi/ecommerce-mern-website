import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { api, API_ENDPOINTS, setAuthToken } from "../config/api";

const variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 }
};

export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState("signin");
  const navigate = useNavigate();
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
    setError("");
    setLoading(true);
    try {
      const res = await login({
        email: form.email,
        password: form.password
      });
      if (res?.success !== false) {
        onClose();
        navigate("/dashboard");
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
        navigate("/dashboard");
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
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-4 bg-white rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-2xl font-semibold text-gray-900">
              {mode === "signin"
                ? "Welcome back"
                : mode === "signup"
                ? "Create account"
                : "Reset password"}
            </h2>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* SIGN IN */}
              {mode === "signin" && (
                <motion.form
                  key="signin"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onSubmit={handleLogin}
                  className="mt-6 space-y-4"
                >
                  <input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                  />
                  <input
                    placeholder="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                  />

                  <button className="w-full bg-black text-white py-2 rounded-xl">
                    Sign in
                  </button>

                  <p className="text-sm text-center">
                    No account?{" "}
                    <span
                      className="font-medium cursor-pointer"
                      onClick={() => setMode("signup")}
                    >
                      Sign up
                    </span>
                  </p>
                </motion.form>
              )}

              {/* SIGN UP */}
              {mode === "signup" && (
                <motion.form
                  key="signup"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onSubmit={handleRegister}
                  className="mt-6 space-y-4"
                >
                  <input
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                  />
                  <input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                  />
                  <input
                    placeholder="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                  />
                  <input
                    placeholder="Confirm password"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                  />

                  <button className="w-full bg-black text-white py-2 rounded-xl">
                    Create account
                  </button>

                  <p className="text-sm text-center">
                    Already have an account?{" "}
                    <span
                      className="font-medium cursor-pointer"
                      onClick={() => setMode("signin")}
                    >
                      Sign in
                    </span>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>

            <button
              onClick={handleGoogleLogin}
              className="mt-5 w-full border rounded-xl py-2"
            >
              Continue with Google
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
