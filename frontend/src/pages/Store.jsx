import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingCart,
  Star,
  X,
  ArrowUp,
  Filter,
  Check,
  Tag
} from "lucide-react";

import { api, API_ENDPOINTS } from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import useAuth from "../hooks/useAuth.js";
import ProductFilters from "../components/ProductFilters.jsx";
import ProductSort from "../components/ProductSort.jsx";
import { ProductCardSkeleton } from "../components/Skeleton.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";

export default function Store() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  
  // 1. Logic: Deep URL Sync State Initialization
  // Initialize state from URL params if available
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popularity");
  const [filters, setFilters] = useState({
    priceRange: [
      Number(searchParams.get("minPrice")) || 0,
      Number(searchParams.get("maxPrice")) || 1000000
    ],
    brands: searchParams.get("brands")?.split(",").filter(Boolean) || [],
    rating: Number(searchParams.get("rating")) || 0,
    inStock: searchParams.get("inStock") === "true",
  });

  const productsRef = useRef(null);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const showBackToTop = useTransform(scrollY, [500, 600], [0, 1]); // Framer motion value
  const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);

  // 2. Logic: Back To Top Visibility using specialized effect
  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsBackToTopVisible(latest > 500);
    });
  }, [scrollY]);

  // 3. Logic: Deep URL Sync Effect (Write to URL)
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (sortBy !== "popularity") params.sort = sortBy;
    if (filters.priceRange[0] > 0) params.minPrice = filters.priceRange[0];
    if (filters.priceRange[1] < 1000000) params.maxPrice = filters.priceRange[1];
    if (filters.brands.length > 0) params.brands = filters.brands.join(",");
    if (filters.rating > 0) params.rating = filters.rating;
    if (filters.inStock) params.inStock = "true";
    
    setSearchParams(params, { replace: true });
    
    // 4. Feature: Dynamic Page Title
    const titleCat = selectedCategory === "all" ? "Store" : selectedCategory;
    document.title = searchTerm ? `Search: ${searchTerm} | Ram Mobile` : `${titleCat} | Ram Mobile`;
    
  }, [searchTerm, selectedCategory, sortBy, filters, setSearchParams]);

  useEffect(() => {
    fetchProducts();
    if (user) fetchWishlist();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await api.get(`${API_ENDPOINTS.PRODUCTS.BASE}?limit=100`);
      let items = [];
      if (res?.data?.items) items = res.data.items;
      else if (res?.items) items = res.items;
      else if (Array.isArray(res?.data)) items = res.data;
      else if (Array.isArray(res)) items = res;
      setProducts(items);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.WISHLIST.BASE);
      const items = res?.products || [];
      setWishlistItems(items.map(p => p._id));
    } catch (error) {
      console.error("Failed to load wishlist");
    }
  };

  const toggleWishlist = async (productId, e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login first");
      return;
    }
    const isInWishlist = wishlistItems.includes(productId);
    setWishlistItems(prev => isInWishlist ? prev.filter(id => id !== productId) : [...prev, productId]);

    try {
      if (isInWishlist) {
        await api.delete(API_ENDPOINTS.WISHLIST.REMOVE(productId));
        toast.success("Removed from wishlist");
      } else {
        await api.post(API_ENDPOINTS.WISHLIST.ADD(productId));
        toast.success("Added to wishlist");
      }
    } catch (error) {
      setWishlistItems(prev => isInWishlist ? [...prev, productId] : prev.filter(id => id !== productId));
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast.success("Added to cart");
  };

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesPrice = p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1];
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(p.brand);
      const matchesRating = filters.rating === 0 || (p.rating || 0) >= filters.rating;
      const matchesStock = !filters.inStock || (p.stock > 0);
      return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesRating && matchesStock;
    }).sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "rating": return (b.rating || 0) - (a.rating || 0);
        case "newest": return new Date(b.createdAt) - new Date(a.createdAt);
        case "popularity": default: return (b.numReviews || 0) - (a.numReviews || 0);
      }
    });
  }, [products, searchTerm, selectedCategory, filters, sortBy]);

  // 5. Logic: Category Counts
  const categories = ["all", "Mobile", "Tablet", "Laptop", "Accessories"];
  const getCategoryCount = (cat) => {
    if (cat === "all") return products.length;
    return products.filter(p => p.category === cat).length;
  };

  const featured = products[0];
  const [visibleCount, setVisibleCount] = useState(12);
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => { setVisibleCount(12); }, [selectedCategory, searchTerm, filters, sortBy]);

  // 6. Feature: Smart Fallback Recommendations (e.g. Popular or Newest)
  const fallbackProducts = useMemo(() => {
    if (filteredProducts.length > 0) return [];
    return [...products].sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0)).slice(0, 4);
  }, [filteredProducts.length, products]);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 selection:bg-black selection:text-white">
      
      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-white/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <button onClick={() => setShowSearch(false)} className="absolute top-8 right-8 p-4 hover:bg-gray-100 rounded-full transition-colors">
              <X size={32} />
            </button>
            <div className="w-full max-w-4xl text-center">
              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setShowSearch(false); }}
                className="w-full text-5xl md:text-7xl font-bold bg-transparent border-b-2 border-gray-200 focus:border-black py-8 outline-none text-center placeholder:text-gray-200 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <p className="mt-6 text-gray-400">Press Enter to see results</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Feature: Back To Top Button */}
      <AnimatePresence>
        {isBackToTopVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[45] w-12 h-12 bg-white border border-gray-200 shadow-xl rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Search FAB (Hidden if BackToTop is active to prevent overlap, or stacked) */}
      {!showSearch && (
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSearch(true)}
          className={`fixed bottom-8 ${isBackToTopVisible ? 'right-24' : 'right-8'} z-40 w-12 h-12 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-900 transition-all duration-300`}
        >
          <Search size={20} />
        </motion.button>
      )}

      {/* Hero Section */}
      <div className="relative h-[80vh] bg-[#F5F5F7] overflow-hidden flex items-center">
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
         <motion.div style={{ opacity: heroOpacity }} className="max-w-[1600px] mx-auto px-6 grid md:grid-cols-2 gap-12 w-full h-full items-center relative z-10">
            <div className="space-y-10 order-2 md:order-1 pt-20 md:pt-0">
               <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-black/10 rounded-full bg-white/50 backdrop-blur-sm mb-6">
                    <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-widest">New Drop</span>
                 </div>
                 <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-6">
                    {featured ? featured.name.split(' ').slice(0, 3).join(' ') : "Future Tech"}
                 </h1>
                 <p className="text-lg md:text-xl text-gray-500 max-w-md leading-relaxed">
                    {featured ? featured.description.slice(0, 100) + "..." : "Experience the next generation."}
                 </p>
               </motion.div>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex gap-4">
                  <button onClick={() => navigate(featured ? `/product/${featured._id}` : '/')} className="px-10 py-4 bg-black text-white rounded-full font-medium hover:scale-105 transition-transform">
                     Shop Now
                  </button>
               </motion.div>
            </div>
            <div className="order-1 md:order-2 h-full flex items-center justify-center relative">
               {featured && (
                 <motion.img 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 1 }}
                   src={featured.images?.[0]}
                   className="w-full max-w-lg md:max-w-xl object-contain drop-shadow-2xl"
                   alt="Hero Product"
                 />
               )}
            </div>
         </motion.div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-20" ref={productsRef}>
        <div className="flex flex-col lg:flex-row gap-16">
          <aside className="hidden lg:block w-64 flex-shrink-0">
             <div className="sticky top-28">
               <ProductFilters onFilterChange={setFilters} products={products} />
             </div>
          </aside>

          <div className="flex-1">
             <div className="flex flex-col gap-6 mb-10 border-b border-gray-100 pb-6">
                
                {/* 8. Feature: Mobile Sticky Bar Holder (Logic in CSS/Component) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-30 bg-white/95 backdrop-blur py-2 md:static">
                    <div className="overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                      <div className="flex gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                              selectedCategory === cat
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {cat === "all" ? "All" : cat}
                            {/* Feature: Category Counts */}
                            <span className={`text-[10px] py-0.5 px-1.5 rounded-full ${selectedCategory === cat ? 'bg-white text-black' : 'bg-gray-200 text-gray-500'}`}>
                              {getCategoryCount(cat)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-4">
                        <button onClick={() => setShowMobileFilters(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">
                           <Filter size={16} /> Filters
                        </button>
                        <ProductSort onSortChange={setSortBy} currentSort={sortBy} />
                    </div>
                </div>

                {/* 9. Feature: Active Filter Chips */}
                {(searchTerm || filters.brands.length > 0 || filters.rating > 0 || filters.inStock) && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500 mr-2">Active:</span>
                    {searchTerm && (
                      <button onClick={() => setSearchTerm("")} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium hover:bg-gray-200">
                         Search: "{searchTerm}" <X size={12} />
                      </button>
                    )}
                    {filters.brands.map(b => (
                       <button key={b} onClick={() => setFilters(prev => ({...prev, brands: prev.brands.filter(brand => brand !== b)}))} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium hover:bg-gray-200">
                         {b} <X size={12} />
                       </button>
                    ))}
                    {filters.rating > 0 && (
                      <button onClick={() => setFilters(prev => ({...prev, rating: 0}))} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium hover:bg-gray-200">
                         {filters.rating}+ Stars <X size={12} />
                       </button>
                    )}
                    {filters.inStock && (
                      <button onClick={() => setFilters(prev => ({...prev, inStock: false}))} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium hover:bg-gray-200">
                         In Stock <X size={12} />
                       </button>
                    )}
                    <button onClick={() => { setSearchTerm(""); setFilters({ priceRange: [0, 1000000], brands: [], rating: 0, inStock: false }); }} className="text-xs font-medium text-red-500 hover:text-red-700 underline">
                        Clear All
                    </button>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-12">
               {loading ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />) 
               : filteredProducts.length > 0 ? (
                 visibleProducts.map((product, index) => (
                   <ProductCard
                     key={product._id}
                     product={product}
                     index={index}
                     wishlistItems={wishlistItems}
                     toggleWishlist={toggleWishlist}
                     handleAddToCart={handleAddToCart}
                     navigate={navigate}
                     openQuickView={() => setQuickViewProduct(product)}
                   />
                 ))
               ) : (
                 <div className="col-span-full py-24 text-center">
                    <h3 className="text-2xl font-bold mb-4">No results found</h3>
                    <p className="text-gray-500 mb-8">Try adjusting your filters or search criteria.</p>
                    
                    {/* Feature: Fallback Recommendations */}
                    {fallbackProducts.length > 0 && (
                      <div className="mt-12 text-left">
                         <h4 className="text-lg font-bold mb-6 border-t pt-8">Popular Products You Might Like</h4>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {fallbackProducts.map((p, i) => (
                              <ProductCard 
                                key={p._id} 
                                product={p} 
                                index={i} 
                                wishlistItems={wishlistItems} 
                                toggleWishlist={toggleWishlist} 
                                handleAddToCart={handleAddToCart}
                                navigate={navigate}
                                openQuickView={() => setQuickViewProduct(p)}
                              />
                            ))}
                         </div>
                      </div>
                    )}
                 </div>
               )}
             </div>

             {visibleCount < filteredProducts.length && (
               <div className="mt-20 flex justify-center">
                  <button onClick={() => setVisibleCount(p => p + 12)} className="px-12 py-4 border border-gray-200 hover:border-black rounded-full bg-white text-gray-900 font-medium transition-all hover:bg-gray-50">
                    Load More
                  </button>
               </div>
             )}
          </div>
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

       {/* Mobile Filters */}
       <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl p-6 overflow-y-auto">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
               </div>
               <ProductFilters onFilterChange={setFilters} products={products} />
               <div className="mt-8 pt-6 border-t">
                  <button onClick={() => setShowMobileFilters(false)} className="w-full py-4 bg-black text-white rounded-xl font-bold">
                    View Results
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductCard({ product, index, wishlistItems, toggleWishlist, handleAddToCart, navigate, openQuickView }) {
  const isNew = (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24) < 60;
  const isOutOfStock = product.stock <= 0;
  
  // 10. Feature: Hover Image Swap Logic
  const image1 = product.images?.[0]?.startsWith("http") ? product.images[0] : `http://localhost:5000${product.images?.[0]}`;
  const image2 = product.images?.[1] 
      ? (product.images[1].startsWith("http") ? product.images[1] : `http://localhost:5000${product.images[1]}`) 
      : image1;

  // 11. Feature: Savings Calculation badge
  const savingsAmount = product.discountPercent > 0 
    ? Math.round((product.price / (1 - product.discountPercent / 100)) - product.price) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`group ${isOutOfStock ? "opacity-75 grayscale-[0.5]" : ""}`}
    >
      <div className="relative aspect-[3/4] bg-[#F5F5F7] rounded-[20px] overflow-hidden mb-5 cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
         {/* Badges */}
         <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {isOutOfStock ? (
               <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Sold Out
               </span>
            ) : (
                <>
                {product.discountPercent > 0 && (
                    <span className="px-3 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1">
                       <Tag size={10} /> Save ₹{savingsAmount.toLocaleString()}
                    </span>
                )}
                {isNew && <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-full">New</span>}
                
                {/* 12. Feature: Low Stock Badge */}
                {product.stock > 0 && product.stock < 5 && (
                   <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Only {product.stock} Left
                   </span>
                )}
                </>
            )}
         </div>

         <button onClick={(e) => toggleWishlist(product._id, e)} className="absolute top-4 right-4 z-10 p-2.5 bg-white rounded-full shadow-sm hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
            <Heart size={16} className={wishlistItems.includes(product._id) ? "fill-red-500 stroke-red-500" : "stroke-gray-900"} />
         </button>

         {/* Image Swap Container */}
         <div className="w-full h-full p-8 flex items-center justify-center relative">
            <img 
               src={image1} 
               alt={product.name} 
               className="absolute inset-0 w-full h-full object-contain p-8 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0" 
            />
            <img 
               src={image2} 
               alt={product.name} 
               className="absolute inset-0 w-full h-full object-contain p-8 mix-blend-multiply opacity-0 transition-opacity duration-500 group-hover:opacity-100 scale-110" 
            />
         </div>

         {!isOutOfStock && (
            <button 
                onClick={(e) => { e.stopPropagation(); openQuickView(); }}
                className="absolute bottom-4 left-4 right-4 py-3 bg-white/90 backdrop-blur text-black text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
            >
                Quick View
            </button>
         )}
      </div>

      <div className="space-y-1.5 px-1">
         <div className="flex justify-between items-start">
            <h3 className="font-medium text-base text-gray-900 leading-snug cursor-pointer hover:underline decoration-1 underline-offset-4" onClick={() => navigate(`/product/${product._id}`)}>
              {product.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold bg-gray-100 px-1.5 py-0.5 rounded ml-2">
               <Star size={10} className="fill-black stroke-black" /> {product.rating?.toFixed(1) || "New"}
            </div>
         </div>
         <p className="text-sm text-gray-500">{product.brand}</p>
         <div className="flex items-center gap-2 pt-1">
            <span className="font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
            {product.discountPercent > 0 && <span className="text-sm text-gray-400 line-through">₹{Math.round(product.price / (1 - product.discountPercent / 100)).toLocaleString()}</span>}
         </div>
      </div>
    </motion.div>
  );
}
