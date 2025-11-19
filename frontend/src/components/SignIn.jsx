import { motion } from "framer-motion";
import React from "react";
import "../styles/signup.css";

export default function SignIn({ onClose, onSwitchToSignUp }) {
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

                <form className="form">

                    <div className="flex-column">
                        <label>Email</label>
                    </div>

                    <div className="inputForm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                            <g id="Layer_3" data-name="Layer 3">
                                <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" fill="currentColor" />
                            </g>
                        </svg>
                        <input placeholder="Enter your Email" className="input" type="text" />
                    </div>

                    <div className="flex-column">
                        <label>Password</label>
                    </div>

                    <div className="inputForm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="-64 0 512 512" fill="currentColor">
                            <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" fill="currentColor" />
                            <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" fill="currentColor" />
                        </svg>
                        <input placeholder="Enter your Password" className="input" type="password" />
                    </div>

                    <div className="flex-row">
                        <div>
                            <input type="radio" name="remember" />
                            <label> Remember me </label>
                        </div>
                        <span className="span">Forgot password?</span>
                    </div>

                    <button className="button-submit">Sign In</button>

                    <p className="p">Don't have an account? 
                        <span 
                            className="span" 
                            onClick={onSwitchToSignUp}
                        > Sign Up</span>
                    </p>

                    <button className="google-btn">
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.06 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.1 24.55c0-1.57-.15-3.09-.43-4.55H24v9.02h12.4c-.54 2.76-2.2 5.1-4.7 6.68l7.33 5.67c4.28-3.95 7.07-9.78 7.07-16.82z" />
                            <path fill="#FBBC04" d="M10.54 28.59c-1.07-3.17-1.07-6.53 0-9.69L2.56 12.7c-3.02 5.94-3.02 13.06 0 19l7.98-3.11z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.78l-7.33-5.67c-2.04 1.37-4.66 2.16-8.57 2.16-6.26 0-11.57-3.56-13.46-8.91L2.56 31.7C6.51 39.52 14.62 48 24 48z" />
                        </svg>

                        <span>Sign in with Google</span>
                    </button>

                </form>
            </motion.div>
        </div>
    );
}

