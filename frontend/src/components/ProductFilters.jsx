import React, { useState } from "react";
import { Check } from "lucide-react";

export default function ProductFilters({ onFilterChange, products, className }) {
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
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-[10px] font-bold uppercase tracking-wider text-black bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-10">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Price Range</h4>
        <div className="space-y-4">
          <div className="relative h-1.5 bg-gray-100 rounded-full mb-6">
             <div 
                className="absolute h-full bg-black rounded-full" 
                style={{ 
                    left: `${(filters.priceRange[0] / 100000) * 100}%`, 
                    right: `${100 - (filters.priceRange[1] / 100000) * 100}%` 
                }} 
             />
             <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
             />
             <div 
                className="absolute w-4 h-4 bg-white border-2 border-black rounded-full shadow-md top-1/2 -translate-y-1/2 pointer-events-none transition-all"
                style={{ left: `${(filters.priceRange[1] / 100000) * 100}%` }}
             />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl px-3 py-2 transition-colors">
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Min</span>
               <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-400 mr-1">₹</span>
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange(0, e.target.value)}
                    className="w-full text-sm font-bold bg-transparent outline-none text-gray-900"
                  />
               </div>
            </div>
            <div className="flex-1 bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl px-3 py-2 transition-colors">
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Max</span>
               <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-400 mr-1">₹</span>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange(1, e.target.value)}
                    className="w-full text-sm font-bold bg-transparent outline-none text-gray-900"
                  />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="mb-10">
          <h4 className="text-sm font-bold text-gray-900 mb-4">Brand</h4>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center group cursor-pointer justify-between py-1"
              >
                <span className={`text-sm transition-colors ${filters.brands.includes(brand) ? "text-black font-semibold" : "text-gray-500 group-hover:text-gray-900"}`}>
                  {brand}
                </span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300 ${
                  filters.brands.includes(brand) ? "bg-black text-white scale-100" : "bg-gray-100 text-transparent scale-90 group-hover:scale-100"
                }`}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="hidden"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="mb-10">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className={`flex items-center group cursor-pointer justify-between p-2 rounded-lg transition-colors ${filters.rating === rating ? "bg-gray-100" : "hover:bg-gray-50"}`}
            >
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                ))}
                <span className="text-xs text-gray-400 ml-2 font-medium">& Up</span>
              </span>
              
              <div className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center ${filters.rating === rating ? "border-black" : ""}`}>
                 {filters.rating === rating && <div className="w-2 h-2 bg-black rounded-full" />}
              </div>

              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => handleRatingChange(rating)}
                className="hidden"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="flex items-center justify-between cursor-pointer group p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all">
          <span className="text-sm font-semibold text-gray-900">In Stock Only</span>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${
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
        </label>
      </div>
    </div>
  );
}
