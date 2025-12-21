import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minimize2, Check, Clock } from "lucide-react";
import { api, API_ENDPOINTS } from "../config/api.js";
import useAuth from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";
import { useChatSocket } from "../hooks/useChatSocket.js";
import { formatTime, groupMessagesByDate, playNotificationSound } from "../utils/chatUtils.js";

export default function ChatWidget({ isOpen, onClose }) {
  const { user } = useAuth();
  const toast = useToast();

  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [supportAdmin, setSupportAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  // Unread badge counter
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Fetch Logic
  const fetchMessages = React.useCallback(async () => {
    if (!supportAdmin) {
      try {
        const adminRes = await api.get(API_ENDPOINTS.CHAT.SUPPORT_ADMIN);
        const admin = adminRes.admin;
        setSupportAdmin(admin);

        const res = await api.get(API_ENDPOINTS.CHAT.MESSAGES(admin._id));
        setMessages(res.messages || []);
      } catch (error) {
        console.error("Failed to fetch messages or support admin:", error);
      }
    } else {
      try {
        const res = await api.get(API_ENDPOINTS.CHAT.MESSAGES(supportAdmin._id));
        setMessages(res.messages || []);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }
  }, [supportAdmin]);

  // Socket Hook
  const { isConnected, isTyping, sendTyping, sendStopTyping } = useChatSocket({
    user,
    enabled: true, // Always connect if user is logged in
    onMessageReceived: (data) => {
        // Optimistic append
        setMessages(prev => {
            if (prev.some(m => m._id.toString() === data._id.toString())) return prev;
            return [...prev, {
                _id: data._id,
                sender: data.sender,
                message: data.message,
                createdAt: data.timestamp,
                senderRole: data.senderRole
            }];
        });
        
        // Notification
        if (!isOpen || isMinimized) {
            setUnreadCount(prev => prev + 1);
            playNotificationSound();
        } else {
            // If open and receiving from admin, play sound delicately
            if (data.senderRole === "admin") {
                playNotificationSound();
            }
        }
        
        // Strong Sync
        fetchMessages();
    }
  });

  useEffect(() => {
    if (user && isOpen) {
      fetchMessages();
      setUnreadCount(0);
    }
  }, [user, isOpen, fetchMessages]);

  // Auto-scroll on new message
  useEffect(() => {
    if (messagesEndRef.current && (isOpen && !isMinimized)) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !supportAdmin) return;

    try {
      const res = await api.post(API_ENDPOINTS.CHAT.SEND, {
        receiver: supportAdmin._id,
        message: newMessage
      });
      
      const sentMessage = res.message;
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");
      sendStopTyping(supportAdmin._id);
    } catch (error) {
      console.error("Failed to save message");
      toast.error("Failed to send message");
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!supportAdmin) return;
    
    // Throttle typing emit? Hook handles it? Actually hook just emits.
    // We should emit typing on change
    if (e.target.value.length > 0) {
        sendTyping(supportAdmin._id);
    } else {
        sendStopTyping(supportAdmin._id);
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage(e);
      }
  };

  if (!user) return null;

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <>
      {/* Floating Button Removed - triggering via Navbar */}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: -20 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: 0,
              height: isMinimized ? "70px" : "600px" // Taller chat
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9, x: -20 }}
            className="fixed bottom-8 left-8 z-[100] w-[350px] sm:w-[400px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-5 bg-black text-white flex items-center justify-between cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
              <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                       <MessageCircle size={22} className="fill-white/50" />
                    </div>
                    {/* Connection Status Dot */}
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black ${isConnected ? 'bg-[#DFFF00]' : 'bg-red-500'}`} 
                         title={isConnected ? "Online" : "Connecting..."}
                    />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Support Team</h3>
                  <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                    {isConnected ? "Online" : "Offline"} {isTyping && "• Typing..."}
                  </p>
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-70 hover:opacity-100"
                >
                  <Minimize2 size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-70 hover:opacity-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
                >
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">Start a conversation with us!</p>
                    </div>
                  ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="flex justify-center my-4">
                                <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">{date}</span>
                            </div>
                            {msgs.map((msg, index) => {
                                const isMyMessage = msg.sender.toString() === user._id.toString();
                                return (
                                    <div
                                    key={msg._id || index}
                                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4`}
                                    >
                                    <div
                                        className={`max-w-[80%] px-5 py-3 rounded-2xl text-left shadow-sm ${isMyMessage
                                        ? 'bg-black text-white rounded-br-sm'
                                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                        }`}
                                    >
                                        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.message}</p>
                                        <div className={`flex items-center justify-end gap-1 mt-1.5 ${isMyMessage ? 'text-gray-400' : 'text-gray-400'}`}>
                                            <span className="text-[10px] font-medium opacity-70">{formatTime(msg.createdAt)}</span>
                                            {isMyMessage && <Check size={12} className="opacity-70" />}
                                        </div>
                                    </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                  )}
                  {isTyping && (
                      <div className="flex justify-start mb-2">
                          <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                              <motion.div 
                                animate={{ y: [0, -5, 0] }} 
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
                              />
                               <motion.div 
                                animate={{ y: [0, -5, 0] }} 
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
                              />
                               <motion.div 
                                animate={{ y: [0, -5, 0] }} 
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
                              />
                          </div>
                      </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
                      rows="1"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || loading}
                      className="p-3 h-[44px] w-[44px] flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                    >
                      <Send size={18} className={newMessage.trim() ? "ml-1" : ""} />
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
