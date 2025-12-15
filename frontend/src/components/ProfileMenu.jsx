import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProfileMenu() {
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
      {/* Avatar button */}
      <button
        className="
          w-9 h-9 rounded-full
          bg-black text-white
          flex items-center justify-center
          hover:bg-gray-800 transition
        "
        aria-label="Profile menu"
      >
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
            className="
              absolute right-0 mt-3 w-56
              rounded-xl bg-white
              border border-black/10
              shadow-xl
              overflow-hidden
              z-50
            "
          >
            {/* User info */}
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
              {/* User dashboard */}
              <MenuItem
                icon={<LayoutDashboard size={16} />}
                label="Dashboard"
                onClick={() => navigate("/dashboard")}
              />

              {/* Admin dashboard (admin only) */}
              {user.role === "admin" && (
                <>
                  <div className="my-1 h-px bg-black/5" />
                  <MenuItem
                    icon={<Shield size={16} />}
                    label="Admin Dashboard"
                    onClick={() => navigate("/admin")}
                  />
                </>
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

/* ---------- Menu item ---------- */
function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-4 py-2 flex items-center gap-2
        text-left transition
        ${
          danger
            ? "text-red-600 hover:bg-red-50"
            : "text-gray-700 hover:bg-gray-50"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}
