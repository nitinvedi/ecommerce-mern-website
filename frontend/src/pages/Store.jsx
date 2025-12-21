import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingCart,
  Star,
  X,
  ArrowUp,
  ArrowDown,
  Filter,
  Check,
  Tag,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Zap,
  Package,
  ChevronRight,
  RefreshCw,
  Gift,
  Plus,
  Eye
} from "lucide-react";

import { api, API_ENDPOINTS, SOCKET_URL } from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import useAuth from "../hooks/useAuth.js";
import ProductFilters from "../components/ProductFilters.jsx";
import ProductSort from "../components/ProductSort.jsx";
import { ProductCardSkeleton } from "../components/Skeleton.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";

// --- UI COMPONENTS ---

const CategoryPills = ({ selected, onSelect, products }) => {
  const categories = [
    { id: "all", label: "All Products", icon: Package },
    { id: "Mobile", label: "iPhone & Android", icon: Smartphone },
    { id: "Laptop", label: "MacBook & Laptops", icon: Laptop },
    { id: "Tablet", label: "iPads & Tablets", icon: Tablet },
    { id: "Accessories", label: "Accessories", icon: Headphones },
  ];

  const getCount = (catId) => {
    if (catId === "all") return products.length;
    return products.filter(p => p.category === catId).length;
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 md:pb-0 px-1 scrollbar-hide py-2 md:px-0">
      {categories.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border backdrop-blur-md
              ${isActive 
                ? "bg-black text-white border-black shadow-lg shadow-black/20" 
                : "bg-white/80 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-white"}
            `}
          >
            <cat.icon size={16} className={isActive ? "text-white" : "text-gray-400"} />
            <span className="whitespace-nowrap">{cat.label}</span>
            <span className={`
              text-[10px] px-1.5 py-0.5 rounded-full ml-1
              ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}
            `}>
              {getCount(cat.id)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const Breadcrumbs = ({ category }) => (
  <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
    <span className="hover:text-black cursor-pointer transition-colors">Home</span>
    <ChevronRight size={14} />
    <span className="hover:text-black cursor-pointer transition-colors">Store</span>
    <ChevronRight size={14} />
    <span className="text-black capitalize">{category === 'all' ? 'All Products' : category}</span>
  </nav>
);

const EmptyState = ({ clearFilters }) => (
  <div className="col-span-full py-20 flex flex-col items-center text-center">
    <div className="w-48 h-48 bg-gray-50 rounded-full flex items-center justify-center mb-8 relative group">
       <Search size={64} className="text-gray-300 group-hover:scale-110 transition-transform duration-500" />
       <div className="absolute top-10 right-10 w-4 h-4 bg-red-400 rounded-full animate-bounce" />
       <div className="absolute bottom-12 left-12 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-100" />
    </div>
    <h3 className="text-2xl font-bold text-[#1d1d1f] mb-3">No products found</h3>
    <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
      We couldn't find matches for your current filters. Try checking your spelling or clearing some filters.
    </p>
    <button 
      onClick={clearFilters}
      className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
    >
      Clear All Filters
    </button>
  </div>
);

const InterstitialBanner = () => (
    <div className="col-span-full xl:col-span-2 row-span-1 bg-black rounded-[30px] p-8 md:p-10 relative overflow-hidden text-white group cursor-pointer my-0 h-full flex flex-col justify-center">
        <div className="relative z-10 max-w-lg">
            <span className="inline-block px-3 py-1 bg-[#DFFF00] text-black text-xs font-bold uppercase tracking-wider rounded-full mb-4 animate-pulse">Limited Time</span>
            <h3 className="text-3xl font-bold mb-4 leading-tight">Trade-in <br/>and upgrade.</h3>
            <p className="text-gray-400 text-sm mb-6">Get ₹2,000 - ₹45,000 credit toward a new device.</p>
            <div className="flex items-center gap-2 text-[#DFFF00] font-bold text-sm group-hover:gap-4 transition-all">
                Check Value <ChevronRight size={16} />
            </div>
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-blue-600/30 to-purple-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <RefreshCw size={150} className="absolute -bottom-8 -right-8 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
    </div>
);

// --- MAIN PAGE ---

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
  
  // URL Sync State
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
  const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsBackToTopVisible(latest > 500);
    });
  }, [scrollY]);

  // URL Sync Effect
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
      let items = res?.data?.items || res?.items || (Array.isArray(res?.data) ? res.data : []) || (Array.isArray(res) ? res : []);
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
    e?.stopPropagation();
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

  const [visibleCount, setVisibleCount] = useState(12);
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => { setVisibleCount(12); }, [selectedCategory, searchTerm, filters, sortBy]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen font-sans text-gray-900 selection:bg-black selection:text-white pb-20 md:pb-0">
      
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
              
              {!searchTerm && <p className="mt-6 text-gray-400">Press Enter to see all results</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <div className="max-w-[1800px] mx-auto px-6 py-24 md:py-32" ref={productsRef}>
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="hidden lg:block w-72 flex-shrink-0">
             <div className="sticky top-28 bg-white/50 backdrop-blur-xl rounded-[32px] border border-white/50 shadow-sm p-6">
               <ProductFilters onFilterChange={setFilters} products={products} />
             </div>
          </aside>

          <div className="flex-1">
              <Breadcrumbs category={selectedCategory} />

             <div className="flex flex-col gap-6 mb-10 border-b border-gray-100 pb-6 sticky top-0 z-30 bg-[#fcfcfc]/85 backdrop-blur-xl transition-all pt-4 -mx-6 px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="overflow-x-auto pb-0 scrollbar-hide -mx-2 px-2">
                       <CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} products={products} />
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-3 flex-1 md:flex-none">
                        <button 
                            onClick={() => setShowSearch(true)} 
                            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium transition-all group hover:border-gray-400"
                        >
                           <Search size={18} className="text-gray-500 group-hover:text-black transition-colors" />
                           <span className="text-gray-600 group-hover:text-black">Search</span>
                        </button>

                        <button onClick={() => setShowMobileFilters(true)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-full text-sm font-medium shadow-lg">
                           <Filter size={16} /> Filters
                        </button>
                        
                         <button 
                            onClick={() => setShowSearch(true)} 
                            className="md:hidden flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full text-gray-900 shadow-sm"
                        >
                           <Search size={20} />
                        </button>

                        <ProductSort onSortChange={setSortBy} currentSort={sortBy} />
                    </div>
                </div>

                {/* Active Filter Chips */}
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
                    <button onClick={() => { setSearchTerm(""); setFilters({ priceRange: [0, 1000000], brands: [], rating: 0, inStock: false }); }} className="text-xs font-medium text-red-500 hover:text-red-700 underline">
                        Clear All
                    </button>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
               {loading ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />) 
               : filteredProducts.length > 0 ? (
                 <>
                    {visibleProducts.map((product, index) => {
                         // Insert banner logic: At index 4 (5th position)
                         const showBanner = index === 4;
                         
                         return (
                            <React.Fragment key={product._id}>
                                {showBanner && <InterstitialBanner />}
                                <ProductCard
                                    product={product}
                                    index={index}
                                    wishlistItems={wishlistItems}
                                    toggleWishlist={toggleWishlist}
                                    handleAddToCart={handleAddToCart}
                                    navigate={navigate}
                                    openQuickView={() => setQuickViewProduct(product)}
                                />
                            </React.Fragment>
                        );
                    })}
                 </>
               ) : (
                 <EmptyState clearFilters={() => { setSearchTerm(""); setFilters({ priceRange: [0, 1000000], brands: [], rating: 0, inStock: false }); }} />
               )}
             </div>

             {visibleCount < filteredProducts.length && (
               <div className="mt-24 pb-12 flex flex-col items-center">
                   <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-4">
                     Showing {visibleCount} of {filteredProducts.length} products
                   </p>
                   <button 
                     onClick={() => setVisibleCount(p => p + 12)} 
                     className="group relative px-10 py-4 rounded-full bg-white border border-gray-200 hover:border-black text-sm font-bold uppercase tracking-widest transition-all hover:shadow-xl flex items-center gap-4 overflow-hidden"
                   >
                     <span className="relative z-10 text-gray-900 group-hover:text-white transition-colors duration-300">Load More</span>
                     <span className="relative z-10 w-6 h-6 rounded-full bg-gray-100 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                        <ArrowDown size={12} className="text-gray-900 group-hover:text-white transition-transform duration-300 group-hover:translate-y-0.5" />
                     </span>
                     <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
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
  const isNew = (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24) < 30;
  const isOutOfStock = product.stock <= 0;
  
  const image1 = product.images?.[0]?.startsWith("http") ? product.images[0] : `${SOCKET_URL}${product.images?.[0]}`;
  const image2 = product.images?.[1] 
      ? (product.images[1].startsWith("http") ? product.images[1] : `${SOCKET_URL}${product.images[1]}`) 
      : image1;

  const savingsAmount = product.discountPercent > 0 
    ? Math.round((product.price / (1 - product.discountPercent / 100)) - product.price) 
    : 0;
  
  const colors = ["#1d1d1f", "#f5f5f7", "#2997ff"];
  
  // 3D Motion Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      x.set(event.clientX - rect.left - rect.width / 2);
      y.set(event.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      style={{ perspective: 1000 }}
      className={`group relative z-0 hover:z-10 ${isOutOfStock ? "opacity-75 grayscale-[0.5]" : ""}`}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative aspect-[3/4] bg-white rounded-[24px] overflow-hidden mb-5 cursor-pointer shadow-sm border border-gray-100 hover:shadow-2xl hover:border-transparent transition-all duration-500 ease-out"
        onClick={() => navigate(`/product/${product._id}`)}
      >
         
         {/* Badges */}
         <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
            {isOutOfStock ? (
               <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-full self-start">Sold Out</span>
            ) : (
                <>
                {product.isRefurbished && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1 self-start">
                       <RefreshCw size={10} /> Certified Refurbished
                    </span>
                )}
                {product.discountPercent > 0 && (
                    <span className="px-3 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1 self-start">
                       <Tag size={10} /> Save ₹{savingsAmount.toLocaleString()}
                    </span>
                )}
                {isNew && (
                    <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-full self-start relative overflow-hidden">
                       <span className="relative z-10">New</span>
                       <span className="absolute inset-0 bg-white/20 animate-pulse" />
                    </span>
                )}
                </>
            )}
         </div>

         <button onClick={(e) => toggleWishlist(product._id, e)} className="absolute top-4 right-4 z-10 p-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
            <Heart size={16} className={wishlistItems.includes(product._id) ? "fill-red-500 stroke-red-500" : "stroke-gray-900"} />
         </button>

         {/* Image Swap */}
         <div className="w-full h-full p-8 flex items-center justify-center relative transform transition-transform duration-700 group-hover:scale-105">
            <img 
               src={image1} 
               alt={product.name} 
               className="absolute inset-0 w-full h-full object-contain p-8 mix-blend-multiply transition-all duration-700 group-hover:opacity-0" 
            />
            <img 
               src={image2} 
               alt={product.name} 
               className="absolute inset-0 w-full h-full object-contain p-8 mix-blend-multiply opacity-0 transition-all duration-700 group-hover:opacity-100" 
            />
         </div>
        
         {/* Spec Reveal Overlay */}
         <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-4 group-hover:translate-y-0 z-20">
             {/* Dual Action Buttons */}
             {!isOutOfStock && (
                <div className="flex gap-2 pointer-events-auto">
                    <button 
                        onClick={(e) => { e.stopPropagation(); openQuickView(); }}
                        className="flex-1 py-3 bg-white/90 backdrop-blur text-black text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg border border-gray-100 hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <Eye size={14} /> View
                    </button>
                    <button 
                        onClick={(e) => handleAddToCart(product, e)}
                        className="py-3 px-4 bg-black/90 backdrop-blur text-white rounded-xl shadow-lg hover:bg-black transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>
             )}
         </div>

      </motion.div>

      <div className="space-y-2 px-1">
         <div className="flex justify-between items-start">
            <h3 className="font-semibold text-base text-gray-900 leading-snug cursor-pointer group-hover:text-[#0071e3] transition-colors" onClick={() => navigate(`/product/${product._id}`)}>
              {product.name}
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-bold bg-white border border-gray-100 px-1.5 py-0.5 rounded ml-2 text-gray-600 shadow-sm">
               <Star size={10} className="fill-black stroke-black" /> {product.rating?.toFixed(1) || "New"}
            </div>
         </div>
         
         <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
                {colors.map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-full border border-white ring-1 ring-gray-200" style={{backgroundColor: c}} />
                ))}
            </div>
            <span className="text-xs text-gray-400">+2 more</span>
         </div>

         <div className="flex items-baseline gap-2 pt-1">
            <span className="font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
            {product.discountPercent > 0 && <span className="text-sm text-gray-400 line-through decoration-gray-300">₹{Math.round(product.price / (1 - product.discountPercent / 100)).toLocaleString()}</span>}
         </div>
      </div>
    </motion.div>
  );
}
