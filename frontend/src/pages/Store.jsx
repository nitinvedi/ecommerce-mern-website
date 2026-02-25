import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Remove 3D imports
import { motion, useScroll, AnimatePresence } from "framer-motion";

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
import { getErrorMessage } from "../utils/errorHandler.js";

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
                ? "bg-[#0071e3] text-white border-[#0071e3] shadow-lg shadow-blue-500/30" 
                : "bg-white/60 text-slate-600 border-white/40 hover:border-blue-200 hover:bg-white hover:text-[#0071e3]"}
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

const RefurbishedBanner = ({ onApplyFilter }) => (
    <div 
      onClick={onApplyFilter}
      className="col-span-full xl:col-span-2 row-span-1 bg-gradient-to-br from-[#0071e3] to-[#00c6ff] rounded-[32px] p-8 md:p-10 relative overflow-hidden text-white group cursor-pointer my-0 h-full flex flex-col justify-center shadow-lg shadow-blue-500/20"
    >
        <div className="relative z-10 max-w-lg">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">Eco-Friendly Choice</span>
            <h3 className="text-3xl font-bold mb-4 leading-tight">Refurbished <br/>& Reliable.</h3>
            <p className="text-blue-50 text-sm mb-6">Premium devices. Fraction of the price. 100% Quality Checked.</p>
            <div className="flex items-center gap-2 text-white font-bold text-sm group-hover:gap-4 transition-all">
                Shop Refurbished <ChevronRight size={16} />
            </div>
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <RefreshCw size={150} className="absolute -bottom-8 -right-8 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
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
    brands: searchParams.get("brands")?.split(",").filter(Boolean) || [],
    rating: Number(searchParams.get("rating")) || 0,
    inStock: searchParams.get("inStock") === "true",
    isRefurbished: searchParams.get("condition") === "refurbished",
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
    if (filters.isRefurbished) params.condition = "refurbished";
    setSearchParams(params, { replace: true });
    
    const titleCat = selectedCategory === "all" ? "Store" : selectedCategory;
    document.title = searchTerm ? `Search: ${searchTerm} | Ram Mobiles` : `${titleCat} | Ram Mobiles`;
  }, [searchTerm, selectedCategory, sortBy, filters, setSearchParams]);

  useEffect(() => {
    const search = searchParams.get("search") || "";
    if (search !== searchTerm) {
      setSearchTerm(search);
    }
  }, [searchParams.get("search")]);

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
      toast.error(getErrorMessage(error, "Failed to load products"));
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
      toast.error(getErrorMessage(error, "Failed to update wishlist"));
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
      // Removed duplicate matchesRating declaration
      const matchesStock = !filters.inStock || (p.stock > 0);
      const matchesRefurbished = !filters.isRefurbished || (p.isRefurbished === true);
      return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesRating && matchesStock && matchesRefurbished;
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
    <div className="bg-[#f5f7fa] min-h-screen font-sans text-slate-900 selection:bg-[#0071e3] selection:text-white pb-20 md:pb-0 overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent z-0" />
      
      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-32 px-4"
            onClick={() => setShowSearch(false)}
          >
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: -20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: -20 }}
               onClick={(e) => e.stopPropagation()}
               className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 ring-1 ring-black/5"
            >
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') setShowSearch(false); }}
                        className="w-full pl-16 pr-16 py-6 text-xl bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
                    />
                     <button 
                        onClick={() => setShowSearch(false)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                     >
                        <X size={20} />
                    </button>
                </div>
                {!searchTerm && (
                   <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Enter to search</span>
                          <span>Esc to close</span>
                      </div>
                   </div>
                )}
            </motion.div>
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
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
             <div className="sticky top-28">
               <ProductFilters onFilterChange={setFilters} products={products} />
             </div>
          </aside>

          <div className="flex-1 min-w-0">
              <Breadcrumbs category={selectedCategory} />

             <div className="flex flex-col gap-6 mb-10 border-b border-gray-100 pb-6 sticky top-0 z-30 bg-[#fcfcfc]/85 backdrop-blur-xl transition-all pt-4 -mx-6 px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="overflow-x-auto pb-0 scrollbar-hide -mx-2 px-2">
                       <CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} products={products} />
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-3 flex-1 md:flex-none">
                        <button 
                            onClick={() => setShowSearch(true)} 
                            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/70 backdrop-blur-md border border-white/50 shadow-sm rounded-full text-sm font-medium transition-all group hover:border-blue-200 hover:shadow-md"
                        >
                           <Search size={18} className="text-slate-500 group-hover:text-[#0071e3] transition-colors" />
                           <span className="text-slate-600 group-hover:text-[#0071e3]">Search</span>
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
                     <button onClick={() => { setSearchTerm(""); setFilters({ priceRange: [0, 1000000], brands: [], rating: 0, inStock: false, isRefurbished: false }); }} className="text-xs font-medium text-red-500 hover:text-red-700 underline">
                         Clear All
                     </button>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 w-full">
               {loading ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />) 
               : filteredProducts.length > 0 ? (
                 <>
                    {visibleProducts.map((product, index) => {
                         // Insert banner logic: At index 4 (5th position)
                         const showBanner = index === 4;
                         
                         return (
                            <React.Fragment key={product._id}>
                                {showBanner && (
                                  <RefurbishedBanner onApplyFilter={() => {
                                      window.scrollTo({ top: 300, behavior: 'smooth' });
                                      setFilters(prev => ({ ...prev, isRefurbished: true }));
                                  }} />
                                )}
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
                 <EmptyState clearFilters={() => { setSearchTerm(""); setFilters({ priceRange: [0, 1000000], brands: [], rating: 0, inStock: false, isRefurbished: false }); }} />
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
  
  // 3D Motion Logic Removed


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`group relative z-0 hover:z-10 w-full min-w-0 ${isOutOfStock ? "opacity-75 grayscale-[0.5]" : ""}`}
    >
      <div
        className="relative aspect-[4/5] bg-white rounded-[24px] overflow-hidden mb-4 cursor-pointer shadow-sm border border-slate-100 group-hover:shadow-2xl group-hover:shadow-blue-900/10 group-hover:border-blue-100 transition-all duration-500 ease-out transform group-hover:-translate-y-1"
        onClick={() => navigate(`/product/${product._id}`)}
      >
         
         {/* Badges */}
         <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
            {isOutOfStock ? (
               <span className="px-2.5 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-wider rounded-full self-start">Sold Out</span>
            ) : (
                <>
                {product.isRefurbished && (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1 self-start">
                       <RefreshCw size={9} /> Refurbished
                    </span>
                )}
                {product.discountPercent > 0 && (
                    <span className="px-2.5 py-1 bg-white text-black text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1 self-start">
                       <Tag size={9} /> Save ₹{savingsAmount.toLocaleString()}
                    </span>
                )}
                {isNew && (
                    <span className="px-2.5 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-wider rounded-full self-start relative overflow-hidden">
                       <span className="relative z-10">New</span>
                       <span className="absolute inset-0 bg-white/20 animate-pulse" />
                    </span>
                )}
                </>
            )}
         </div>

         <button onClick={(e) => toggleWishlist(product._id, e)} className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
            <Heart size={15} className={wishlistItems.includes(product._id) ? "fill-red-500 stroke-red-500" : "stroke-gray-900"} />
         </button>

         {/* Image Swap */}
         <div className="w-full h-full p-6 flex items-center justify-center relative transform transition-transform duration-700 group-hover:scale-105">
            <img 
               src={image1} 
               alt={product.name} 
               className="absolute inset-0 w-full h-full object-contain p-6 mix-blend-multiply transition-all duration-700 group-hover:opacity-0" 
            />
            <img 
               src={image2} 
               alt={product.name} 
               className="absolute inset-0 w-full h-full object-contain p-6 mix-blend-multiply opacity-0 transition-all duration-700 group-hover:opacity-100" 
            />
         </div>
        
         {/* Spec Reveal Overlay */}
         <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-4 group-hover:translate-y-0 z-20">
             {/* Dual Action Buttons */}
             {!isOutOfStock && (
                <div className="flex gap-2 pointer-events-auto">
                    <button 
                        onClick={(e) => { e.stopPropagation(); openQuickView(); }}
                        className="flex-1 py-3 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg border border-white hover:bg-[#0071e3] hover:text-white hover:border-[#0071e3] transition-colors flex items-center justify-center gap-2"
                    >
                        <Eye size={14} /> View
                    </button>
                    <button 
                        onClick={(e) => handleAddToCart(product, e)}
                        className="py-3 px-4 bg-slate-900/90 backdrop-blur text-white rounded-xl shadow-lg hover:bg-[#0071e3] transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>
             )}
         </div>

      </div>

      <div className="space-y-2 px-2">
         <div className="flex justify-between items-start">
            <h3 className="font-semibold text-base text-slate-900 leading-snug cursor-pointer group-hover:text-[#0071e3] transition-colors line-clamp-2" onClick={() => navigate(`/product/${product._id}`)}>
              {product.name}
            </h3>
            <div className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold bg-white border border-slate-100 px-1.5 py-0.5 rounded text-slate-600 shadow-sm">
               <Star size={10} className="fill-amber-400 stroke-amber-400" /> {product.rating?.toFixed(1) || "New"}
            </div>
         </div>
         
         <div className="flex items-baseline gap-2 pt-1">
            <span className="font-bold text-slate-900 text-lg">₹{product.price?.toLocaleString()}</span>
            {product.discountPercent > 0 && <span className="text-sm text-slate-400 line-through decoration-slate-300">₹{Math.round(product.price / (1 - product.discountPercent / 100)).toLocaleString()}</span>}
         </div>
      </div>
    </motion.div>
  );
}
