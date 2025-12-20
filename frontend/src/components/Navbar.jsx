import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
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
  Menu,
  X,
  ChevronRight,
  Bell
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { useCart } from "../context/CartContext";
import { useNotification } from "../context/NotificationContext";

/* ================= Animations ================= */
const navVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  },
};

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
      className="relative z-50"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <motion.button
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-black hover:text-white transition-all duration-300 border border-transparent hover:border-black/10"
        whileTap={{ scale: 0.95 }}
      >
        <User size={20} className="stroke-[1.5]" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute right-0 mt-2 w-64 p-2 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] ring-1 ring-black/5 origin-top-right"
          >
            {/* User Info */}
            <div className="px-4 py-3 mb-2 bg-white/50 rounded-xl border border-white/50">
              <p className="text-sm font-bold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 truncate font-medium">{user.email}</p>
            </div>

            <div className="space-y-0.5">
              {user.role === "admin" && (
                <MenuLink
                  icon={<LayoutDashboard size={16} />}
                  label="Admin Panel"
                  onClick={() => navigate("/admin")}
                  highlight
                />
              )}
              {user.role === "technician" && (
                <MenuLink
                  icon={<Wrench size={16} />}
                  label="Technician Dashboard"
                  onClick={() => navigate("/technician")}
                  highlight
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
                icon={<Heart size={16} />}
                label="Wishlist"
                onClick={() => navigate("/wishlist")}
              />
              <MenuLink
                icon={<Settings size={16} />}
                label="Settings"
                onClick={() => navigate("/profile")}
              />

              <div className="h-px bg-gray-200/50 my-2" />

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

function MenuLink({ icon, label, onClick, danger = false, highlight = false }) {
  return (
    <motion.button
      onClick={(e) => {
        onClick(e);
      }}
      whileHover={{ x: 4, backgroundColor: danger ? "rgba(254, 226, 226, 0.5)" : "rgba(0, 0, 0, 0.05)" }}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
        danger ? "text-red-600" : highlight ? "text-blue-600 bg-blue-50/50" : "text-gray-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={danger ? "text-red-500" : highlight ? "text-blue-500" : "text-gray-400 group-hover:text-black transition-colors"}>
          {icon}
        </span>
        {label}
      </div>
      {!danger && <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />}
    </motion.button>
  );
}

/* ================= Navbar ================= */
export default function Navbar({ openSignUp }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart } = useCart();
  const { unreadCount } = useNotification();

  const cartCount = cart?.length || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Store", path: "/", icon: <ShoppingBag size={18} /> },
    { name: "Repair", path: "/repair", icon: <Wrench size={18} /> },
    { name: "Support", path: "/contact", icon: <Menu size={18} /> },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? "bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between h-12">

          {/* 1. Brand */}
          <Link to="/intro" className="relative z-50 flex items-center gap-2 group">
            <img
              src={logo}
              alt="Ram Mobile Logo"
              className="w-8 h-8 rounded-lg object-contain group-hover:scale-110 transition-transform"
            />
            <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${scrolled || mobileMenuOpen ? 'text-gray-900' : 'text-gray-900'}`}>
              Ram Mobile
            </span>
          </Link>

          {/* 2. Desktop Navigation (Clean Minimalist) */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative group flex flex-col items-center"
                >
                  <span className={`text-sm tracking-wide transition-colors duration-300 ${isActive ? "text-black font-semibold" : "text-gray-500 font-medium hover:text-black"}`}>
                    {link.name}
                  </span>
                  
                  {/* Active Dot/Line */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1.5 w-1 h-1 bg-black rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Hover effect for non-active */}
                  {!isActive && (
                    <div className="absolute -bottom-1.5 w-1 h-1 bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* 3. Right Section */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* Expanded Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative group mr-2">
              <div className="relative flex items-center">
                <Search size={18} className="absolute left-3 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2.5 bg-gray-100/50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-blue-500/30 rounded-full w-40 focus:w-64 transition-all duration-300 outline-none text-sm text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </form>

            <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
                {/* Notification Bell */}
                {user && (
                    <Link to="/notifications" className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                        >
                            <Bell size={20} className="stroke-[1.5]" />
                            <AnimatePresence>
                            {unreadCount > 0 && (
                                <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                                >
                                {unreadCount > 9 ? '9+' : unreadCount}
                                </motion.span>
                            )}
                            </AnimatePresence>
                        </motion.button>
                    </Link>
                )}

                {/* Wishlist */}
                <Link to="/wishlist">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                >
                    <Heart size={20} className="stroke-[1.5]" />
                </motion.button>
                </Link>

                {/* Cart with Pulse Badge */}
                <Link to="/cart" className="relative mr-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white transition-colors"
                    >
                        <ShoppingCart size={20} className="stroke-[1.5]" />
                        <AnimatePresence>
                        {cartCount > 0 && (
                            <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                            >
                            {cartCount}
                            </motion.span>
                        )}
                        </AnimatePresence>
                    </motion.button>
                </Link>

                {/* Auth */}
                {user ? (
                <ProfileMenu />
                ) : (
                <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openSignUp?.()}
                    className="ml-2 bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-all shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40"
                >
                    Sign In
                </motion.button>
                )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-3">
             <Link to="/cart" className="relative">
                 <ShoppingCart size={24} className="text-gray-700" />
                 {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full">
                        {cartCount}
                    </span>
                 )}
             </Link>
             <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
             >
                 {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-6 space-y-4">
                 {/* Mobile Search */}
                 <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }}>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                        />
                    </div>
                 </form>

                 <div className="space-y-2">
                    {navLinks.map(link => (
                         <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium"
                         >
                             {link.icon}
                             {link.name}
                         </Link>
                    ))}
                    {user && (
                         <Link
                            to="/notifications"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium"
                         >
                             <Bell size={18} />
                             Notifications
                             {unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                         </Link>
                    )}
                 </div>

                 <div className="h-px bg-gray-100" />
                 
                 {user ? (
                     <div className="space-y-2">
                         <div className="flex items-center gap-3 p-3">
                             <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                                 {user.name[0]}
                             </div>
                             <div>
                                 <p className="font-semibold text-gray-900">{user.name}</p>
                                 <p className="text-xs text-gray-500">{user.email}</p>
                             </div>
                         </div>
                         <button 
                            onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-medium"
                         >
                             <Settings size={18} /> Settings
                         </button>
                     </div>
                 ) : (
                    <button
                        onClick={() => { openSignUp?.(); setMobileMenuOpen(false); }}
                        className="w-full bg-black text-white py-3 rounded-xl font-medium"
                    >
                        Sign In
                    </button>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Spacer to prevent content jump since nav is fixed */}
      <div className="h-24" /> 
    </>
  );
}
