import { useEffect, useState, useRef } from "react";
import { Send, User as UserIcon, Search, MoreVertical, Trash2, MessageSquare, RefreshCw, ArrowLeft } from "lucide-react";
import { socket, api, API_ENDPOINTS } from "../../config/api";
import useAuth from "../../hooks/useAuth";
import { useChatSocket } from "../../hooks/useChatSocket";
import AdminLayout from "../../layouts/AdminLayout";

export default function AdminChat() {
   const { user } = useAuth();

   // State
   const [conversations, setConversations] = useState([]);
   const [selectedUser, setSelectedUser] = useState(null);
   const [messages, setMessages] = useState([]);
   const [newMessage, setNewMessage] = useState("");
   const [search, setSearch] = useState("");
   const [refreshing, setRefreshing] = useState(false);

   const messagesEndRef = useRef(null);
   const selectedUserRef = useRef(null); // Keep track for socket

   // Update ref when selectedUser changes
   useEffect(() => {
      selectedUserRef.current = selectedUser;
   }, [selectedUser]);

   // Canned Responses
   const canned = ["Hello! How can I help?", "Your order is being processed.", "We are checking with the technician.", "Thank you for contacting us."];
   // Initial Fetch
   useEffect(() => {
      if (user?.role === "admin") {
         fetchConversations();
      }
   }, [user]);

   // useChatSocket Hook for real-time updates
   const { isConnected } = useChatSocket({
      user,
      enabled: !!user,
      onMessageReceived: (msg) => {
         // If message is for currently open chat, append it
         if (selectedUserRef.current && (msg.sender === selectedUserRef.current._id || msg.receiver === selectedUserRef.current._id)) {
            setMessages(prev => {
               // Strict deduping
               if (prev.some(m => m._id === msg._id)) return prev;
               return [...prev, msg];
            });
         }
         // Always refresh list to show unread/latest
         fetchConversations();
      }
   });

   // Scroll to bottom on messages change
   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]);

   const fetchConversations = async () => {
      try {
         setRefreshing(true);
         const res = await api.get(API_ENDPOINTS.CHAT.CONVERSATIONS);

         let list = [];
         if (res?.conversations && Array.isArray(res.conversations)) {
            list = res.conversations;
         } else if (Array.isArray(res)) {
            list = res;
         }

         const formatted = list.map(c => ({
            ...c,
            user: c.partner || c.user || { name: "Unknown", email: "", _id: "unknown" }
         }));

         setConversations(formatted);
      } catch (err) {
         console.error("AdminChat: Fetch conversations failed", err);
      } finally {
         setTimeout(() => setRefreshing(false), 500); // Min spin time
      }
   };

   const selectChat = async (conv) => {
      if (!conv || !conv.user) return;
      setSelectedUser(conv.user);
      try {
         const url = API_ENDPOINTS.CHAT.MESSAGES(conv.user._id);
         const res = await api.get(url);
         const msgs = res.messages || res.data || (Array.isArray(res) ? res : []);
         setMessages(msgs);

         // Optimistic read update
         setConversations(prev => prev.map(c => c.user._id === conv.user._id ? { ...c, unread: 0 } : c));
      } catch (err) {
         console.error("AdminChat: Fetch messages failed", err);
         setMessages([]);
      }
   };

   const handleSend = async (e) => {
      e?.preventDefault();
      if (!newMessage.trim() || !selectedUser) return;

      const text = newMessage;
      setNewMessage("");

      try {
         const res = await api.post(API_ENDPOINTS.CHAT.SEND, {
            receiver: selectedUser._id,
            message: text
         });

         // Optimistic append with backend response
         const newMsg = res.message || res.data;
         if (newMsg) {
            setMessages(prev => [...prev, newMsg]);
         }
      } catch (err) {
         console.error("Send failed");
      }
   };

   const filtered = conversations.filter(c => c.user.name.toLowerCase().includes(search.toLowerCase()));

   // Responsive layout: on mobile, list takes full width, unless chat is selected
   // We can control this with CSS classes using 'hidden' or 'flex' based on state

   return (
      <AdminLayout>
         <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-140px)] bg-white md:rounded-2xl shadow-xl border border-gray-200 overflow-hidden ring-1 ring-black/5 flex-col md:flex-row">
            {/* Sidebar - List of chats */}
            {/* Hidden on mobile if a chat is selected */}
            <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/50 ${selectedUser ? "hidden md:flex" : "flex"}`}>
               <div className="p-4 md:p-5 border-b border-gray-100 bg-white">
                  <div className="flex justify-between items-center mb-4 md:mb-5">
                     <h2 className="font-bold text-xl tracking-tight">Messages</h2>
                     <button
                        onClick={() => {
                           fetchConversations();
                           if (selectedUser) selectChat({ user: selectedUser });
                        }}
                        className={`p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-all ${refreshing ? "animate-spin text-blue-600 bg-blue-50" : ""}`}
                        title="Refresh"
                     >
                        <RefreshCw size={16} />
                     </button>
                  </div>
                  <div className="relative group">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                     <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search chats..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                     />
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {filtered.map(c => (
                     <div key={c.user._id} onClick={() => selectChat(c)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border border-transparent ${selectedUser?._id === c.user._id ? "bg-white border-gray-200 shadow-sm" : "hover:bg-white/60 hover:shadow-sm"}`}>
                        <div className="flex justify-between items-start mb-1">
                           <span className={`font-semibold text-sm ${selectedUser?._id === c.user._id ? "text-blue-600" : "text-gray-900"}`}>{c.user.name}</span>
                           {c.unread > 0 && <span className="bg-[#0071e3] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{c.unread}</span>}
                        </div>
                        <p className={`text-xs truncate ${c.unread > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}>{c.lastMessage?.message || "No messages"}</p>
                     </div>
                  ))}
                  {filtered.length === 0 && (
                     <div className="text-center py-10 opacity-50">
                        <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500">No recent chats</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Chat Area */}
            {/* Hidden on mobile if NO chat is selected */}
            <div className={`flex-1 flex flex-col bg-[#F9FAFB] ${!selectedUser ? "hidden md:flex" : "flex"} w-full md:w-auto`}>
               {selectedUser ? (
                  <>
                     {/* Header */}
                     <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10 sticky top-0 md:static">
                        <div className="flex items-center gap-3 md:gap-4">
                           {/* Mobile Back Button */}
                           <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                              <ArrowLeft size={20} />
                           </button>

                           <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                 {selectedUser.name[0]}
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                           </div>
                           <div>
                           <h3 className="font-bold text-gray-900 text-base">{selectedUser.name}</h3>
                           <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                              {selectedUser.email}
                           </p>
                        </div>
                        </div>
                        <button
                           onClick={async () => {
                              if (!selectedUser) return;
                              if (window.confirm("Are you sure you want to delete this chat history? This cannot be undone.")) {
                                 try {
                                    await api.delete(API_ENDPOINTS.CHAT.DELETE(selectedUser._id));

                                    // Update state
                                    setConversations(prev => prev.filter(c => c.user._id !== selectedUser._id));
                                    setSelectedUser(null);
                                    setMessages([]);
                                 } catch (err) {
                                    console.error("Failed to delete chat", err);
                                    alert("Failed to delete chat");
                                 }
                              }
                           }}
                           className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                           title="Delete Chat"
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>

                     {/* Messages */}
                     <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                        {messages.map((m, i) => {
                           const isMe = m.sender === user?._id;
                           return (
                              <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                 <div className={`max-w-[75%] md:max-w-[70%] px-4 md:px-5 py-3 text-sm shadow-sm ${isMe ? "bg-[#1d1d1f] text-white rounded-[20px] rounded-br-[4px]" : "bg-white text-gray-800 rounded-[20px] rounded-bl-[4px] border border-gray-100"}`}>
                                    <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                                 </div>
                              </div>
                           )
                        })}
                        <div ref={messagesEndRef} />
                     </div>

                     {/* Input Area */}
                     <div className="p-3 md:p-4 bg-white border-t border-gray-200">
                        {/* Canned Responses */}
                        <div className="flex gap-2 mb-3 md:mb-4 overflow-x-auto pb-1 hide-scrollbar">
                           {canned.map((text, i) => (
                              <button key={i} onClick={() => setNewMessage(text)} className="flex-shrink-0 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 transition-colors">
                                 {text}
                              </button>
                           ))}
                        </div>
                        <form onSubmit={handleSend} className="flex gap-2 md:gap-3 relative items-center">
                           <input
                              value={newMessage}
                              onChange={e => setNewMessage(e.target.value)}
                              className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-5 md:px-6 py-3 md:py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                              placeholder="Type a message..."
                           />
                           <button type="submit" disabled={!newMessage.trim()} className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full p-3 md:p-3.5 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none font-medium flex items-center gap-2">
                              <Send size={18} md:size={20} className={newMessage.trim() ? "mr-1" : ""} />
                           </button>
                        </form>
                     </div>
                  </>
               ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50/30 p-4 text-center">
                     <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <MessageSquare size={40} className="text-gray-300" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Chat Portal</h3>
                     <p className="max-w-xs text-gray-500">Select a conversation from the left to start providing support.</p>
                  </div>
               )}
            </div>

            {/* User Info Sidebar - Simplified for Admin */}
            {selectedUser && (
               <div className="w-72 border-l border-gray-200 bg-white p-6 hidden 2xl:block overflow-y-auto">
                  <div className="text-center mb-8">
                     <div className="w-24 h-24 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-gray-400 border-4 border-white shadow-sm">
                        {selectedUser.name[0]}
                     </div>
                     <h3 className="font-bold text-xl text-gray-900">{selectedUser.name}</h3>
                     <p className="text-sm text-gray-500 mt-1">{selectedUser.email}</p>
                     <div className="mt-4 flex justify-center gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Customer</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Verfied</span>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-3">
                           <button className="col-span-2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors">View Profile</button>
                        </div>
                     </div>

                     <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <h4 className="text-xs font-bold text-yellow-800 uppercase mb-2">Support Note</h4>
                        <p className="text-xs text-yellow-700 leading-relaxed">Always confirm order ID before processing refunds.</p>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </AdminLayout>
   );
}
