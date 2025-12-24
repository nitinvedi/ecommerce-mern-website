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
    <div className={`p-6 bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-[10px] font-bold uppercase tracking-wider text-[#0071e3] bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-10">
        <h4 className="text-sm font-bold text-slate-800 mb-4">Price Range</h4>
        <div className="space-y-4">
          <div className="relative h-1.5 bg-blue-100 rounded-full mb-6">
             <div 
                className="absolute h-full bg-[#0071e3] rounded-full" 
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
                className="absolute w-4 h-4 bg-white border-2 border-[#0071e3] rounded-full shadow-lg top-1/2 -translate-y-1/2 pointer-events-none transition-all"
                style={{ left: `${(filters.priceRange[1] / 100000) * 100}%` }}
             />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white border border-blue-100/50 shadow-sm hover:border-blue-200 rounded-xl px-3 py-2 transition-colors">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Min</span>
               <div className="flex items-center">
                  <span className="text-sm font-medium text-slate-400 mr-1">₹</span>
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange(0, e.target.value)}
                    className="w-full text-sm font-bold bg-transparent outline-none text-slate-900"
                  />
               </div>
            </div>
            <div className="flex-1 bg-white border border-blue-100/50 shadow-sm hover:border-blue-200 rounded-xl px-3 py-2 transition-colors">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Max</span>
               <div className="flex items-center">
                  <span className="text-sm font-medium text-slate-400 mr-1">₹</span>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange(1, e.target.value)}
                    className="w-full text-sm font-bold bg-transparent outline-none text-slate-900"
                  />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="mb-10">
          <h4 className="text-sm font-bold text-slate-800 mb-4">Brand</h4>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center group cursor-pointer justify-between py-1.5 px-2 -mx-2 rounded-lg hover:bg-blue-50/50 transition-colors"
              >
                <span className={`text-sm transition-colors ${filters.brands.includes(brand) ? "text-[#0071e3] font-semibold" : "text-slate-500 group-hover:text-slate-800"}`}>
                  {brand}
                </span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300 ${
                  filters.brands.includes(brand) ? "bg-[#0071e3] text-white scale-100 shadow-md shadow-blue-500/20" : "bg-slate-100 text-transparent scale-90 group-hover:scale-100"
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
        <h4 className="text-sm font-bold text-slate-800 mb-4">Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className={`flex items-center group cursor-pointer justify-between p-2 rounded-lg transition-colors ${filters.rating === rating ? "bg-blue-50 text-[#0071e3]" : "hover:bg-blue-50/50"}`}
            >
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < rating ? "text-amber-400" : "text-slate-200"}`}>★</span>
                ))}
                <span className={`text-xs ml-2 font-medium ${filters.rating === rating ? "text-[#0071e3]" : "text-slate-400"}`}>& Up</span>
              </span>
              
              <div className={`w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center ${filters.rating === rating ? "border-[#0071e3]" : ""}`}>
                 {filters.rating === rating && <div className="w-2 h-2 bg-[#0071e3] rounded-full" />}
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
        <label className="flex items-center justify-between cursor-pointer group p-3 bg-white border border-blue-100 hover:border-blue-300 rounded-xl transition-all shadow-sm">
          <span className="text-sm font-semibold text-slate-700">In Stock Only</span>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${
            filters.inStock ? "bg-[#0071e3]" : "bg-slate-200"
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
