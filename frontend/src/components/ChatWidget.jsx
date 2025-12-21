import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: -20 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: 0,
              height: isMinimized ? "72px" : "min(600px, 80vh)" 
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9, x: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 sm:right-auto sm:bottom-6 sm:left-6 z-[100] w-full sm:w-[360px] md:w-[380px] bg-white sm:rounded-[28px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden font-sans ring-1 ring-black/5 ${isMinimized ? "!w-[min(360px,90vw)] !bottom-6 !left-6 rounded-[28px]" : "h-[100dvh] sm:h-auto rounded-t-[20px] sm:rounded-[28px]"}`}
          >
            {/* Header */}
            <div 
                className={`p-4 md:p-5 bg-[#1d1d1f] text-white flex items-center justify-between cursor-pointer transition-all ${isMinimized ? "hover:bg-gray-900" : ""}`} 
                onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative">
                    <div className="w-10 h-10 md:w-11 md:h-11 bg-white/10 rounded-full flex items-center justify-center border border-white/5 backdrop-blur-sm">
                       <MessageCircle size={20} className="fill-white" />
                    </div>
                    {/* Connection Status Dot */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1d1d1f] ${isConnected ? 'bg-[#3bf15d] shadow-[0_0_8px_rgba(59,241,93,0.5)]' : 'bg-red-500'}`} 
                         title={isConnected ? "Online" : "Connecting..."}
                    />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg leading-tight tracking-tight">Support Team</h3>
                  <p className="text-[10px] md:text-[11px] text-gray-400 font-medium tracking-wide uppercase mt-0.5">
                    {isTyping ? <span className="text-[#3bf15d] animate-pulse">Typing...</span> : isConnected ? "We typically reply in 5m" : "Connecting..."}
                  </p>
                </div>
              </div>

              <div className="flex gap-1 md:gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white"
                >
                  <Minimize2 size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white"
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
                    className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 md:space-y-6 bg-[#F5F5F7] scrollbar-thin scrollbar-thumb-gray-300"
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-60">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                           <MessageCircle size={28} md:size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-900 font-semibold mb-1">We're here to help!</p>
                      <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">Ask us anything about repairs, products, or your order.</p>
                      <div className="mt-6 flex flex-wrap justify-center gap-2">
                          {["Order Status?", "Repair Cost?", "Warranty info"].map(q => (
                              <button key={q} onClick={() => setNewMessage(q)} className="text-[10px] bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-500 transition-colors">
                                  {q}
                              </button>
                          ))}
                      </div>
                    </div>
                  ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="flex justify-center mb-4 mt-2">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-200/50 px-3 py-1 rounded-full backdrop-blur-sm">{date}</span>
                            </div>
                            {msgs.map((msg, index) => {
                                const isMyMessage = msg.sender.toString() === user._id.toString();
                                const isAdmin = !isMyMessage;
                                return (
                                    <div
                                        key={msg._id || index}
                                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start items-end'} mb-2 group`}
                                    >
                                        {/* Admin Avatar */}
                                        {isAdmin && (
                                            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold mr-2 mb-1 shadow-sm shrink-0">
                                                SP
                                            </div>
                                        )}
                                        
                                        <div className={`max-w-[85%] sm:max-w-[75%] relative ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col`}> 
                                            <div
                                                className={`px-4 py-2.5 text-[14px] leading-relaxed shadow-sm transition-all ${isMyMessage
                                                ? 'bg-[#0071e3] text-white rounded-[20px] rounded-br-md hover:bg-[#0077ed]'
                                                : 'bg-white text-[#1d1d1f] rounded-[20px] rounded-bl-md border border-gray-100'
                                                }`}
                                            >
                                                <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                            </div>
                                            <span className={`text-[9px] text-gray-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMyMessage ? 'text-right' : 'text-left'}`}>
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                  )}
                  {isTyping && (
                      <div className="flex justify-start mb-2 ml-8">
                          <div className="bg-white border border-gray-200/50 px-3 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1 w-fit">
                              <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
                              />
                               <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
                              />
                               <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
                              />
                          </div>
                      </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t-0 relative">
                  <div className="flex items-end gap-2 bg-gray-50/80 p-1.5 rounded-[24px] border border-gray-200 focus-within:bg-white focus-within:border-blue-500/30 focus-within:shadow-md focus-within:shadow-blue-500/5 transition-all duration-300">
                    <textarea
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      className="flex-1 pl-4 pr-2 py-2.5 bg-transparent border-none focus:ring-0 text-[15px] text-gray-800 placeholder:text-gray-400 resize-none max-h-[120px] leading-relaxed"
                      rows="1"
                      style={{ minHeight: '44px' }}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || loading}
                      className={`p-2.5 rounded-full transition-all duration-300 flex-shrink-0 mb-[1px] ${
                        newMessage.trim() 
                          ? "bg-[#0071e3] text-white shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 hover:bg-[#0077ed]" 
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Send size={18} className={newMessage.trim() ? "translate-x-0.5" : ""} />
                    </button>
                  </div>
                  <div className="text-center mt-2">
                       <p className="text-[10px] text-gray-300 font-medium tracking-wide">Powered by <span className="font-bold text-gray-400">TechFix</span></p>
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
