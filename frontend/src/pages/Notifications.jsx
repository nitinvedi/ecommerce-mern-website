import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  Trash2,
  Package,
  Wrench,
  ShoppingCart,
  Info,
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { useNotification } from "../context/NotificationContext.jsx";

// Helper for relative time (simple implementation to avoid new dep if possible, or use Intl)
const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
};

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, markAllAsRead, markAsRead, deleteNotification, loading } = useNotification();
  const [filter, setFilter] = useState("all");

  const filteredNotifications = filter === "all" 
    ? notifications 
    : filter === "unread" 
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.isRead);

  // 4. Feature: Smart Navigation (Deep Linking)
  const handleNotificationClick = (notification) => {
      // Mark as read immediately
      if (!notification.isRead) markAsRead(notification._id);

      // Navigation Logic based on type/content
      // This relies on the notification having a 'link' property or inferring from type/message
      // Since backend might not send 'link' yet, we infer:
      if (notification.type === 'order' || notification.title?.toLowerCase().includes('order')) {
          // Try to extract Order ID? Complex without data. 
          // Default to order list:
          navigate('/orders');
      } else if (notification.type === 'repair') {
          navigate('/repair'); // or repair status
      } else if (notification.type === 'cart') {
          navigate('/cart');
      }
      // Info/Alert might just stay on page
  };

  const getIcon = (type) => {
    const icons = {
      order: Package,
      repair: Wrench,
      cart: ShoppingCart,
      info: Info,
      alert: AlertCircle
    };
    return icons[type] || Bell;
  };

  const getStyles = (type) => {
    const styles = {
      order: "bg-blue-50 text-blue-600",
      repair: "bg-purple-50 text-purple-600",
      cart: "bg-green-50 text-green-600",
      info: "bg-gray-50 text-gray-600",
      alert: "bg-red-50 text-red-600"
    };
    return styles[type] || "bg-gray-50 text-gray-600";
  };

  // 8. Feature: Skeleton Loading
  if (loading) {
      return (
          <div className="min-h-screen bg-white pt-24 px-6 max-w-3xl mx-auto space-y-4">
              {[1,2,3].map(i => (
                  <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Activity</h1>
            <div className="flex gap-4">
                <button 
                    onClick={() => setFilter("all")} 
                    className={`text-sm font-medium transition-colors ${filter === "all" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilter("unread")} 
                    className={`text-sm font-medium transition-colors ${filter === "unread" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
                >
                    Unread
                </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
                onClick={markAllAsRead}
                disabled={notifications.every(n => n.isRead)}
                className="text-xs font-bold uppercase tracking-widest px-4 py-2 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-900"
            >
                Mark All Read
            </button>
          </div>
        </div>

        {/* List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No recent activity</p>
            {/* 9. Feature: Empty State Action */}
            <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline text-sm font-medium">
                Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredNotifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                    <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${
                            notification.isRead 
                                ? 'bg-white border-transparent hover:border-gray-100' 
                                : 'bg-[#F5F5F7] border-transparent hover:shadow-md'
                        }`}
                    >
                        {/* 7. Feature: Unread Dot Indicator */}
                        {!notification.isRead && (
                            <span className="absolute top-5 left-5 w-2 h-2 bg-blue-500 rounded-full" />
                        )}

                        <div className="flex gap-5 pl-4"> 
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getStyles(notification.type)}`}>
                                <Icon size={18} />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-semibold text-base mb-1 ${notification.isRead ? "text-gray-700" : "text-black"}`}>{notification.title}</h3>
                                    {/* 6. Feature: Relative Time */}
                                    <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                                        <Clock size={10} />
                                        {timeAgo(notification.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-lg mb-2">{notification.message}</p>
                            </div>
                        </div>

                        {/* Actions Overlay */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); markAsRead(notification._id); }}
                                    className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm hover:shadow-md transition-all"
                                    title="Mark as read"
                                >
                                    <Check size={14} />
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }}
                                className="p-1.5 bg-white text-red-500 rounded-lg shadow-sm hover:shadow-md transition-all"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
