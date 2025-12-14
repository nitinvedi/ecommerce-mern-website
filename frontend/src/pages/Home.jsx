import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, ShoppingCart, Star, Package } from "lucide-react";

import { api, API_ENDPOINTS } from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();

  const [products, setProducts] = useState([]); // ALWAYS ARRAY
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =========================
     FETCH PRODUCTS (FIXED)
  ========================= */
  const fetchProducts = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS.BASE);

      // ✅ Handle paginated backend safely
      const items =
        response?.data?.data?.items ??
        response?.data?.items ??
        response?.data?.products ??
        [];

      setProducts(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  /* =========================
     FILTER + SORT (SAFE)
  ========================= */
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          categoryFilter === "all" || product.category === categoryFilter;

        const matchesPrice =
          priceFilter === "all" ||
          (priceFilter === "low" && product.price < 10000) ||
          (priceFilter === "medium" &&
            product.price >= 10000 &&
            product.price < 50000) ||
          (priceFilter === "high" && product.price >= 50000);

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  }, [products, searchTerm, categoryFilter, priceFilter, sortBy]);

  const categories = [
    "all",
    "Mobile",
    "Tablet",
    "Laptop",
    "Accessories",
    "Parts",
    "Other",
  ];

  /* =========================
     LOADING STATE
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold text-white mb-2">Our Products</h1>
        <p className="text-slate-400 mb-8">
          Browse our collection of devices and accessories
        </p>

        {/* SEARCH */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
          />
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Filter className="text-slate-400" />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-white px-4 py-2"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-white px-4 py-2"
          >
            <option value="all">All Prices</option>
            <option value="low">Under ₹10,000</option>
            <option value="medium">₹10,000 - ₹50,000</option>
            <option value="high">Above ₹50,000</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-white px-4 py-2"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/product/${product._id}`)}
              className="bg-slate-800 rounded-lg overflow-hidden cursor-pointer"
            >
              <div className="h-48 bg-slate-700 flex items-center justify-center">
                {product.images?.length ? (
                  <img
                    src={
                      product.images[0].startsWith("http")
                        ? product.images[0]
                        : `http://localhost:5000${product.images[0]}`
                    }
                    className="w-full h-full object-cover"
                    alt={product.name}
                  />
                ) : (
                  <Package className="text-slate-500 w-16 h-16" />
                )}
              </div>

              <div className="p-4">
                <h3 className="text-white font-bold">{product.name}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">
                  {product.description}
                </p>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-white font-bold">
                    ₹{product.price?.toLocaleString()}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={!product.isActive}
                    className="bg-blue-500 px-3 py-1 rounded text-white disabled:opacity-50"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-center text-slate-400 mt-12">
            No products found
          </p>
        )}
      </div>
    </div>
  );
}
