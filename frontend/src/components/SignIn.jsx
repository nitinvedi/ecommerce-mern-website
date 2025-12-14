import { motion } from "framer-motion";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import { api, API_ENDPOINTS, setAuthToken } from "../config/api.js";
import useAuth from "../hooks/useAuth.js";

export default function SignIn({ onClose, onSwitchToSignUp }) {
    const navigate = useNavigate();
    const { login, refreshProfile } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await login({ email, password });
            if (response && (response.success !== false)) {
                onClose?.();
                // Wait for user state to be set, then navigate
                // Use a small delay to ensure auth state is updated
                setTimeout(() => {
                    // Check if there's a return URL or navigate to dashboard
                    const returnUrl = sessionStorage.getItem('returnUrl');
                    if (returnUrl) {
                        sessionStorage.removeItem('returnUrl');
                        navigate(returnUrl, { replace: false });
                    } else {
                        navigate("/dashboard", { replace: false });
                    }
                }, 300);
            } else {
                setError("Login failed. Please try again.");
            }
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setError("");
        /* global google */
        google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
            callback: async (response) => {
                try {
                    const data = await api.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
                        credential: response.credential
                    });

                    if (data.success) {
                        setAuthToken(data.token || data.data?.token);
                        await refreshProfile();
                        onClose?.();
                        navigate("/dashboard");
                    } else {
                        setError(data.message || "Google login failed");
                    }
                } catch (err) {
                    setError(err.message || "Google login failed");
                }
            },
        });

        google.accounts.id.prompt();
    };


    return (
        <div
            className="signup-modal fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-999"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="bg-[#111] min-w-[350px] max-w-[90%] p-6 rounded-xl shadow-xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-white text-2xl font-bold mb-4">Welcome to Marammat</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form className="form" onSubmit={handleLogin}>

                    <div className="flex-column">
                        <label>Email</label>
                    </div>

                    <div className="inputForm">
                        <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                            <path d="m30.853 13.87..." />
                        </svg>
                        <input
                            placeholder="Enter your Email"
                            className="input"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex-column">
                        <label>Password</label>
                    </div>

                    <div className="inputForm">
                        <svg width="20" height="20" viewBox="-64 0 512 512" fill="currentColor">
                            <path d="m336 512..." />
                        </svg>
                        <input
                            placeholder="Enter your Password"
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex-row">
                        <div>
                            <input type="checkbox" />
                            <label> Remember me </label>
                        </div>
                        <span className="span">Forgot password?</span>
                    </div>

                        <button className="button-submit" disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                        </button>

                    <p className="p">
                        Don't have an account?
                        <span className="span m-1" onClick={onSwitchToSignUp}> Sign Up</span>
                    </p>

                    <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24..." />
                        </svg>
                        <span>Sign in with Google</span>
                    </button>

                </form>
            </motion.div>
        </div>
    );
}
