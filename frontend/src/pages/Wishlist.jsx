import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { api, API_ENDPOINTS, SOCKET_URL } from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";
import useAuth from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";

const GrainOverlay = () => (
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
);

export default function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();
  
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.WISHLIST.BASE);
      if (res && res.products) {
        setWishlist(res.products);
      } else {
        setWishlist([]);
      }
    } catch (error) {
    //   if (error.message && !error.message.includes("401")) {
    //     toast.error(error.message || "Failed to load wishlist");
    //   }
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await api.delete(API_ENDPOINTS.WISHLIST.REMOVE(productId));
      setWishlist(wishlist.filter(item => item._id !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success("Added to cart");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
        
        {/* Header Hero */}
        <div className="relative bg-[#F5F5F7] py-20 overflow-hidden">
            <GrainOverlay />
            
            {/* Back Button */}
            <div className="absolute top-8 left-8 z-20">
               <button 
                  onClick={() => navigate('/dashboard')} 
                  className="p-3 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
               >
                  <ArrowLeft size={20} />
               </button>
            </div>
            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white/50 backdrop-blur rounded-full border border-black/5">
                    <Heart size={14} className="fill-red-500 stroke-red-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-600">My Collection</span>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
                    Your Wishlist.
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-gray-500 max-w-xl">
                    Wait for the perfect moment or bag them now. <br/>You currently have {wishlist.length} item{wishlist.length !== 1 && "s"} saved.
                </motion.p>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
            {wishlist.length === 0 ? (
                 <div className="text-center py-24">
                    <h2 className="text-2xl font-bold mb-4">Your collection is empty.</h2>
                    <p className="text-gray-500 mb-8">Start exploring our latest drops to find something you love.</p>
                    <button onClick={() => navigate('/')} className="px-8 py-3 bg-black text-white rounded-full font-medium hover:scale-105 transition-transform">
                        Start Shopping
                    </button>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                    {wishlist.map((product, index) => (
                        <motion.div 
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group"
                        >
                            {/* Card Image */}
                            <div className="relative aspect-[3/4] bg-[#F5F5F7] rounded-[20px] overflow-hidden mb-5 cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                                {/* Remove Icon */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleRemove(product._id); }}
                                    className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-sm hover:bg-black hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                                
                                <div className="w-full h-full p-8 flex items-center justify-center">
                                    <img 
                                        src={product.images?.[0]?.startsWith("http") ? product.images[0] : `${SOCKET_URL}${product.images?.[0]}`}
                                        alt={product.name} 
                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out" 
                                    />
                                </div>

                                {/* Quick Add */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                                    className="absolute bottom-4 left-4 right-4 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-xl translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart size={14} /> Add To Bag
                                </button>
                            </div>

                            {/* Info */}
                            <div className="space-y-1">
                                <h3 className="font-medium text-lg leading-snug cursor-pointer hover:underline decoration-1 underline-offset-4" onClick={() => navigate(`/product/${product._id}`)}>
                                    {product.name}
                                </h3>
                                <p className="text-sm text-gray-500">{product.brand}</p>
                                <div className="pt-2 font-bold text-gray-900">
                                    ₹{product.price?.toLocaleString()}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}
