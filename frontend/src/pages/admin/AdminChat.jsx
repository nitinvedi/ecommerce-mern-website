import { useEffect, useState, useRef } from "react";
import { Send, User as UserIcon, Search, MoreVertical, Archive, MessageSquare } from "lucide-react";
import { socket, api, API_ENDPOINTS } from "../../config/api";
import useAuth from "../../hooks/useAuth";
import AdminLayout from "../../layouts/AdminLayout";

export default function AdminChat() {
  const { user } = useAuth();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [isTyping, setIsTyping] = useState(false); // User is typing?
  
  const messagesEndRef = useRef(null);
  
  // Canned Responses
  const canned = ["Hello! How can I help?", "Your order is being processed.", "We are checking with the technician.", "Thank you for contacting us."];

  useEffect(() => {
    if (user?.role === "admin") {
      fetchConversations();
    }
    
    // Connect socket
    if (!socket.connected) {
       socket.connect();
    }

    // Join admin room if needed, or just rely on global auth
    socket.emit("join", user._id); 
    
    socket.on("receiveMessage", (msg) => {
        if (selectedUser && (msg.sender === selectedUser._id || msg.receiver === selectedUser._id)) {
            setMessages(prev => [...prev, msg]);
        }
        updateConversationPreview(msg);
        fetchConversations(); 
    });

    return () => {
       socket.off("receiveMessage");
       // socket.disconnect(); // Optional: keep connected for notifications elsewhere, but good practice to clean up listeners
    };
  }, [user, selectedUser]); // Re-run if user/selectedUser changes is tricky for socket. Better to separate effects.

  // Separate effect for socket connection to avoid reconnect loops
  useEffect(() => {
     if (!socket.connected) socket.connect();
     return () => {
        socket.off("receiveMessage");
     }
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.CHAT.CONVERSATIONS); 
      console.log("AdminChat: Raw conversations response", res);
      
      let list = [];
      if (res?.conversations && Array.isArray(res.conversations)) {
          list = res.conversations;
      } else if (Array.isArray(res)) {
          list = res; // Fallback if backend changed
      }
      
      // Map partner to user, ensure structure
      const formatted = list.map(c => ({ 
          ...c, 
          user: c.partner || c.user || { name: "Unknown", email: "", _id: "unknown" } 
      }));
      
      console.log("AdminChat: Formatted conversations", formatted);
      setConversations(formatted);
    } catch (err) {
      console.error("AdminChat: Fetch conversations failed", err);
      setConversations([]);
    }
  };

  const selectChat = async (conv) => {
     if (!conv || !conv.user) return;
     console.log("AdminChat: Selecting user", conv.user);
     
     setSelectedUser(conv.user);
     try {
        const url = API_ENDPOINTS.CHAT.MESSAGES(conv.user._id);
        console.log("AdminChat: Fetching messages from", url);
        
        const res = await api.get(url);
        console.log("AdminChat: Raw messages response", res);
        
        const msgs = res.messages || res.data || (Array.isArray(res) ? res : []);
        setMessages(msgs);
        
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
        setMessages(prev => [...prev, res.message || res.data]); 
     } catch (err) {
        console.error("Send failed"); 
     }
  };

  const updateConversationPreview = (msg) => {
     // Logic to update the simplified conversation list on left
  };

  const filtered = conversations.filter(c => c.user.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         {/* Sidebar */}
         <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50">
               <div className="p-4 border-b border-gray-100 bg-white">
                  <div className="flex justify-between items-center mb-4">
                     <h2 className="font-bold text-lg">Messages</h2>
                     <button onClick={() => {
                        fetchConversations();
                        if(selectedUser) selectChat({ user: selectedUser });
                     }} className="text-xs text-blue-600 hover:underline">Refresh</button>
                  </div>
                  <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     placeholder="Search chats..."
                     className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-black"
                  />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto">
               {filtered.map(c => (
                  <div key={c.user._id} onClick={() => selectChat(c)}
                     className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors ${selectedUser?._id === c.user._id ? "bg-white border-l-4 border-l-black" : ""}`}>
                     <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-gray-900">{c.user.name}</span>
                        {c.unread > 0 && <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">{c.unread}</span>}
                     </div>
                     <p className="text-xs text-gray-500 truncate">{c.lastMessage?.message || "No messages"}</p>
                  </div>
               ))}
               {filtered.length === 0 && <p className="text-center text-gray-400 text-sm mt-8">No conversations</p>}
            </div>
         </div>

         {/* Chat Area */}
         <div className="flex-1 flex flex-col bg-white">
            {selectedUser ? (
               <>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                           {selectedUser.name[0]}
                        </div>
                        <div>
                           <h3 className="font-bold text-gray-900">{selectedUser.name}</h3>
                           <p className="text-xs text-green-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
                           </p>
                        </div>
                     </div>

                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                     {messages.map((m, i) => {
                        const isMe = m.sender === user?._id;
                        return (
                           <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isMe ? "bg-black text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"}`}>
                                 {m.message}
                              </div>
                           </div>
                        )
                     })}
                     <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white border-t border-gray-100">
                     {/* Canned Responses */}
                     <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        {canned.map((text, i) => (
                           <button key={i} onClick={() => setNewMessage(text)} className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-600 transition-colors">
                              {text}
                           </button>
                        ))}
                     </div>
                     <form onSubmit={handleSend} className="flex gap-2">
                        <input 
                           value={newMessage}
                           onChange={e => setNewMessage(e.target.value)}
                           className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                           placeholder="Type a message..."
                        />
                        <button type="submit" className="bg-black hover:bg-gray-800 text-white rounded-xl px-6 transition-colors">
                           <Send size={18} />
                        </button>
                     </form>
                  </div>
               </>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                  <MessageSquare size={48} className="mb-4 text-gray-200" />
                  <p>Select a conversation to start chatting</p>
               </div>
            )}
         </div>

         {/* Right Sidebar (User Info) - Only when selected */}
         {selectedUser && (
            <div className="w-72 border-l border-gray-100 bg-white p-6 hidden xl:block">
               <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center text-3xl text-gray-400 font-bold">
                     {selectedUser.name[0]}
                  </div>
                  <h3 className="font-bold text-lg">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
               </div>

               <div className="space-y-6">
                  <div>
                     <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Customer Since</h4>
                     <p className="text-sm font-medium">Dec 2023</p>
                  </div>
                  <div>
                     <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Recent Orders</h4>
                     <div className="space-y-2">
                        <div className="bg-gray-50 p-3 rounded-lg text-sm">
                           <div className="flex justify-between font-medium">
                              <span>#ORD-992</span>
                              <span>₹1,200</span>
                           </div>
                           <p className="text-xs text-gray-500 mt-1">Delivered - 2 days ago</p>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         )}
      </div>
    </AdminLayout>
  );
}
