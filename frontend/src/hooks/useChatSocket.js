import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useToast } from '../context/ToastContext.jsx';
import { SOCKET_URL } from '../config/api.js';

export const useChatSocket = ({ user, onMessageReceived, enabled = true }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (!user || !enabled) return;

    // Initialize socket
    const token = localStorage.getItem("token");
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true, // Ensure cookies/headers are sent if needed
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
        console.error("[Chat] Connection failed:", err.message);
        setIsConnected(false);
    });

    // Message listener
    newSocket.on("receive_message", (data) => {
        if (onMessageReceived) {
            onMessageReceived(data);
        }
    });
    
    // Admin specific listener (might be ignored by User chat)
    newSocket.on("new_customer_message", (data) => {
        if (onMessageReceived) {
            onMessageReceived(data); // Re-use same handler or robustly fetch
        }
    });

    // Typing listeners
    newSocket.on("user_typing", (data) => {
        setIsTyping(true);
        // Auto clear typing status after 3 seconds if no stop signal received
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    });

    newSocket.on("user_stop_typing", (data) => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
    });

    newSocket.on("message_error", (data) => {
        toast.error(data.error || "Message error");
    });

    setSocket(newSocket);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      newSocket.disconnect();
    };
  }, [user, enabled]); // Intentionally minimal dependencies

  // Helpers
  const sendTyping = useCallback((receiverId) => {
    if (socket && isConnected) {
      socket.emit("typing", { receiver: receiverId });
    }
  }, [socket, isConnected]);

  const sendStopTyping = useCallback((receiverId) => {
    if (socket && isConnected) {
      socket.emit("stop_typing", { receiver: receiverId });
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    isTyping,
    sendTyping,
    sendStopTyping
  };
};
