import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  ShoppingCart,
  Package,
  Heart,
  Search,
  Wrench,
  ShoppingBag,
  Bell
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell"; // Keeping this if logic is complex, or inline it if simple

/* ================= Animations ================= */
const navVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

const linkHover = {
  scale: 1.05,
  transition: { duration: 0.2 },
};

/* ================= Profile Menu ================= */
// Enhanced minimal dropdown
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
      className="relative z-50"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <motion.button
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-700 hover:bg-black hover:text-white transition-colors border border-black/5"
        whileTap={{ scale: 0.95 }}
      >
        <User size={18} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-60 p-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl origin-top-right ring-1 ring-black/5"
          >
            {/* User Info */}
            <div className="px-3 py-3 mb-2 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>

            <div className="space-y-1">
              {user.role === "admin" && (
                <MenuLink
                  icon={<LayoutDashboard size={16} />}
                  label="Admin Panel"
                  onClick={() => navigate("/admin")}
                />
              )}
              {user.role === "technician" && (
                <MenuLink
                  icon={<Wrench size={16} />}
                  label="Technician Dashboard"
                  onClick={() => navigate("/technician")}
                />
              )}
              <MenuLink
                icon={<LayoutDashboard size={16} />}
                label="Dashboard"
                onClick={() => navigate("/dashboard")}
              />
              <MenuLink
                icon={<Package size={16} />}
                label="My Orders"
                onClick={() => navigate("/orders")}
              />
              <MenuLink
                icon={<Settings size={16} />}
                label="Settings"
                onClick={() => navigate("/profile")}
              />

              <div className="h-px bg-gray-100 my-2" />

              <MenuLink
                icon={<LogOut size={16} />}
                label="Log Out"
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

function MenuLink({ icon, label, onClick, danger = false }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-600 hover:text-black hover:bg-gray-100/50"
        }`}
    >
      {icon}
      {label}
    </motion.button>
  );
}

/* ================= Navbar ================= */
export default function Navbar({ openSignUp }) {
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart } = useCart();

  const cartCount = cart?.length || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Store", path: "/home", icon: <ShoppingBag size={18} /> },
    { name: "Repair", path: "/repair", icon: <Wrench size={18} /> },
  ];

  const handleSearch = (e) => {
    if (e.key === "Enter" && e.target.value) {
      navigate(`/home?search=${e.target.value}`);
    }
  };

  return (
    <>
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled
            ? "bg-white/75 backdrop-blur-md shadow-sm border-b border-black/5 py-3"
            : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">

          {/* 1. Brand */}
          <Link to="/" className="group flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
              R
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? 'text-black' : 'text-black'}`}>
              Ram Mobile
            </span>
          </Link>

          {/* 2. Center Menu (Desktop) */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100/50 backdrop-blur-sm p-1.5 rounded-full border border-black/5 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-6 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="bubble"
                      className="absolute inset-0 bg-white rounded-full shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-2 ${isActive ? "text-black" : "text-gray-500 hover:text-black"}`}>
                    {link.name}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* 3. Right Mix (Search + Actions) */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-100/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 transition-all rounded-full px-3 py-2 w-48 focus-within:w-64">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder-gray-400 text-gray-900"
                onKeyDown={handleSearch}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-2">
              {/* Wishlist */}
              <Link to="/wishlist">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Heart size={20} />
                </motion.button>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0 right-0 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.button>
              </Link>

              {/* Auth / Profile */}
              {user ? (
                <ProfileMenu />
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openSignUp?.()}
                  className="ml-2 bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-900 transition-colors shadow-lg shadow-black/20"
                >
                  Sign In
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
      {/* Spacer for fixed nav */}
      <div className="h-20" />
    </>
  );
}
