import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  Package
} from "lucide-react";

import { api, API_ENDPOINTS } from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.PRODUCTS.BASE);
      const items =
        res?.data?.data?.items ??
        res?.data?.items ??
        res?.data?.products ??
        [];
      setProducts(Array.isArray(items) ? items : []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchSearch =
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchCategory =
          category === "all" || p.category === category;

        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [products, searchTerm, category, sortBy]);

  const categories = [
    "all",
    "Mobile",
    "Tablet",
    "Laptop",
    "Accessories",
    "Parts"
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <p className="text-gray-500">Loading products…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">

        {/* ================= Header ================= */}
        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-gray-900">
            Products
          </h1>
          <p className="text-gray-500 mt-1">
            Devices, parts, and accessories you can trust
          </p>
        </div>

        {/* ================= Filters ================= */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products…"
              className="
                w-full pl-9 pr-4 py-2.5
                rounded-xl border border-black/10
                bg-white text-sm
                focus:outline-none focus:ring-2 focus:ring-black/10
              "
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="
              px-4 py-2.5 rounded-xl
              bg-white border border-black/10
              text-sm text-gray-700
            "
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="
                px-4 py-2.5 rounded-xl
                bg-white border border-black/10
                text-sm text-gray-700
              "
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* ================= Products ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/product/${product._id}`)}
              className="
                bg-white rounded-2xl
                border border-black/5
                shadow-sm hover:shadow-md
                transition cursor-pointer
                overflow-hidden
              "
            >
              {/* Image */}
              <div className="h-44 bg-gray-100 flex items-center justify-center">
                {product.images?.length ? (
                  <img
                    src={
                      product.images[0].startsWith("http")
                        ? product.images[0]
                        : `http://localhost:5000${product.images[0]}`
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-10 h-10 text-gray-400" />
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-gray-900 font-medium text-sm">
                  {product.name}
                </h3>

                <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-gray-900 font-semibold text-sm">
                    ₹{product.price?.toLocaleString()}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                      toast.success("Added to cart");
                    }}
                    disabled={!product.isActive}
                    className="
                      p-2 rounded-lg
                      bg-black text-white
                      hover:bg-gray-900
                      disabled:opacity-40
                      transition
                    "
                  >
                    <ShoppingCart size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty */}
        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-500 mt-16">
            No products found
          </p>
        )}
      </div>
    </div>
  );
}
