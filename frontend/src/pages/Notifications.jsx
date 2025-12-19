import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Package,
  Wrench,
  ShoppingCart,
  Info,
  AlertCircle
} from "lucide-react";
import { api, API_ENDPOINTS } from "../config/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Notifications() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.NOTIFICATIONS.BASE);
      setNotifications(res.notifications || []);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
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

  const getIconColor = (type) => {
    const colors = {
      order: "bg-blue-100 text-blue-600",
      repair: "bg-purple-100 text-purple-600",
      cart: "bg-green-100 text-green-600",
      info: "bg-gray-100 text-gray-600",
      alert: "bg-red-100 text-red-600"
    };
    return colors[type] || "bg-gray-100 text-gray-600";
  };

  const filteredNotifications = filter === "all" 
    ? notifications 
    : filter === "unread" 
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.isRead);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {notifications.filter(n => !n.isRead).length} unread
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={notifications.every(n => n.isRead)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCheck size={18} />
            Mark All Read
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "unread", "read"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  getIcon={getIcon}
                  getIconColor={getIconColor}
                  markAsRead={markAsRead}
                  deleteNotification={deleteNotification}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// Notification Card Component
function NotificationCard({ notification, getIcon, getIconColor, markAsRead, deleteNotification }) {
  const Icon = getIcon(notification.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`bg-white rounded-lg border p-4 transition-all ${
        notification.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-lg ${getIconColor(notification.type)}`}>
          <Icon size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
            {!notification.isRead && (
              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          
          <p className="text-xs text-gray-500">
            {new Date(notification.createdAt).toLocaleString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!notification.isRead && (
            <button
              onClick={() => markAsRead(notification._id)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Mark as read"
            >
              <Check size={18} />
            </button>
          )}
          <button
            onClick={() => deleteNotification(notification._id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
