import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, User, Clock } from "lucide-react";
import { io } from "socket.io-client";
import { api } from "../../config/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import useAuth from "../../hooks/useAuth.js";

export default function AdminChat() {
  const toast = useToast();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize Socket.IO
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");
      const newSocket = io("http://localhost:5000", {
        auth: { token }
      });

      newSocket.on("connect", () => {
        console.log("Admin socket connected");
      });

      newSocket.on("receive_message", (data) => {
        setMessages(prev => {
          // Check for duplicate _id to prevent double entries if latency occurs
          if (prev.some(m => m._id === data._id)) return prev;

          return [...prev, {
            _id: data._id,
            sender: data.sender,
            message: data.message,
            createdAt: data.timestamp,
            senderRole: data.senderRole
          }];
        });
        fetchConversations(); // Refresh conversation list
      });

      newSocket.on("new_customer_message", (data) => {
        console.log("New customer message received");
        fetchConversations();
      });

      newSocket.on("message_sent", (data) => {
        console.log("Message sent successfully");
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get("/api/v1/chat/conversations");
      setConversations(res.conversations || []);
    } catch (error) {
      console.error("Failed to fetch conversations");
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/api/v1/chat/messages/${userId}`);
      setMessages(res.messages || []);
    } catch (error) {
      console.error("Failed to fetch messages");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;

    // Call API to save message (Backend will emit socket event)
    try {
      await api.post("/api/v1/chat/send", {
        receiver: selectedUser._id,
        message: newMessage
      });

      setNewMessage("");
      // No need to manually update state here; socket listener will receive "receive_message" even for self
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Support Chat</h1>
            <p className="text-sm text-gray-600 mt-1">Real-time messaging • Instant delivery</p>
          </div>
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            ● Online
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

          {/* Conversations List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
              <p className="text-sm text-gray-600">{conversations.length} active</p>
            </div>

            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.partner._id}
                    onClick={() => setSelectedUser(conv.partner)}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${selectedUser?._id === conv.partner._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {conv.partner.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {conv.partner.email}
                        </p>
                        {conv.lastMessage && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {conv.lastMessage.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isAdmin = msg.senderRole === 'admin';

                      return (
                        <div
                          key={index}
                          className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-3 rounded-2xl ${isAdmin
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                              }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs ${isAdmin ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                              <Clock size={12} />
                              <span>
                                {new Date(msg.createdAt).toLocaleString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || loading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                      <Send size={18} />
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a customer to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
