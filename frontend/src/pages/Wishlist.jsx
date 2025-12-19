import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { api, API_ENDPOINTS } from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";
import useAuth from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

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
      console.log("Wishlist API response:", res);
      
      // Handle the response - it should have a products array
      if (res && res.products) {
        setWishlist(res.products);
        console.log("Wishlist loaded successfully:", res.products.length, "items");
      } else {
        console.warn("Unexpected response format:", res);
        setWishlist([]);
      }
    } catch (error) {
      console.error("Wishlist fetch error:", error);
      // Only show error if it's not a 401 (user not logged in)
      if (error.message && !error.message.includes("401")) {
        toast.error(error.message || "Failed to load wishlist");
      }
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

  const handleClearWishlist = async () => {
    if (!window.confirm("Clear entire wishlist?")) return;
    
    try {
      await api.delete(API_ENDPOINTS.WISHLIST.BASE);
      setWishlist([]);
      toast.success("Wishlist cleared");
    } catch (error) {
      toast.error("Failed to clear wishlist");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-gray-500 text-center">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <Heart className="text-red-500 fill-red-500" size={36} />
              My Wishlist
            </h1>
            <p className="text-gray-600">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          
          {wishlist.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-center py-20"
          >
            <Heart size={80} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Start adding products you love!
            </p>
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </button>
          </motion.div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product, index) => (
              <motion.div
                key={product._id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group"
              >
                {/* Product Image */}
                <div 
                  className="relative h-56 bg-gray-50 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <img
                    src={
                      product.images?.[0]?.startsWith("http")
                        ? product.images[0]
                        : `http://localhost:5000${product.images?.[0]}`
                    }
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(product._id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>

                  {/* Discount Badge */}
                  {product.discountPercent > 0 && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                      {product.discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3
                    className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{product.price?.toLocaleString()}
                    </p>
                    {product.stock > 0 ? (
                      <span className="text-sm text-green-600 font-medium">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-sm text-red-600 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
