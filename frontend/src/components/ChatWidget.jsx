import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { io } from "socket.io-client";
import { api } from "../config/api.js";
import useAuth from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";

export default function ChatWidget() {
  const { user } = useAuth();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [supportAdmin, setSupportAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  const messagesEndRef = useRef(null);

  // Initialize Socket.IO
  useEffect(() => {
    if (user && isOpen) {
      const token = localStorage.getItem("token");
      const newSocket = io("http://localhost:5000", {
        auth: { token }
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
      });

      newSocket.on("receive_message", (data) => {
        setMessages(prev => {
          if (prev.some(m => m._id === data._id)) return prev;
          return [...prev, {
            _id: data._id,
            sender: data.sender,
            message: data.message,
            createdAt: data.timestamp,
            senderRole: data.senderRole
          }];
        });
      });

      newSocket.on("message_sent", (data) => {
        console.log("Message sent successfully");
      });

      newSocket.on("message_error", (data) => {
        toast.error(data.error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (user && isOpen) {
      fetchSupportAdmin();
      fetchMessages();
    }
  }, [user, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSupportAdmin = async () => {
    try {
      const res = await api.get("/api/v1/chat/support-admin");
      setSupportAdmin(res.admin);
    } catch (error) {
      console.error("Failed to get support admin");
    }
  };

  const fetchMessages = async () => {
    if (!supportAdmin) {
      // Fetch admin first
      try {
        const adminRes = await api.get("/api/v1/chat/support-admin");
        const admin = adminRes.admin;
        setSupportAdmin(admin);

        const res = await api.get(`/api/v1/chat/messages/${admin._id}`);
        setMessages(res.messages || []);
      } catch (error) {
        console.error("Failed to fetch messages");
      }
    } else {
      try {
        const res = await api.get(`/api/v1/chat/messages/${supportAdmin._id}`);
        setMessages(res.messages || []);
      } catch (error) {
        console.error("Failed to fetch messages");
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !supportAdmin || !socket) return;

    try {
      await api.post("/api/v1/chat/send", {
        receiver: supportAdmin._id,
        message: newMessage
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to save message");
      toast.error("Failed to send message");
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-colors"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "60px" : "500px"
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Customer Support</h3>
                  <p className="text-xs text-blue-100">Online • Instant replies</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <Minimize2 size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">Start a conversation with our support team</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMyMessage = msg.sender.toString() === user._id.toString();

                      return (
                        <div
                          key={index}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMyMessage
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                              }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || loading}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
