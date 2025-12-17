import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ShoppingCart,
  Package,
  Sparkles,
  Layers
} from "lucide-react";

import { api, API_ENDPOINTS } from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";

/* ================= MOTION ================= */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const featuredProducts = products.slice(0, 4);
  const lineupProducts = products.slice(0, 6);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f9fafb] min-h-screen">
      <Navbar />

      {/* ================= ICON SEARCH ================= */}
      <div className="fixed top-20 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex justify-end gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-full bg-white border border-black/10"
          >
            <Search size={18} />
          </button>
          <button className="p-2 rounded-full bg-white border border-black/10">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* ================= EXPANDING SEARCH ================= */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-20 left-0 right-0 z-50"
          >
            <div className="max-w-3xl mx-auto px-6">
              <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-3">
                <Search className="text-gray-400" />
                <input
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products"
                  className="flex-1 outline-none"
                />
                <button onClick={() => setSearchOpen(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= SCROLL AREA ================= */}
      <div className="pt-36">

        {/* ================================================= */}
        {/* 1️⃣ IMAGE SHOWCASE — GET TO KNOW IPHONE STYLE */}
        {/* ================================================= */}
        <section className="mb-40">
          <div className="max-w-7xl mx-auto px-6 mb-16">
            <h2 className="text-5xl font-semibold tracking-tight">
              Get to know our products.
            </h2>
          </div>

          <div className="flex gap-10 overflow-x-auto px-6 snap-x snap-mandatory scrollbar-hide">
            {featuredProducts.map((p) => (
              <motion.div
                key={p._id}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/product/${p._id}`)}
                className="
                  min-w-[420px] h-[75vh]
                  bg-black rounded-[32px]
                  relative overflow-hidden
                  snap-start cursor-pointer
                "
              >
                {/* Text */}
                <div className="absolute top-8 left-8 z-10 text-white max-w-xs">
                  <p className="text-sm opacity-80 mb-2">Innovation</p>
                  <h3 className="text-2xl font-semibold">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm opacity-80">
                    {p.description}
                  </p>
                </div>

                {/* Image */}
                <img
                  src={
                    p.images?.[0]?.startsWith("http")
                      ? p.images[0]
                      : `http://localhost:5000${p.images[0]}`
                  }
                  className="
                    absolute bottom-0 left-1/2
                    -translate-x-1/2
                    h-[85%] object-contain
                  "
                  alt={p.name}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================================================= */}
        {/* 2️⃣ EXPLORE THE LINEUP — APPLE SLIDER */}
        {/* ================================================= */}
        <section className="mb-40">
          <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between">
            <h2 className="text-4xl font-semibold">Explore the lineup.</h2>
          </div>

          <div className="flex justify-center">
            <div className="flex gap-20 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-20">
              {lineupProducts.map((p) => (
                <motion.div
                  key={p._id}
                  whileHover={{ scale: 1.05 }}
                  className="
                    min-w-[280px]
                    text-center snap-center
                    cursor-pointer
                  "
                  onClick={() => navigate(`/product/${p._id}`)}
                >
                  <img
                    src={
                      p.images?.[0]?.startsWith("http")
                        ? p.images[0]
                        : `http://localhost:5000${p.images[0]}`
                    }
                    className="h-[380px] mx-auto object-contain"
                  />

                  <h3 className="mt-6 text-xl font-semibold">
                    {p.name}
                  </h3>

                  <p className="text-gray-500 mt-2">
                    {p.description?.slice(0, 60)}…
                  </p>

                  <p className="mt-4 font-medium">
                    From ₹{p.price?.toLocaleString()}
                  </p>

                  <div className="flex justify-center gap-4 mt-6">
                    <button className="text-blue-600">Learn more</button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p, 1);
                        toast.success("Added to cart");
                      }}
                      className="text-blue-600"
                    >
                      Buy
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* 3️⃣ OPTIONAL GRID (STILL USEFUL FOR SEARCH) */}
        {/* ================================================= */}
        {searchTerm && (
          <section className="max-w-7xl mx-auto px-6 mb-32">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((p) => (
                <motion.div
                  key={p._id}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-black/5 cursor-pointer"
                >
                  <div className="h-44 bg-gray-100">
                    <img
                      src={
                        p.images?.[0]?.startsWith("http")
                          ? p.images[0]
                          : `http://localhost:5000${p.images[0]}`
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ₹{p.price}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ================================================= */}
        {/* 4️⃣ BUNDLE */}
        {/* ================================================= */}
        <section className="mb-32">
          <div className="max-w-4xl mx-auto px-6 bg-white rounded-3xl p-10">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Layers size={20} /> Frequently bought together
            </h2>

            <button className="mt-8 px-6 py-3 bg-black text-white rounded-xl">
              Add bundle to cart
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
