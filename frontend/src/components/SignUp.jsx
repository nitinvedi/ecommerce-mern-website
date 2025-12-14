import { motion } from "framer-motion";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import useAuth from "../hooks/useAuth.js";

export default function SignUp({ onClose, onSwitchToSignIn }) {

    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const response = await register({
                name,
                email,
                password,
                confirmPassword
            });
            if (response && (response.success !== false)) {
                onClose?.();
                // Wait for user state to be set
                setTimeout(() => {
                    const returnUrl = sessionStorage.getItem('returnUrl');
                    if (returnUrl) {
                        sessionStorage.removeItem('returnUrl');
                        navigate(returnUrl, { replace: false });
                    } else {
                        navigate("/dashboard", { replace: false });
                    }
                }, 300);
            } else {
                setError("Registration failed. Please try again.");
            }
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
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
                <h2 className="text-white text-2xl font-bold mb-4">Create Account</h2>

                <form className="form" onSubmit={handleSubmit}>

                    <div className="flex-column">
                        <label>Name</label>
                    </div>
                    <div className="inputForm">
                        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none"
                            style={{ color: '#e5e5e5' }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <input
                            placeholder="Enter your Name"
                            className="input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="flex-column">
                        <label>Email</label>
                    </div>
                    <div className="inputForm">
                        <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                            <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082..." />
                        </svg>
                        <input
                            placeholder="Enter your Email"
                            className="input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex-column">
                        <label>Password</label>
                    </div>
                    <div className="inputForm">
                        <svg width="20" height="20" viewBox="-64 0 512 512" fill="currentColor">
                            <path d="m336 512h-288c-26.453125 0-48..." />
                        </svg>
                        <input
                            placeholder="Enter your Password"
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex-column">
                        <label>Confirm Password</label>
                    </div>
                    <div className="inputForm">
                        <svg width="20" height="20" viewBox="-64 0 512 512" fill="currentColor">
                            <path d="m336 512h-288c-26.453125 0-48..." />
                        </svg>
                        <input
                            placeholder="Confirm your Password"
                            className="input"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button className="button-submit" disabled={loading}>
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>

                    <p className="p">
                        Already have an account?
                        <span className="span p-1" onClick={onSwitchToSignIn}>
                            {" "}Sign In
                        </span>
                    </p>

                    <button type="button" className="google-btn">
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5..." />
                        </svg>

                        <span>Sign up with Google</span>
                    </button>

                </form>
            </motion.div>
        </div>
    );
}
