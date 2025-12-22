import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Wrench, MessageSquare, User, LogIn, LayoutDashboard } from "lucide-react";
import useAuth from "../hooks/useAuth";

export default function MobileBottomNav({ openSignUp }) {
  const location = useLocation();
  const { user } = useAuth();
  const { pathname } = location;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/repair", icon: Wrench, label: "Repair" },
    ...(user?.role === 'admin' ? [{ path: "/admin", icon: LayoutDashboard, label: "Admin" }] : [{ path: "/contact", icon: MessageSquare, label: "Support" }]),
    { 
      path: user ? "/dashboard" : null, 
      action: user ? null : openSignUp,
      icon: user ? User : LogIn, 
      label: user ? "Account" : "Sign In",
      isProfile: true
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] pb-safe">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item, index) => {
          const isActive = item.path === "/" 
            ? pathname === "/" 
            : item.path && pathname.startsWith(item.path);
            
          const Icon = item.icon;

          if (item.path) {
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                  isActive ? "text-black" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "opacity-100" : "opacity-0"}`}>
                  {item.label}
                </span>
                {isActive && <motion.div layoutId="bottom-nav-dot" className="absolute bottom-1 w-1 h-1 bg-black rounded-full" />}
              </Link>
            );
          } else {
             return (
              <button
                key={index}
                onClick={item.action}
                className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-black transition-colors"
              >
                <Icon size={20} strokeWidth={2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
             );
          }
        })}
      </div>
    </nav>
  );
}

// Add motion import
import { motion } from "framer-motion";
