import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  Headphones,
  X,
  Eye,
  Filter,
  ArrowRight
} from "lucide-react";

import { api, API_ENDPOINTS } from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import useAuth from "../hooks/useAuth.js";
import { getRecentlyViewed } from "../utils/recommendations.js";
import ProductFilters from "../components/ProductFilters.jsx";
import ProductSort from "../components/ProductSort.jsx";
import { ProductCardSkeleton } from "../components/Skeleton.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    priceRange: [0, 1000000],
    brands: [],
    rating: 0,
    inStock: false,
  });
  const [sortBy, setSortBy] = useState("popularity");

  const productsRef = useRef(null);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    fetchProducts();
    if (user) fetchWishlist();
  }, [user]);

  // Sync URL search param to state
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchTerm(query);
      setShowSearch(false); // Close overlay if open
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchTerm && productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      // Fetch more products to ensure client-side filtering works
      const res = await api.get(`${API_ENDPOINTS.PRODUCTS.BASE}?limit=100`);
      console.log("API Response:", res); // Debugging
      
      // Handle various response structures
      let items = [];
      if (res?.data?.items) items = res.data.items;
      else if (res?.items) items = res.items;
      else if (Array.isArray(res?.data)) items = res.data;
      else if (Array.isArray(res)) items = res;
      
      setProducts(items);

      const recentlyViewedIds = getRecentlyViewed();
      const recentlyViewed = items.filter(p => recentlyViewedIds.includes(p._id));
      setRecentlyViewedProducts(recentlyViewed);
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
      toast.error("Please login to use wishlist");
      return;
    }

    try {
      if (wishlistItems.includes(productId)) {
        await api.delete(API_ENDPOINTS.WISHLIST.REMOVE(productId));
        setWishlistItems(wishlistItems.filter(id => id !== productId));
        toast.success("Removed from wishlist");
      } else {
        await api.post(API_ENDPOINTS.WISHLIST.ADD(productId));
        setWishlistItems([...wishlistItems, productId]);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update wishlist");
    }
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast.success("Added to cart");
  };

  const filteredProducts = products
    .filter(p => {
      // Search filter
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;

      // Price filter
      const matchesPrice = p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1];

      // Brand filter
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(p.brand);

      // Rating filter
      const matchesRating = filters.rating === 0 || (p.rating || 0) >= filters.rating;

      // Stock filter
      const matchesStock = !filters.inStock || (p.stock > 0);

      return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesRating && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "popularity":
        default:
          return (b.numReviews || 0) - (a.numReviews || 0);
      }
    });

  const categories = ["all", "Mobile", "Tablet", "Laptop", "Accessories"];
  const featured = products[0];

  // Client-side pagination logic
  const [visibleCount, setVisibleCount] = useState(12);
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Search Suggestions
  const searchSuggestions = searchTerm.length > 1
    ? products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5)
    : [];

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, searchTerm, filters, sortBy]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900">

      {/* Floating Search Button */}
      {!showSearch && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowSearch(true)}
          className="fixed top-24 right-6 z-40 p-3 bg-white/80 backdrop-blur-md text-gray-800 rounded-full shadow-xl border border-white/20 hover:bg-white transition-all group"
        >
          <Search size={20} className="group-hover:text-blue-600 transition-colors" />
        </motion.button>
      )}

      {/* Search Overlay - Full Screen Glassmorphism */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl"
          >
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="flex items-center justify-end mb-8">
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={32} className="text-gray-500" />
                </button>
              </div>

              <div className="relative mb-12">
                <input
                  autoFocus
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-4xl font-bold bg-transparent border-b-2 border-gray-200 py-4 focus:border-blue-600 outline-none placeholder:text-gray-300 transition-colors"
                />

                {/* Suggestions */}
                {searchSuggestions.length > 0 && (
                  <div className="mt-8 space-y-2">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Suggestions</p>
                    {searchSuggestions.map(product => (
                      <div
                        key={product._id}
                        onClick={() => {
                          navigate(`/product/${product._id}`);
                          setShowSearch(false);
                          setSearchTerm("");
                        }}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <img
                          src={product.images?.[0]?.startsWith("http") ? product.images[0] : `http://localhost:5000${product.images?.[0]}`}
                          alt=""
                          className="w-16 h-16 object-contain rounded-lg bg-white border border-gray-100 group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <h4 className="font-medium text-lg group-hover:text-blue-600 transition-colors">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                        <ArrowRight className="ml-auto text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative bg-[#F8FAFC] overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10"
        >
          {featured && (
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Star size={12} className="fill-blue-600" />
                    New Arrival
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1]"
                >
                  {featured.name}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-gray-600 max-w-lg leading-relaxed"
                >
                  {featured.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4"
                >
                  <button
                    onClick={() => navigate(`/product/${featured._id}`)}
                    className="px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-black hover:scale-105 transition-all shadow-xl shadow-gray-200"
                  >
                    Shop Now
                  </button>
                  <button
                    onClick={() => navigate(`/product/${featured._id}`)}
                    className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    View Details
                  </button>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="relative"
              >
                <div className="relative z-10 bg-white/40 backdrop-blur-xl rounded-[2rem] p-12 shadow-2xl border border-white/50">
                  <img
                    src={featured.images?.[0]?.startsWith("http") ? featured.images[0] : `http://localhost:5000${featured.images?.[0]}`}
                    alt={featured.name}
                    className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <button
                  onClick={() => setFilters({ priceRange: [0, 100000], brands: [], rating: 0, inStock: false })}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Reset
                </button>
              </div>

              <ProductFilters
                onFilterChange={setFilters}
                products={products}
              />
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-6 flex items-center justify-between sticky top-[72px] z-30 bg-gray-50/95 backdrop-blur py-3 border-b">
            <div className="text-sm font-medium text-gray-500">
              {filteredProducts.length} Products
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium"
              >
                <Filter size={16} /> Filters
              </button>
              <ProductSort onSortChange={setSortBy} currentSort={sortBy} />
            </div>
          </div>

          {/* Product Grid */}
          <main className="flex-1 min-h-[500px]">
            {/* Header */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <p className="text-gray-500">
                Showing <span className="font-bold text-gray-900">{visibleProducts.length}</span> of {filteredProducts.length} results
              </p>
              <ProductSort onSortChange={setSortBy} currentSort={sortBy} />
            </div>

            {/* Category Pills of all valid categories */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {cat === "all" ? "All Products" : cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              ) : filteredProducts.length > 0 ? (
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
                <div className="col-span-full py-20 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">Try changing your filters or search term</p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilters({ priceRange: [0, 1000000], brands: [], rating: 0, inStock: false });
                    }}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Show More */}
            {visibleCount < filteredProducts.length && (
              <div className="mt-16 text-center">
                <button
                  onClick={handleShowMore}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-900 rounded-full hover:bg-gray-50 font-medium transition-all shadow-sm hover:shadow-md"
                >
                  Load More Products
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Mobile Filters Modal/Sidebar could go here - simple full screen implementation */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-bold text-lg">Filters</h3>
            <button onClick={() => setShowMobileFilters(false)}><X /></button>
          </div>
          <div className="p-4 h-[calc(100vh-64px)] overflow-y-auto">
            <ProductFilters
              onFilterChange={setFilters}
              products={products}
            />
            <div className="mt-8 pt-4 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Premium Product Card Component
function ProductCard({ product, index, wishlistItems, toggleWishlist, handleAddToCart, navigate, openQuickView }) {
  const isNew = (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24) < 30; // 30 days old

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative bg-white rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 border border-transparent hover:border-gray-100"
    >
      {/* Image Container with strict Aspect Ratio */}
      <div
        className="relative aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden cursor-pointer"
        onClick={() => navigate(`/product/${product._id}`)}
      >
        <img
          src={product.images?.[0]?.startsWith("http") ? product.images[0] : `http://localhost:5000${product.images?.[0]}`}
          alt={product.name}
          className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discountPercent > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide rounded-md">
              -{product.discountPercent}%
            </span>
          )}
          {isNew && (
            <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wide rounded-md">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => toggleWishlist(product._id, e)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 transform ${wishlistItems.includes(product._id)
              ? 'bg-red-50 text-red-500 scale-100 opacity-100'
              : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-red-500'
            }`}
        >
          <Heart size={18} className={wishlistItems.includes(product._id) ? "fill-current" : ""} />
        </button>

        {/* Hover Actions Overlay */}
        <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2 opacity-0 group-hover:opacity-100 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openQuickView();
            }}
            className="flex-1 py-2.5 bg-white text-gray-900 text-xs font-bold uppercase tracking-wide rounded-lg shadow-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <Eye size={14} /> Quick View
          </button>
          <button
            onClick={(e) => {
              handleAddToCart(product, e);
            }}
            disabled={product.stock === 0}
            className="flex-1 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wide rounded-lg shadow-lg hover:bg-black transition flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {product.stock > 0 ? (
              <> <ShoppingCart size={14} /> Add </>
            ) : "No Stock"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-1">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.brand || "Generic"}</p>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-medium text-gray-600">{product.rating?.toFixed(1) || "0.0"}</span>
          </div>
        </div>

        <h3
          className="font-medium text-gray-900 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
          {product.discountPercent > 0 && (
            <span className="text-sm text-gray-400 line-through">
              ₹{Math.round(product.price / (1 - product.discountPercent / 100)).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
