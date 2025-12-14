import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SignInButton from "./SignInButton";
import useAuth from "../hooks/useAuth";

export default function Header({ openSignUp }) {
  const [showBanner, setShowBanner] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Auto-hide banner */
  useEffect(() => {
    if (!showBanner) return;
    const timer = setTimeout(() => setShowBanner(false), 15000);
    return () => clearTimeout(timer);
  }, [showBanner]);

  const isActive = (path) =>
    pathname === path ? "text-white" : "text-white/70";

  const handleAuthClick = () => {
    if (user) navigate("/dashboard");
    else openSignUp?.();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* ================= Announcement Bar ================= */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 inset-x-0 z-50
              bg-teal-500 text-black text-sm font-medium
              h-9 flex items-center justify-center px-4"
          >
            Free doorstep pickup & delivery • Trusted technicians
            <button
              onClick={() => setShowBanner(false)}
              className="absolute right-4 text-lg font-bold opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= Navbar ================= */}
      <nav
        className="fixed inset-x-0 z-40 transition-all duration-300"
        style={{
          top: showBanner ? "36px" : "0px",
          height: scrolled ? "64px" : "80px",
          backgroundColor: scrolled
            ? "rgba(0,0,0,0.55)"
            : "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto h-full px-6 md:px-10
          flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo3.png"
              alt="Marammat"
              className="w-14 h-9 object-contain"
            />
            <span className="
              text-xl font-extrabold tracking-wide
              text-transparent bg-clip-text
              bg-gradient-to-r from-white to-gray-400
            ">
              Marammat
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/home" className={isActive("/home")}>Store</Link>
            <Link to="/repair" className={isActive("/repair")}>Repair</Link>
            <Link to="/contact" className={isActive("/contact")}>Contact</Link>

            {pathname === "/" &&
              ["features", "support", "faq"].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </a>
              ))}
          </div>

          {/* Auth */}
          <SignInButton
            onClick={handleAuthClick}
            isAuthenticated={!!user}
            userName={user?.name}
            onDashboard={() => navigate("/dashboard")}
            onLogout={handleLogout}
          />
        </div>
      </nav>
    </>
  );
}
