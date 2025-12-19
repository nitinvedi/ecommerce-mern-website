import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Wrench,
  MessageCircle
} from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/repairs", label: "Repairs", icon: Wrench },
  { to: "/admin/chat", label: "Support Chat", icon: MessageCircle }
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-black/10 bg-white px-4 py-6">
      <h2 className="mb-6 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Admin
      </h2>

      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
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
    </aside>
  );
}
