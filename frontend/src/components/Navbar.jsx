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
  Search
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";
import { useCart } from "../context/CartContext";

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
      className="relative isolate z-[100]"
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
            className="absolute right-0 mt-3 w-56 rounded-xl bg-white border border-black/10 shadow-2xl overflow-hidden z-[999]"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-black/5">
              <p className="text-sm font-medium text-gray-900">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>

            {/* Actions */}
            <div className="py-1 text-sm">
              <MenuItem
                icon={<LayoutDashboard size={16} />}
                label="Dashboard"
                onClick={() => navigate("/dashboard")}
              />

              {/* ✅ My Orders */}
              <MenuItem
                icon={<Package size={16} />}
                label="My Orders"
                onClick={() => navigate("/orders")}
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
  const { cart } = useCart();

  const isLandingPage = pathname === "/";
  const cartCount = cart?.length || 0;

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
      {/* ================= Offer Banner ================= */}
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
            <span className="text-2xl font-extrabold text-zinc-900">
              Ram Mobiles
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="search"
                placeholder="Search for products, brands, and more..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                onChange={(e) => {
                  if (e.target.value) {
                    navigate(`/home?search=${e.target.value}`);
                  }
                }}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {[{ path: "/home", label: "Store" }, { path: "/repair", label: "Repair" }].map(
              ({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-gray-900 after:origin-left after:transition-transform after:duration-200 ${isActive(
                    path
                  )}`}
                >
                  {label}
                </Link>
              )
            )}
          </nav>

          {/* Right: Cart, Wishlist, Notifications, Profile */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/wishlist"
                  className="flex flex-col items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative group"
                  aria-label="Wishlist"
                >
                  <Heart size={24} />
                  <span className="text-xs mt-0.5 hidden lg:block">Wishlist</span>
                </Link>
                
                <NotificationBell />
                
                <Link
                  to="/cart"
                  className="flex flex-col items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative group"
                  aria-label="Shopping Cart"
                >
                  <div className="relative">
                    <ShoppingCart size={24} />
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </motion.span>
                    )}
                  </div>
                  <span className="text-xs mt-0.5 hidden lg:block">Cart</span>
                </Link>

                <ProfileMenu />
              </>
            ) : (
              <button
                onClick={() => openSignUp?.()}
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900 transition"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
