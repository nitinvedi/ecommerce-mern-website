import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Smartphone, Laptop, Tablet, Headphones, Wrench, Package, ArrowRight } from "lucide-react";
import { api, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// Components
const ScrollSection = ({ title, highlight, products }) => {
  const navigate = useNavigate();

  return (
    <div className="py-12">
      <div className="max-w-[1400px] mx-auto px-6 mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f]">
          {title} <span className="text-[#6e6e73]">{highlight}</span>
        </h2>
      </div>

      <div className="overflow-x-auto pb-8 hide-scrollbar px-6 flex gap-6 snap-x snap-mandatory">
        {/* Spacer for left padding in scroll container */}
        <div className="min-w-[max(0px,calc(50vw-700px-1.5rem))]" />

        {products.map((product) => (
          <div
            key={product._id}
            onClick={() => navigate(`/product/${product._id}`)}
            className="snap-center shrink-0 w-[300px] md:w-[400px] h-[500px] bg-white rounded-[18px] p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group border border-gray-100"
          >
            <div>
              <p className="text-xs font-semibold text-[#bf4800] uppercase mb-1">New</p>
              <h3 className="text-2xl font-semibold text-[#1d1d1f] group-hover:underline decoration-2 underline-offset-4">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{product.category}</p>
            </div>

            <div className="w-full h-[250px] flex items-center justify-center my-4">
              <img
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="flex justify-between items-end">
              <div className="text-[#1d1d1f]">
                <p className="text-sm">From</p>
                <p className="font-semibold">₹{product.price.toLocaleString()}</p>
              </div>
              <button className="bg-[#0071e3] text-white rounded-full p-2 hover:bg-[#0077ed] transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ))}

        {/* View All Card */}
        <div
          onClick={() => navigate("/store")}
          className="snap-center shrink-0 w-[300px] md:w-[400px] h-[500px] bg-[#f5f5f7] rounded-[18px] flex items-center justify-center cursor-pointer hover:bg-[#e8e8ed] transition-colors border border-gray-200"
        >
          <div className="text-center">
            <p className="text-xl font-semibold text-[#1d1d1f] mb-2">View all products</p>
            <div className="inline-flex items-center justify-center bg-white rounded-full p-3 shadow-sm">
              <ArrowRight size={24} color="#1d1d1f" />
            </div>
          </div>
        </div>

        <div className="min-w-[max(0px,calc(50vw-700px-1.5rem))]" />
      </div>
    </div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [latestProducts, setLatestProducts] = useState([]);
  const [accessoryProducts, setAccessoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categories for the top nav
  const categories = [
    { name: "Mobile", icon: <Smartphone size={48} />, link: "/store?category=Mobile" },
    { name: "Laptop", icon: <Laptop size={48} />, link: "/store?category=Laptop" },
    { name: "Tablet", icon: <Tablet size={48} />, link: "/store?category=Tablet" },
    { name: "Accessories", icon: <Headphones size={48} />, link: "/store?category=Accessories" },
    { name: "Parts", icon: <Package size={48} />, link: "/store?category=Parts" },
    { name: "Repair", icon: <Wrench size={48} />, link: "/repair" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch latest products
        const latestRes = await api.get(`${API_ENDPOINTS.PRODUCTS.BASE}?limit=6&sort=-createdAt`);
        setLatestProducts(latestRes.data.items || []);

        // Fetch accessories (simulating "Loud and clear" audio section)
        const accRes = await api.get(`${API_ENDPOINTS.PRODUCTS.BASE}?limit=4&category=Accessories`);
        setAccessoryProducts(accRes.data.items || []);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-20 pb-20 font-sans">
      {/* Header Section */}
      <div className="max-w-[1400px] mx-auto px-6 mb-16 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-[64px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">
              Store.
            </h1>
            <p className="text-xl md:text-2xl text-[#6e6e73] font-normal leading-relaxed">
              The best way to buy your tech at <span className="text-[#1d1d1f] font-medium">Ram Mobile.</span>
            </p>
          </div>

          {/* User Context Area */}
          <div className="hidden md:flex flex-col items-start md:items-end space-y-2">
            <div className="flex items-center gap-3">
              <img
                src="https://ui-avatars.com/api/?name=Support&background=random"
                className="w-10 h-10 rounded-full"
                alt="Specialist"
              />
              <div className="text-sm">
                <p className="text-[#1d1d1f] font-semibold">Need shopping help?</p>
                <a href="/contact" className="text-[#0066cc] hover:underline">
                  Ask a Specialist
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="max-w-[1400px] mx-auto px-6 mb-20">
        <div className="flex gap-8 md:gap-12 overflow-x-auto pb-4 hide-scrollbar snap-x">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(cat.link)}
              className="flex flex-col items-center gap-3 min-w-[80px] cursor-pointer group snap-start"
            >
              <div className="w-[100px] h-[80px] flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2">
                <div className="text-[#1d1d1f] opacity-80 group-hover:opacity-100 transition-opacity">
                  {cat.icon}
                </div>
              </div>
              <span className="text-sm font-medium text-[#1d1d1f] group-hover:underline underline-offset-4 decoration-[#1d1d1f]">
                {cat.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* "The Latest" Scroll Section */}
      {loading ? (
        <div className="h-[500px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <ScrollSection 
            title="The latest." 
            highlight="Take a look at what's new." 
            products={latestProducts} 
          />

          {/* "The Difference" Section */}
          <div className="py-12 bg-white my-12">
            <div className="max-w-[1400px] mx-auto px-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f] mb-8">
                The Ram Mobile <span className="text-[#6e6e73]">Difference.</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Repair */}
                <div
                  onClick={() => navigate("/repair")}
                  className="h-[400px] rounded-[18px] p-8 relative overflow-hidden bg-[#fbfbfd] cursor-pointer hover:scale-[1.01] transition-transform duration-500"
                >
                  <div className="relative z-10 max-w-[80%]">
                    <p className="text-xs font-bold text-[#b64400] uppercase mb-2">Expert Service</p>
                    <h3 className="text-3xl font-semibold text-[#1d1d1f] mb-2">Broken Screen?</h3>
                    <p className="text-lg text-[#1d1d1f] mb-8">
                      We fix it fast. Genuine parts, expert technicians.
                    </p>
                  </div>
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-[-15deg]">
                    <Wrench size={200} className="text-gray-200" />
                  </div>
                </div>

                {/* Card 2: Customization */}
                <div className="h-[400px] rounded-[18px] p-8 relative overflow-hidden bg-[#fbfbfd] group">
                  <div className="relative z-10">
                    <h3 className="text-3xl font-semibold text-[#1d1d1f] mb-2">Pay how you want.</h3>
                    <p className="text-lg text-[#1d1d1f]">Cash, Card, or UPI. Simple and secure.</p>
                  </div>
                  <div className="absolute bottom-8 right-8 text-[#0071e3]">
                    <div className="p-4 bg-white rounded-full shadow-md">
                      <Package size={32} />
                    </div>
                  </div>
                </div>

                {/* Card 3: Support */}
                <div
                  onClick={() => navigate("/contact")}
                  className="bg-[#1d1d1f] h-[400px] rounded-[18px] p-8 relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform duration-500 text-white"
                >
                  <div className="relative z-10">
                    <h3 className="text-3xl font-semibold mb-2">We're here to help.</h3>
                    <p className="text-lg text-gray-300">Have a question? Chat with our specialists.</p>
                  </div>
                  <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute right-8 bottom-8">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accessories Scroll Section */}
          <ScrollSection 
            title="Accessories." 
            highlight="Essentials that pair perfectly." 
            products={accessoryProducts} 
          />
        </>
      )}
    </div>
  );
};

export default Landing;
