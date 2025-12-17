import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Star,
  Plus,
  Minus,
  ArrowLeft
} from "lucide-react";

import { api, API_ENDPOINTS } from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";
import useAuth from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";

/* ================= MOTION ================= */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
      setProduct(res.data);
    } catch {
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product.isActive) {
      toast.error("Product is out of stock");
      return;
    }
    addToCart(product, quantity);
    toast.success("Added to cart");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please sign in");

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
      <div className="min-h-screen grid place-items-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">

        {/* ================= BACK ================= */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-12"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* ================= HERO ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[80vh]">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center"
          >
            <img
              src={
                product.images?.[selectedImage]?.startsWith("http")
                  ? product.images[selectedImage]
                  : `http://localhost:5000${product.images[selectedImage]}`
              }
              className="max-h-[520px] object-contain"
              alt={product.name}
            />
          </motion.div>

          {/* Info */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-semibold tracking-tight">
              {product.name}
            </h1>

            <p className="mt-4 text-gray-500 max-w-md">
              {product.description}
            </p>

            <div className="flex items-center gap-3 mt-6">
              <Star className="text-yellow-400 fill-yellow-400" size={18} />
              <span className="font-medium">
                {product.rating?.toFixed(1) || "0.0"}
              </span>
              <span className="text-gray-400">
                ({product.numReviews || 0} reviews)
              </span>
            </div>

            <p className="text-3xl font-semibold mt-8">
              ₹{product.price?.toLocaleString()}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              disabled={!product.isActive}
              className="mt-10 px-8 py-4 bg-black text-white rounded-full flex items-center gap-3 disabled:opacity-40"
            >
              <ShoppingCart size={18} />
              Add to cart
            </button>
          </motion.div>
        </section>

        {/* ================= REVIEWS ================= */}
        <section className="mt-32 max-w-4xl">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl font-semibold"
          >
            Reviews
          </motion.h2>

          {user && (
            <form
              onSubmit={handleSubmitReview}
              className="mt-8 bg-gray-50 rounded-2xl p-6"
            >
              <select
                value={review.rating}
                onChange={(e) =>
                  setReview({ ...review, rating: +e.target.value })
                }
                className="mb-4 px-4 py-2 rounded-lg bg-white"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Stars
                  </option>
                ))}
              </select>

              <textarea
                value={review.comment}
                onChange={(e) =>
                  setReview({ ...review, comment: e.target.value })
                }
                placeholder="Share your experience"
                className="w-full px-4 py-3 rounded-xl border mb-4"
                rows={4}
              />

              <button
                disabled={submittingReview}
                className="px-6 py-3 bg-black text-white rounded-full"
              >
                Submit review
              </button>
            </form>
          )}

          <div className="mt-10 space-y-6">
            {product.reviews?.length ? (
              product.reviews.map((r, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="border-b pb-6"
                >
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        size={14}
                        className={
                          idx < r.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{r.comment}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-400 mt-6">
                No reviews yet.
              </p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
