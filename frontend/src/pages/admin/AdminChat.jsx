import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, User, Clock, Check } from "lucide-react";
import { api } from "../../config/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import useAuth from "../../hooks/useAuth.js";
import { useChatSocket } from "../../hooks/useChatSocket.js";
import { formatTime, groupMessagesByDate, playNotificationSound } from "../../utils/chatUtils.js";

export default function AdminChat() {
  const toast = useToast();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Ref for selectedUser to use inside socket callback without re-running effect
  const selectedUserRef = useRef(selectedUser);

  // Moved functions to top
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

  const fetchMessages = React.useCallback(async (userId) => {
    try {
      const res = await api.get(`/api/v1/chat/messages/${userId}`);
      setMessages(res.messages || []);
    } catch (error) {
      console.error("Failed to fetch messages");
    }
  }, []);

  useEffect(() => {
      selectedUserRef.current = selectedUser;
      if (selectedUser) {
        fetchMessages(selectedUser._id);
      }
  }, [selectedUser, fetchMessages]);

  const { isConnected, isTyping, sendTyping, sendStopTyping } = useChatSocket({
    user,
    enabled: true,
    onMessageReceived: (data) => {
        const currentUser = selectedUserRef.current;
        // If message is related to current user (either SENT by them or SENT TO them)
        if (currentUser && (data.sender.toString() === currentUser._id.toString() || data.receiver?.toString() === currentUser._id.toString())) {
           // 1. Optimistic append
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
            scrollToBottom();
            // 2. Strong sync
            fetchMessages(currentUser._id);
        } else {
            // New message from someone else
            playNotificationSound();
        }
        fetchConversations();
    }
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const res = await api.post("/api/v1/chat/send", {
        receiver: selectedUser._id,
        message: newMessage
      });

      // Optimistically update UI
      const sentMessage = res.message;
      setMessages(prev => {
          if (prev.some(m => m._id === sentMessage._id)) return prev;
          return [...prev, sentMessage];
      });

      setNewMessage("");
      sendStopTyping(selectedUser._id);
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!selectedUser) return;
    
    if (e.target.value.length > 0) {
        sendTyping(selectedUser._id);
    } else {
        sendStopTyping(selectedUser._id);
    }
  };

   // Keyboard shortcut
  const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage(e);
      }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Support Chat</h1>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                Real-time messaging • Instant delivery
                <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Socket Connected' : 'Socket Disconnected'}></span>
            </p>
          </div>
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            ● Online
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

          {/* Conversations List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-gray-900">Conversations</h2>
                <p className="text-sm text-gray-600">{conversations.length} active</p>
              </div>
              <button 
                onClick={fetchConversations}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
                title="Refresh conversations"
              >
                <motion.div whileTap={{ rotate: 360 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                    <path d="M16 16h5v5"/>
                  </svg>
                </motion.div>
              </button>
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
                          <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500 truncate max-w-[70%]">
                                {conv.lastMessage.message}
                              </p>
                              <span className="text-[10px] text-gray-400">
                                {formatTime(conv.lastMessage.createdAt)}
                              </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
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
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                          {selectedUser.email}
                          {isTyping && <span className="text-blue-500 font-medium text-xs ml-2">Typing...</span>}
                      </p>
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
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                             <div className="flex justify-center my-4">
                                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full border border-gray-300 shadow-sm">{date}</span>
                            </div>
                            {msgs.map((msg, index) => {
                                const isAdmin = msg.senderRole === 'admin';
                                return (
                                    <div
                                    key={msg._id || index}
                                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-2`}
                                    >
                                    <div
                                        className={`max-w-[70%] px-4 py-3 rounded-2xl ${isAdmin
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                        <div className={`flex items-center gap-1 mt-1 text-xs justify-end ${isAdmin ? 'text-blue-100' : 'text-gray-500'
                                        }`}>
                                        <Clock size={12} />
                                        <span>{formatTime(msg.createdAt)}</span>
                                        {isAdmin && <Check size={12} />}
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
                              <span className="text-xs text-gray-500 mr-2">Typing</span>
                              <motion.div 
                                animate={{ y: [0, -3, 0] }} 
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                className="w-1 h-1 bg-gray-400 rounded-full" 
                              />
                               <motion.div 
                                animate={{ y: [0, -3, 0] }} 
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                className="w-1 h-1 bg-gray-400 rounded-full" 
                              />
                               <motion.div 
                                animate={{ y: [0, -3, 0] }} 
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                className="w-1 h-1 bg-gray-400 rounded-full" 
                              />
                          </div>
                      </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-3">
                    <textarea
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      rows="1"
                       style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || loading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium h-[48px]"
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
