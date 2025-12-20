import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Check } from "lucide-react";

export default function ProductFilters({ onFilterChange, products, className }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    brands: [],
    rating: 0,
    inStock: false,
  });

  // Extract unique brands from products
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  const handlePriceChange = (index, value) => {
    const newRange = [...filters.priceRange];
    newRange[index] = parseInt(value);
    const newFilters = { ...filters, priceRange: newRange };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleBrand = (brand) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    const newFilters = { ...filters, brands: newBrands };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (rating) => {
    const newFilters = { ...filters, rating };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      priceRange: [0, 100000],
      brands: [],
      rating: 0,
      inStock: false,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount = 
    (filters.brands.length > 0 ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000 ? 1 : 0);

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-gray-400 hover:text-black transition-colors underline decoration-gray-300 underline-offset-4"
          >
            Reset
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-10">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Price Range</h4>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="100000"
            step="1000"
            value={filters.priceRange[1]}
            onChange={(e) => handlePriceChange(1, e.target.value)}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
          />
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2">
               <span className="text-xs text-gray-400 block mb-0.5">Min</span>
               <input
                 type="number"
                 value={filters.priceRange[0]}
                 onChange={(e) => handlePriceChange(0, e.target.value)}
                 className="w-full text-sm font-medium outline-none"
               />
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2">
               <span className="text-xs text-gray-400 block mb-0.5">Max</span>
               <input
                 type="number"
                 value={filters.priceRange[1]}
                 onChange={(e) => handlePriceChange(1, e.target.value)}
                 className="w-full text-sm font-medium outline-none"
               />
            </div>
          </div>
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="mb-10">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Brand</h4>
          <div className="space-y-2.5">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center group cursor-pointer"
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors mr-3 ${
                  filters.brands.includes(brand) ? "bg-black border-black" : "bg-white border-gray-300 group-hover:border-gray-400"
                }`}>
                  {filters.brands.includes(brand) && <Check size={12} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="hidden"
                />
                <span className={`text-sm transition-colors ${filters.brands.includes(brand) ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900"}`}>
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="mb-10">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Rating</h4>
        <div className="space-y-2.5">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center group cursor-pointer"
            >
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors mr-3 ${
                filters.rating === rating ? "border-black" : "border-gray-300 group-hover:border-gray-400"
              }`}>
                {filters.rating === rating && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
              </div>
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => handleRatingChange(rating)}
                className="hidden"
              />
              <span className={`text-sm flex items-center gap-1 ${filters.rating === rating ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                ))}
                <span className="text-xs text-gray-400 ml-1">& Up</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Status</h4>
        <label className="flex items-center group cursor-pointer">
          <div className={`w-9 h-5 rounded-full p-0.5 transition-colors mr-3 ${
            filters.inStock ? "bg-black" : "bg-gray-200"
          }`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
              filters.inStock ? "translate-x-4" : "translate-x-0"
            }`} />
          </div>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => {
              const newFilters = { ...filters, inStock: e.target.checked };
              setFilters(newFilters);
              onFilterChange(newFilters);
            }}
            className="hidden"
          />
          <span className="text-sm text-gray-600 group-hover:text-gray-900">In Stock Only</span>
        </label>
      </div>
    </div>
  );
}
