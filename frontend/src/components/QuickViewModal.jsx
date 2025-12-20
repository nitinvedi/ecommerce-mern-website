import React, { useState } from "react";
import { X, Star, ShoppingCart, Check, Shield, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart }) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!isOpen || !product) return null;

  const images = product.images?.length 
    ? product.images.map(img => img.startsWith("http") ? img : `http://localhost:5000${img}`)
    : ["/placeholder.png"];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="grid md:grid-cols-2">
            {/* Gallery */}
            <div className="bg-gray-50 p-6 flex flex-col gap-4">
              <div className="aspect-square bg-white rounded-xl overflow-hidden border border-gray-100 relative">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-lg border-2 flex-shrink-0 overflow-hidden ${
                        selectedImage === idx ? "border-blue-600" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-8 flex flex-col h-full">
              <div className="mb-auto">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">
                      {product.brand}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                      {product.name}
                    </h2>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </p>
                    {product.mrp > product.price && (
                      <p className="text-sm text-gray-500 line-through">
                        ₹{product.mrp.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"}
                        className={i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.reviews?.length || 0} reviews)
                  </span>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* Features */}
                {/* Features */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield size={16} className="text-green-500" />
                    <span>Original Product</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck size={16} className="text-blue-500" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {product.stock > 0 ? (
                        <>
                           <Check size={16} className="text-green-500" />
                           <span>{product.stock < 10 ? `Only ${product.stock} left` : "In Stock"}</span>
                        </>
                    ) : (
                        <>
                           <X size={16} className="text-red-500" />
                           <span className="text-red-500 font-medium">Out of Stock</span>
                        </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-100 flex gap-4">
                <button
                  onClick={(e) => {
                    if (product.stock > 0) {
                        onAddToCart(product, e);
                        onClose();
                    }
                  }}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={20} />
                  {product.stock > 0 ? "Add to Cart" : "Sold Out"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
