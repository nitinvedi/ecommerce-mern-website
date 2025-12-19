import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Heart, User } from "lucide-react";
import useAuth from "../hooks/useAuth";

export default function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/home", icon: ShoppingBag, label: "Shop" },
    { path: "/wishlist", icon: Heart, label: "Wishlist" },
    { path: "/dashboard", icon: User, label: "Account" },
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-4 h-16">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive(path)
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon size={22} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
