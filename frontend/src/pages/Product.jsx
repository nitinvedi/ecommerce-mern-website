import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Star,
  Plus,
  Minus,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RotateCcw,
  Share2,
  Heart
} from "lucide-react";

import { api, API_ENDPOINTS, SOCKET_URL } from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";
import useAuth from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";
import AuthModal from "../components/AuthModal";
 // Assuming Navbar is globally available
import { addToRecentlyViewed, getRelatedProducts } from "../utils/recommendations.js";
import { ProductCardSkeleton } from "../components/Skeleton.jsx"; // Reusing skeleton

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [authModal, setAuthModal] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchAllProducts();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product && allProducts.length > 0) {
      addToRecentlyViewed(product._id);
      const related = getRelatedProducts(product, allProducts, 4);
      setRelatedProducts(related);
    }
  }, [product, allProducts]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
      setProduct(res.data);
    } catch {
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.PRODUCTS.BASE);
      const items = res?.data?.data?.items ?? res?.data?.items ?? res?.data?.products ?? [];
      setAllProducts(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Failed to load products");
    }
  };

  const handleAddToCart = () => {
    if (!product.stock || product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }
    
    // Check if adding this quantity exceeds stock (considering current cart)
    const success = addToCart(product, quantity);
    if (success) {
        toast.success("Added to cart");
    } else {
        toast.error(`Cannot add more. Max stock is ${product.stock}`);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
        toast.error("Please sign in to write a review");
        setAuthModal(true);
        return;
    }

    setSubmittingReview(true);
    try {
      await api.post(API_ENDPOINTS.PRODUCTS.REVIEWS(id), review);
      toast.success("Review submitted");
      setReview({ rating: 5, comment: "" });
      fetchProduct();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
                <div className="h-8 bg-gray-100 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                <div className="h-32 bg-gray-100 rounded w-full animate-pulse mt-8" />
            </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discountPrice = product.discountPercent 
    ? Math.round(product.price / (1 - product.discountPercent / 100)) 
    : null;

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 pb-20">


      <main className="max-w-7xl mx-auto px-6 pt-24">
        
        {/* Breadcrumb / Back */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:bg-gray-100 transition-colors">
             <ArrowLeft size={16} />
          </div>
          Back to products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* LEFT: Image Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative aspect-[4/5] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm"
            >
               <img
                  src={product.images?.[selectedImage]?.startsWith("http") ? product.images[selectedImage] : `${SOCKET_URL}${product.images[selectedImage]}`}
                  className="w-full h-full object-contain p-8"
                  alt={product.name}
               />
               
               {/* Badges */}
               <div className="absolute top-6 left-6 flex flex-col gap-2">
                 {product.discountPercent > 0 && (
                   <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-lg shadow-red-500/30">
                     {product.discountPercent}% OFF
                   </span>
                 )}
               </div>

               <button className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm border border-transparent hover:border-red-100 transition-all">
                  <Heart size={20} />
               </button>
            </motion.div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-xl bg-white border-2 overflow-hidden transition-all ${
                        selectedImage === idx ? 'border-blue-600 ring-4 ring-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                       src={img.startsWith("http") ? img : `${SOCKET_URL}${img}`}
                       className="w-full h-full object-contain p-2"
                       alt="" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details */}
          <div className="lg:sticky lg:top-24 h-fit">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-8"
             >
                {/* Header */}
                <div className="space-y-4">
                   <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-gray-900 uppercase tracking-wider">{product.brand || "Generic"}</span>
                      {product.stock > 0 ? (
                         <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                            In Stock
                         </span>
                      ) : (
                         <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium text-xs">Out of Stock</span>
                      )}
                   </div>

                   <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                      {product.name}
                   </h1>

                   {/* Rating */}
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-yellow-400">
                         {[...Array(5)].map((_, i) => (
                            <Star key={i} size={20} className={i < Math.floor(product.rating) ? "fill-current" : "text-gray-200"} />
                         ))}
                      </div>
                      <span className="text-sm font-medium text-gray-600 underline cursor-pointer hover:text-blue-600">
                         {product.numReviews} Reviews
                      </span>
                   </div>
                </div>

                {/* Price */}
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-6">
                   <div className="flex items-baseline gap-4">
                      <span className="text-5xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                      {discountPrice && (
                         <div className="flex flex-col items-start">
                            <span className="text-lg text-gray-400 line-through">₹{discountPrice.toLocaleString()}</span>
                            <span className="text-sm text-green-600 font-bold">You save ₹{(discountPrice - product.price).toLocaleString()}</span>
                         </div>
                      )}
                   </div>
                   
                   <p className="text-gray-600 leading-relaxed">
                      {product.description}
                   </p>

                   {/* Actions */}
                   <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                          <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                             <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                             >
                                <Minus size={18} />
                             </button>
                             <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                             <button 
                                onClick={() => setQuantity(Math.min(quantity + 1, product.stock || 1))}
                                disabled={quantity >= product.stock}
                                className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                             >
                                <Plus size={18} />
                             </button>
                          </div>
                          <button
                             onClick={handleAddToCart}
                             disabled={product.stock <= 0}
                             className="flex-1 h-14 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                          >
                             <ShoppingCart />
                             {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                          </button>
                      </div>
                   </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4">
                   {[
                      { icon: Truck, label: "Free Shipping", sub: "On orders over ₹5k" },
                      { icon: ShieldCheck, label: "2 Year Warranty", sub: "Full protection" },
                      { icon: RotateCcw, label: "Easy Returns", sub: "30-day policy" },
                   ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-100">
                         <item.icon size={24} className="text-blue-600 mb-2" />
                         <span className="font-bold text-xs uppercase tracking-wide text-gray-900">{item.label}</span>
                         <span className="text-[10px] text-gray-500">{item.sub}</span>
                      </div>
                   ))}
                </div>
             </motion.div>
          </div>
        </div>

        {/* ================= REVIEWS SECTION ================= */}
        <section className="mt-32 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-12">
             <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
             <button className="px-6 py-2 bg-white border border-gray-200 rounded-full font-medium hover:bg-gray-50">
                Write a Review
             </button>
          </div>
          
          <div className="grid md:grid-cols-12 gap-12">
             {/* Summary */}
             <div className="md:col-span-4 space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center">
                   <div className="text-6xl font-bold text-gray-900 mb-2">{product.rating?.toFixed(1)}</div>
                   <div className="flex justify-center gap-1 text-yellow-400 mb-2">
                       {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-current" />)}
                   </div>
                   <p className="text-gray-500">{product.numReviews} Verified Reviews</p>
                </div>
             </div>

             {/* Reviews List */}
             <div className="md:col-span-8 space-y-6">
                {product.reviews?.length > 0 ? (
                   product.reviews.map((r, i) => (
                      <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                                  {r.name?.[0] || "U"}
                               </div>
                               <div>
                                  <h4 className="font-bold text-gray-900">{r.name || "User"}</h4>
                                  <div className="flex text-yellow-400 text-xs">
                                     {[...Array(5)].map((_, idx) => (
                                        <Star key={idx} size={12} className={idx < r.rating ? "fill-current" : "text-gray-200"} />
                                     ))}
                                  </div>
                               </div>
                            </div>
                            <span className="text-xs text-gray-400">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
                         </div>
                         <p className="text-gray-600 leading-relaxed">{r.comment}</p>
                      </div>
                   ))
                ) : (
                   <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                      No reviews yet. Be the first to share your thoughts!
                   </div>
                )}
                
                {/* Review Form (Inline) */}
                {user && (
                   <form onSubmit={handleSubmitReview} className="bg-white p-8 rounded-3xl border border-gray-200 mt-12">
                      <h3 className="font-bold text-lg mb-6">Add Your Review</h3>
                      <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="flex gap-2">
                               {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                     key={star}
                                     type="button"
                                     onClick={() => setReview({ ...review, rating: star })}
                                     className={`p-2 rounded-lg transition-colors ${review.rating >= star ? 'text-yellow-400 bg-yellow-50' : 'text-gray-300 bg-gray-50'}`}
                                  >
                                     <Star className="fill-current" />
                                  </button>
                               ))}
                            </div>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                            <textarea
                               value={review.comment}
                               onChange={(e) => setReview({ ...review, comment: e.target.value })}
                               className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                               rows={4}
                               placeholder="What did you like or dislike?"
                            />
                         </div>
                         <button
                            disabled={submittingReview}
                            className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-colors"
                         >
                            {submittingReview ? "Submitting..." : "Post Review"}
                         </button>
                      </div>
                   </form>
                )}
             </div>
          </div>
        </section>

        {/* ================= RELATED PRODUCTS ================= */}
        {relatedProducts.length > 0 && (
          <section className="mt-32">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold text-gray-900">You Might Also Like</h2>
                <button 
                  onClick={() => navigate('/')} 
                  className="text-blue-600 font-medium hover:underline"
                >
                   View all products
                </button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                   <div 
                      key={p._id}
                      onClick={() => navigate(`/product/${p._id}`)}
                      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                   >
                      <div className="aspect-[4/5] bg-gray-50 p-6 relative">
                         <img 
                            src={p.images?.[0]?.startsWith("http") ? p.images[0] : `${SOCKET_URL}${p.images?.[0]}`}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            alt={p.name}
                         />
                         {p.discountPercent > 0 && (
                            <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur text-xs font-bold rounded-lg shadow-sm">
                               -{p.discountPercent}%
                            </span>
                         )}
                      </div>
                      <div className="p-4">
                         <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{p.brand || "Generic"}</div>
                         <h3 className="font-medium text-gray-900 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                         <div className="font-bold text-lg">₹{p.price?.toLocaleString()}</div>
                      </div>
                   </div>
                ))}
             </div>
          </section>
        )}

      </main>

      {authModal && (
        <AuthModal 
          onClose={() => setAuthModal(false)}
          onAuthSuccess={() => {
            setAuthModal(false);
            toast.success("Signed in! You can now post your review.");
          }}
        />
      )}
    </div>
  );
}
