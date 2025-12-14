import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SignInButton from "./SignInButton";
import useAuth from "../hooks/useAuth.js";

export default function Navbar({ openSignUp }) {
  const [showBanner, setShowBanner] = useState(true);
  const [textIndex, setTextIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const messages = [
    "Get your device repaired with 100% trusted experts",
    "Fastest doorstep pickup & delivery",
    "Best prices guaranteed for all repairs",
  ];

  // Auto-hide after X seconds (8 sec example)
  useEffect(() => {
    if (!showBanner) return;

    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [showBanner]);

  const closeBanner = () => {
    setShowBanner(false);
  };

  useEffect(() => {
    const interval = setInterval(
      () => setTextIndex((prev) => (prev + 1) % messages.length),
      4000
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const { pathname } = useLocation();

  const handleAuthClick = () => {
    if (user) {
      navigate("/dashboard");
      return;
    }
    openSignUp?.();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            key="banner"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="
              w-full fixed top-0 left-0
              bg-teal-500 text-black font-semibold
              text-[15px] flex items-center justify-center
              h-8 z-9999
            "
          >
            <div className="relative w-full text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={textIndex}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {messages[textIndex]}
                </motion.div>
              </AnimatePresence>

              <button
                onClick={closeBanner}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black text-lg font-bold"
              >
                ×
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================= NAVBAR ========================= */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="
          fixed left-0 w-full
          flex items-center justify-between
          px-8 md:px-12
          z-9998
          transition-all duration-300
        "
        style={{
          top: showBanner ? "32px" : "0px",
          backgroundColor: scrolled
            ? "rgba(0,0,0,0.25)"
            : "rgba(0,0,0,0.50)",
          backdropFilter: scrolled ? "blur(14px)" : "blur(4px)",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "blur(4px)",
          height: scrolled ? "50px" : "88px",
          borderBottom: scrolled
            ? "1px dotted rgba(255,255,255,0.08)"
            : "1px dotted transparent",
        }}
      >
        <motion.div
          animate={{ scale: scrolled ? 0.95 : 1 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-between w-full"
        >
          {/* Logo */}
          <motion.div
            animate={{ scale: scrolled ? 0.88 : 1 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Link to="/" className="flex items-center">
              <img src="logo3.png" alt="no image" className="w-16 h-10 object-contain" />

              <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400 font-extrabold text-2xl tracking-wide">
                Marammat
              </span>
            </Link>
          </motion.div>


          {/* Links */}
          <div className="hidden md:flex space-x-10 text-white font-medium items-center">

            {/* ROUTE LINKS */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/home" className="cursor-pointer">Store</Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/repair" className="cursor-pointer">Repair</Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/contact" className="cursor-pointer">Contact</Link>
            </motion.div>

            {/* HASH LINKS (only show on "/") */}
            {pathname === "/" &&
              ["Features", "Support", "FAQ"].map((text) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ opacity: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <a href={`#${text.toLowerCase()}`} className="cursor-pointer">
                    {text}
                  </a>
                </motion.div>
              ))}

          </div>

          {/* Sign In */}
          <motion.div
            animate={{ scale: scrolled ? 0.92 : 1 }}
            transition={{ duration: 0.25 }}
          >
            <SignInButton
              onClick={handleAuthClick}
              isAuthenticated={Boolean(user)}
              userName={user?.name}
              onDashboard={() => navigate("/dashboard")}
              onLogout={handleLogout}
            />
          </motion.div>
        </motion.div>
      </motion.nav>
    </>
  );
}
