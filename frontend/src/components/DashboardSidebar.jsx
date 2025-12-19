import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User, 
  MapPin, 
  Heart, 
  Bell, 
  LogOut 
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: ShoppingBag, label: "My Orders", path: "/orders" }, // Changed logic: /orders might be MyOrders.jsx
  { icon: User, label: "Profile Settings", path: "/profile" },
  { icon: MapPin, label: "Addresses", path: "/addresses" },
  { icon: Heart, label: "Wishlist", path: "/wishlist" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="hidden lg:block w-72 bg-white border-r border-gray-100 min-h-screen sticky top-0 pt-24 pb-12 px-6">
      <div className="space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-12 pt-12 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
