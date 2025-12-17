import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, Layers } from "lucide-react";

import { api, API_ENDPOINTS } from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

/* ================= MOTION ================= */

const slideDown = {
  hidden: { y: -40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.35 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");

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

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priceFilter === "low") result = result.filter(p => p.price < 20000);
    if (priceFilter === "mid") result = result.filter(p => p.price >= 20000 && p.price <= 50000);
    if (priceFilter === "high") result = result.filter(p => p.price > 50000);

    return result;
  }, [products, searchTerm, priceFilter]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f9fafb] min-h-screen">

      {/* SEARCH ICON */}
      {!searchOpen && (
        <div className="max-w-7xl mx-auto px-6 mt-10 flex justify-end">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2.5 rounded-full bg-white shadow-sm border border-black/10"
          >
            <Search size={18} />
          </button>
        </div>
      )}

      {/* ================= SEARCH TAKEOVER ================= */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={slideDown}
            className="fixed inset-0 z-50 bg-[#f9fafb]"
          >
            <div className="max-w-7xl mx-auto px-6 pt-24">
              <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-3">
                <Search className="text-gray-400" />
                <input
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products"
                  className="flex-1 outline-none text-lg"
                />
                <SlidersHorizontal className="text-gray-400" />
                <button onClick={() => setSearchOpen(false)}>
                  <X />
                </button>
              </div>

              {/* FILTERS */}
              <div className="flex gap-3 mt-6">
                {[
                  { key: "all", label: "All" },
                  { key: "low", label: "Below ₹20k" },
                  { key: "mid", label: "₹20k – ₹50k" },
                  { key: "high", label: "Above ₹50k" }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setPriceFilter(f.key)}
                    className={`px-4 py-2 rounded-full text-sm border ${
                      priceFilter === f.key
                        ? "bg-black text-white"
                        : "bg-white border-black/10"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH RESULTS */}
            <div className="max-w-7xl mx-auto px-6 mt-12">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {filteredProducts.map((p) => (
                  <motion.div
                    key={p._id}
                    whileHover={{ y: -6 }}
                    onClick={() => navigate(`/product/${p._id}`)}
                    className="bg-white rounded-3xl shadow-sm hover:shadow-lg cursor-pointer overflow-hidden"
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
                        ₹{p.price?.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= NORMAL PAGE ================= */}
      {!searchOpen && (
        <>
          {/* PRODUCT SHOWCASE */}
          <section className="mt-24 space-y-24">
            {products.slice(0, 3).map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center"
              >
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500 mb-3">
                    New Arrival
                  </p>
                  <h2 className="text-4xl font-semibold">{p.name}</h2>
                  <p className="text-gray-600 mt-6 max-w-md">
                    {p.description}
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gray-100 rounded-3xl" />
                  <img
                    src={
                      p.images?.[0]?.startsWith("http")
                        ? p.images[0]
                        : `http://localhost:5000${p.images[0]}`
                    }
                    className="relative z-10 mx-auto h-[420px] object-contain"
                  />
                </div>
              </motion.div>
            ))}
          </section>

          {/* FEATURED */}
          <section className="mt-24">
            <div className="max-w-7xl mx-auto px-6 mb-8">
              <h2 className="text-3xl font-semibold">Featured products</h2>
            </div>

            <div className="flex gap-6 overflow-x-auto px-6 pb-4 scrollbar-hide">
              {featuredProducts.map((p) => (
                <motion.div
                  key={p._id}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="min-w-[300px] bg-white rounded-3xl shadow-sm cursor-pointer"
                >
                  <img
                    src={
                      p.images?.[0]?.startsWith("http")
                        ? p.images[0]
                        : `http://localhost:5000${p.images[0]}`
                    }
                    className="h-56 w-full object-contain bg-gray-50"
                  />
                </motion.div>
              ))}
            </div>
          </section>

          {/* QUICK ADD MOMENTUM CAROUSEL */}
          <section className="mt-32">
            <div className="max-w-7xl mx-auto px-6 mb-10">
              <h2 className="text-3xl font-semibold">Ready to buy?</h2>
            </div>
            <MomentumCarousel
              products={products}
              addToCart={addToCart}
              toast={toast}
            />
          </section>

        </>
      )}
    </div>
  );
}

/* ================= MOMENTUM CAROUSEL ================= */

function MomentumCarousel({ products, addToCart, toast }) {
  const ref = useRef(null);
  const [maxDrag, setMaxDrag] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const resize = () => setMaxDrag(el.scrollWidth - el.clientWidth);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [products]);

  return (
    <div className="relative overflow-hidden">
      <motion.div
        ref={ref}
        drag="x"
        dragConstraints={{ left: -maxDrag, right: 0 }}
        dragElastic={0.18}
        dragMomentum
        className="flex gap-6 px-6 pb-6 cursor-grab"
        whileTap={{ cursor: "grabbing" }}
      >
        {products.map((p) => (
          <motion.div
            key={p._id}
            className="min-w-[260px] bg-white rounded-3xl shadow-sm"
          >
            <div className="h-44 bg-gray-50 flex items-center justify-center rounded-t-3xl">
              <img
                src={
                  p.images?.[0]?.startsWith("http")
                    ? p.images[0]
                    : `http://localhost:5000${p.images[0]}`
                }
                className="h-32 object-contain pointer-events-none"
              />
            </div>

            <div className="p-5">
              <h3 className="text-sm font-medium">{p.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                ₹{p.price?.toLocaleString()}
              </p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  addToCart(p, 1);
                  toast.success("Added to cart");
                }}
                className="mt-4 w-full py-2.5 rounded-full bg-black text-white text-sm"
              >
                Add to Cart
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
