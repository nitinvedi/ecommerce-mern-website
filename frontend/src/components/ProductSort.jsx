import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductSort({ onSortChange, currentSort }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    { value: "popularity", label: "Most Popular" },
    { value: "newest", label: "Newest Arrivals" },
    { value: "rating", label: "Top Rated" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ];

  const selectedLabel = sortOptions.find(o => o.value === currentSort)?.label || "Sort By";

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-20" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-full text-sm font-medium text-gray-700 transition-all shadow-sm hover:shadow-md min-w-[180px] justify-between group"
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 origin-top-right"
          >
            {sortOptions.map((option) => (
               <button
                 key={option.value}
                 onClick={() => {
                   onSortChange(option.value);
                   setIsOpen(false);
                 }}
                 className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
                   currentSort === option.value ? "text-blue-600 font-semibold bg-blue-50/50" : "text-gray-600"
                 }`}
               >
                 {option.label}
                 {currentSort === option.value && <Check size={14} />}
               </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
