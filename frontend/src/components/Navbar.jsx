import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, LayoutDashboard, Settings, LogOut } from "lucide-react";
import useAuth from "../hooks/useAuth";

/* ================= Profile Menu ================= */
function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Avatar */}
      <button className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition">
        <User size={18} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-56 rounded-xl bg-white border border-black/10 shadow-xl overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-black/5">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            {/* Actions */}
            <div className="py-1 text-sm">
              <MenuItem
                icon={<LayoutDashboard size={16} />}
                label="Dashboard"
                onClick={() => navigate("/dashboard")}
              />
              {user.role === "admin" && (
                <MenuItem
                  icon={<LayoutDashboard size={16} />}
                  label="Admin"
                  onClick={() => navigate("/admin")}
                />
              )}
              {user.role === "technician" && (
                <MenuItem
                  icon={<LayoutDashboard size={16} />}
                  label="Technician"
                  onClick={() => navigate("/technician")}
                />
              )}
              <MenuItem
                icon={<Settings size={16} />}
                label="Update profile"
                onClick={() => navigate("/profile")}
              />
              <div className="my-1 h-px bg-black/5" />
              <MenuItem
                icon={<LogOut size={16} />}
                label="Logout"
                danger
                onClick={handleLogout}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 flex items-center gap-2 text-left transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ================= Header ================= */
export default function Header({ openSignUp }) {
  const [showBanner, setShowBanner] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isLandingPage = pathname === "/";

  /* Scroll handling */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 8) {
        setScrolled(true);
        setShowBanner(false);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) =>
    pathname === path
      ? "text-gray-900 after:scale-x-100"
      : scrolled
      ? "text-gray-500 hover:text-gray-900 after:scale-x-0"
      : "text-gray-700 hover:text-gray-900 after:scale-x-0";

  return (
    <>
      {/* ================= Offer Banner (Landing Only) ================= */}
      <AnimatePresence>
        {isLandingPage && showBanner && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-black/10"
          >
            <div className="max-w-7xl mx-auto h-9 px-4 flex items-center justify-center text-sm text-gray-700 relative">
              🚚 Free doorstep pickup & delivery • Trusted technicians
              <button
                onClick={() => setShowBanner(false)}
                className="absolute right-4 text-lg opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= Navbar ================= */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/70 backdrop-blur-md border-b border-black/10 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto h-16 px-6 md:px-10 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo3.png" alt="Marammat" className="w-10 h-7 object-contain" />
            <span className="text-lg font-semibold text-gray-900">Marammat</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {[
              { path: "/home", label: "Store" },
              { path: "/repair", label: "Repair" },
              { path: "/contact", label: "Contact" },
              ...(user
                ? [
                    { path: "/dashboard", label: "Dashboard" },
                    { path: "/orders", label: "Orders" },
                    { path: "/cart", label: "Cart" },
                  ]
                : []),
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-gray-900 after:origin-left after:transition-transform after:duration-200 ${isActive(
                  path
                )}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          {user ? (
            <ProfileMenu />
          ) : (
            <button
              onClick={() => openSignUp?.()}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 transition"
            >
              Sign in
            </button>
          )}
        </div>
      </header>
    </>
  );
}
