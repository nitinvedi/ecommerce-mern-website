import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Wrench,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/repairs", label: "Repairs", icon: Wrench },
  { to: "/admin/chat", label: "Support Chat", icon: MessageCircle }
];

export default function AdminSidebar({ isOpen, onClose }) {
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <h2 className="mb-6 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Admin
      </h2>

      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition
              ${
                isActive
                  ? "bg-black/5 text-black"
                  : "text-gray-600 hover:bg-black/5"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-black/10 bg-white px-4 py-6">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] w-64 bg-white shadow-2xl p-6 pt-24 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
