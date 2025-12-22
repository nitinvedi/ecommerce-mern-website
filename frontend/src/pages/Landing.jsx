import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { 
  ChevronRight, Smartphone, Laptop, Tablet, Headphones, Wrench, Package, ArrowRight, X, 
  ShieldCheck, Clock, Award, Star, User, Plus, Minus, Search, Facebook, Twitter, Instagram, Linkedin 
} from "lucide-react";
import { api, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";

// --- COMPONENTS ---

const ScrollSection = ({ title, highlight, products }) => {
  const navigate = useNavigate();
  const scrollRef = React.useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeft(scrollLeft > 0);
        setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
     handleScroll(); // Initial check
  }, [products]);

  return (
    <div className="py-12 group/section">
      <div className="max-w-[1400px] mx-auto px-6 mb-6 flex justify-between items-end">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f]">
          {title} <span className="text-[#6e6e73]">{highlight}</span>
        </h2>
        {/* Desktop Controls */}
        <div className="hidden md:flex gap-2">
            <button 
                onClick={() => scroll("left")}
                disabled={!showLeft}
                className={`w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 transition-all ${showLeft ? "hover:bg-[#0071e3] hover:border-[#0071e3] hover:text-white text-gray-600 bg-white" : "opacity-30 cursor-not-allowed"}`}
            >
                <ChevronRight size={20} className="rotate-180" />
            </button>
            <button 
                onClick={() => scroll("right")}
                disabled={!showRight}
                className={`w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 transition-all ${showRight ? "hover:bg-[#0071e3] hover:border-[#0071e3] hover:text-white text-gray-600 bg-white" : "opacity-30 cursor-not-allowed"}`}
            >
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      <div className="relative group/slider">
          {/* Mobile/Tablet Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#f5f5f7] to-transparent z-10 md:hidden pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#f5f5f7] to-transparent z-10 md:hidden pointer-events-none" />

          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto px-6 pb-12 snap-x snap-mandatory scrollbar-hide"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            <div className="min-w-[max(0px,calc(50vw-700px-1.5rem))]" />
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                className="snap-center shrink-0 w-[280px] md:w-[360px] h-[480px] bg-white rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col justify-between group border border-transparent hover:border-gray-100"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-1 bg-gray-100 text-[#1d1d1f] text-[10px] font-bold uppercase tracking-wider rounded-md">New</span>
                    {/* Like Button Placeholder */}
                  </div>
                  <h3 className="text-xl font-semibold text-[#1d1d1f] line-clamp-2 min-h-[56px]">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-4">
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    className="max-w-full max-h-[220px] object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-sm"
                  />
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div className="text-[#1d1d1f]">
                    <p className="text-xs text-gray-500 font-medium">Starting at</p>
                    <p className="text-lg font-bold">₹{product.price.toLocaleString()}</p>
                  </div>
                  <button className="bg-[#1d1d1f] text-white rounded-full p-2.5 hover:scale-110 transition-transform shadow-lg shadow-black/10">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {/* View All Card */}
            <div
              onClick={() => navigate("/store")}
              className="snap-center shrink-0 w-[280px] md:w-[360px] h-[480px] bg-white rounded-[24px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all border border-gray-100 group gap-4 shadow-sm hover:shadow-lg"
            >
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <ArrowRight size={24} className="text-[#1d1d1f]" />
                </div>
                <p className="text-lg font-semibold text-[#1d1d1f]">View all products</p>
            </div>
            <div className="min-w-[max(0px,calc(50vw-700px-1.5rem))]" />
          </div>
      </div>
    </div>
  );
};

const BentoGrid = () => {
    const navigate = useNavigate();
    return (
        <section className="py-24 max-w-[1400px] mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-semibold text-[#1d1d1f] mb-12 tracking-tight">
                Featured <span className="text-[#6e6e73]">Collections.</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[600px]">
                {/* Repair Service - Large Card */}
                <div 
                    onClick={() => navigate('/repair')}
                    className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-[30px] p-8 md:p-12 cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-500 bg-black"
                >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1e] to-black opacity-90 z-0" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-30 transition-opacity duration-700 mix-blend-overlay z-0" />
                    
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <span className="px-3 py-1 rounded-full border border-white/20 text-xs font-semibold text-white/50 uppercase tracking-wider backdrop-blur-md">Service Center</span>
                            <h3 className="text-4xl md:text-5xl font-semibold text-white mt-4 leading-tight">Expert <br/><span className="text-[#2997ff]">Repairs.</span></h3>
                            <p className="text-gray-400 mt-4 max-w-sm text-lg">Official parts. Certified technicians. Same-day service assurance.</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-8">
                             <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-transform active:scale-95 flex items-center gap-2 group-hover:gap-4 duration-300">
                                Book Appointment <ArrowRight size={18} />
                             </button>
                        </div>
                    </div>
                </div>

                {/* Refurbished Store */}
                <div 
                     onClick={() => navigate('/store?category=Mobile')}
                     className="md:col-span-1 bg-white rounded-[30px] p-8 relative overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col justify-between"
                >
                    <div className="relative z-10">
                        <h3 className="text-2xl font-semibold text-[#1d1d1f]">Refurbished</h3>
                        <p className="text-gray-500 text-sm mt-1">Good as new.</p>
                    </div>
                    {/* Abstract blurry blobs for premium feel */}
                    <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 bg-gray-50 rounded-full blur-3xl group-hover:bg-blue-50 transition-colors duration-500" />
                    <Smartphone size={120} className="text-[#1d1d1f] absolute bottom-4 right-4 opacity-5 translate-y-4 translate-x-4 group-hover:translate-y-0 group-hover:translate-x-0 group-hover:opacity-10 transition-all duration-500" />
                     <div className="mt-8 flex justify-end">
                        <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center group-hover:bg-[#0071e3] group-hover:text-white transition-all duration-300">
                             <ChevronRight size={20} />
                        </div>
                     </div>
                </div>

                {/* Accessories */}
                <div 
                    onClick={() => navigate('/store?category=Accessories')}
                     className="md:col-span-1 bg-[#f5f5f7] rounded-[30px] p-8 relative overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between"
                >
                    <div className="relative z-10">
                        <h3 className="text-2xl font-semibold text-[#1d1d1f]">Accessories</h3>
                        <p className="text-gray-500 text-sm mt-1">Power & Sound.</p>
                    </div>
                    <Headphones size={120} className="text-[#1d1d1f] absolute bottom-4 right-4 opacity-5 rotate-12 group-hover:rotate-0 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500" />
                    <div className="mt-8 flex justify-end">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:bg-[#0071e3] group-hover:text-white transition-all duration-300 shadow-sm">
                             <Plus size={20} />
                        </div>
                     </div>
                </div>

                {/* Trade In */}
                <div 
                    onClick={() => navigate('/contact')}
                    className="md:col-span-2 bg-gradient-to-r from-[#1d1d1f] to-[#3a3a3c] rounded-[30px] p-8 relative overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-500 flex flex-row items-center justify-between"
                >
                     <div className="relative z-10 max-w-sm">
                         <span className="text-[#2997ff] font-bold tracking-wide uppercase text-xs">Trade-In</span>
                        <h3 className="text-3xl font-semibold text-white mt-1">Upgrade & Save.</h3>
                        <p className="text-gray-400 mt-2 text-sm">Get credit towards your next purchase when you trade in your eligible device.</p>
                     </div>
                     <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ArrowRight size={24} className="text-white" />
                     </div>
                </div>
            </div>
        </section>
    )
}

const FeaturesSection = () => {
    const features = [
        { icon: <ShieldCheck size={32} />, title: "Genuine Parts", desc: "We use only high-quality, authentic components." },
        { icon: <Award size={32} />, title: "6-Month Warranty", desc: "Peace of mind with every repair we perform." },
        { icon: <Clock size={32} />, title: "30-Min Service", desc: "Most repairs are done while you wait." },
        { icon: <Wrench size={32} />, title: "Expert Techs", desc: "Certified professionals handling your devices." },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] mb-4">Why Ram Mobiles?</h2>
                    <p className="text-xl text-gray-500">More than just a store. We are your tech partners.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] mb-6 group-hover:bg-[#0071e3] group-hover:text-white transition-colors duration-300">
                                {f.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">{f.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

const Testimonials = () => {
    const scrollRef = React.useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const reviews = [
        { name: "Aditya R.", role: "Student", text: "Fixed my iPhone screen in 20 minutes! Saved me from buying a new one.", rating: 5 },
        { name: "Priya S.", role: "Designer", text: "The refurbished MacBook I bought works perfectly. Highly recommend.", rating: 5 },
        { name: "Rahul K.", role: "Engineer", text: "Authentic accessories and great advice from the staff. My go-to tech shop.", rating: 4 },
        { name: "Neha M.", role: "Freelancer", text: "Super quick battery replacement. Phone feels brand new again.", rating: 5 },
        { name: "Vikram S.", role: "Photographer", text: "Best trade-in value I found in the city. Seamless process.", rating: 5 }
    ];

    const scroll = (direction) => {
        if (scrollRef.current) {
          const { current } = scrollRef;
          const scrollAmount = direction === "left" ? -350 : 350;
          current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };
    
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeft(scrollLeft > 0);
            setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    return (
        <section className="py-16 bg-[#f5f5f7] overflow-hidden group/section">
             <div className="max-w-[1400px] mx-auto px-6 mb-10 flex justify-between items-end">
                <h2 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f]">
                    Loved by <span className="text-[#6e6e73]">Locals.</span>
                </h2>
                {/* Controls */}
                <div className="hidden md:flex gap-2">
                    <button 
                        onClick={() => scroll("left")}
                        disabled={!showLeft}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 transition-all ${showLeft ? "hover:bg-[#0071e3] hover:border-[#0071e3] hover:text-white text-gray-600 bg-white" : "opacity-30 cursor-not-allowed"}`}
                    >
                        <ChevronRight size={20} className="rotate-180" />
                    </button>
                    <button 
                        onClick={() => scroll("right")}
                        disabled={!showRight}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 transition-all ${showRight ? "hover:bg-[#0071e3] hover:border-[#0071e3] hover:text-white text-gray-600 bg-white" : "opacity-30 cursor-not-allowed"}`}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="relative">
                {/* Fade Edges */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#f5f5f7] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#f5f5f7] to-transparent z-10 pointer-events-none" />

                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-6 overflow-x-auto px-6 pb-12 snap-x snap-mandatory scrollbar-hide"
                    style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                >
                     <div className="min-w-[max(0px,calc(50vw-700px-1.5rem))]" />
                     {reviews.map((r, i) => (
                         <div key={i} className="snap-center shrink-0 w-[320px] bg-white p-8 rounded-[24px] shadow-sm border border-transparent hover:border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                             <div className="flex gap-1 mb-4">
                                 {[...Array(5)].map((_, starI) => (
                                     <Star key={starI} size={16} className={`${starI < r.rating ? "fill-[#ffa500] text-[#ffa500]" : "text-gray-200"}`} />
                                 ))}
                             </div>
                             <p className="text-[#1d1d1f] font-medium text-lg leading-relaxed mb-6 line-clamp-3">"{r.text}"</p>
                             <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold border border-white shadow-sm">
                                     {r.name.charAt(0)}
                                 </div>
                                 <div>
                                     <p className="text-sm font-semibold text-[#1d1d1f]">{r.name}</p>
                                     <p className="text-xs text-gray-500">{r.role}</p>
                                 </div>
                             </div>
                         </div>
                     ))}
                     <div className="min-w-[max(0px,calc(50vw-700px-1.5rem))]" />
                </div>
            </div>
        </section>
    );
};

const TrackRepairWidget = () => {
    const navigate = useNavigate();
    const [ticketId, setTicketId] = useState("");

    const handleTrack = () => {
        if (ticketId) navigate(`/status/${ticketId}`);
    };

    return (
        <section className="py-20 bg-white border-t border-gray-100">
            <div className="max-w-[1400px] mx-auto px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-4">Check Repair Status</h2>
                    <p className="text-gray-500 mb-8">Enter your Ticket ID to see the real-time status of your device.</p>
                    <div className="flex items-center max-w-md mx-auto relative">
                        <input
                            type="text"
                            value={ticketId}
                            onChange={(e) => setTicketId(e.target.value)}
                            placeholder="Enter Ticket ID (e.g., REP-12345)"
                            className="w-full h-14 pl-6 pr-14 rounded-full border border-gray-300 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                        />
                        <button 
                            onClick={handleTrack}
                            className="absolute right-2 top-2 h-10 w-10 bg-[#0071e3] rounded-full flex items-center justify-center text-white hover:bg-[#0077ed] transition-colors"
                        >
                            <Search size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const faqs = [
        { q: "How long does a repair usually take?", a: "Most minor repairs like screen and battery replacements are done within 30-60 minutes. Complex board repairs may take 24-48 hours." },
        { q: "Do you offer warranty on repairs?", a: "Yes, we provide a 6-month warranty on all parts and labor. If the issue persists (excluding physical damage), we fix it for free." },
        { q: "What payment methods are accepted?", a: "We accept Cash, UPI (GPay, PhonePe), Credit/Debit Cards, and EMI options for purchases over ₹5000." },
        { q: "Can I sell my old phone?", a: "Absolutely! Bring your device for a quick evaluation, and we'll offer you instant cash or store credit towards a new purchase." },
    ];

    return (
        <section className="py-20 bg-[#f5f5f7]">
            <div className="max-w-[800px] mx-auto px-6">
                <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-12 text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 cursor-pointer border border-gray-200" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-[#1d1d1f] text-lg">{faq.q}</h3>
                                <div className={`text-[#0071e3] transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`}>
                                    {openIndex === i ? <Minus size={20} /> : <Plus size={20} />}
                                </div>
                            </div>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-gray-500 mt-4 leading-relaxed">{faq.a}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}



// --- MAIN PAGE ---

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [latestProducts, setLatestProducts] = useState([]);
  const [accessoryProducts, setAccessoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

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

        // Fetch accessories
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

  const handleProductClick = async (product) => {
    if (user) {
      await addToCart(product._id, 1);
      navigate("/cart");
    } else {
        navigate(`/product/${product._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <Helmet>
        <title>Store | Ram Mobiles - Best Tech Deals</title>
        <meta name="description" content="Shop the latest smartphones, laptops, and accessories at Ram Mobiles. Expert repair services and genuine parts available." />
      </Helmet>

      {/* Top Promotional Banner */}
      <AnimatePresence>
        {showBanner && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#1d1d1f] text-white overflow-hidden relative"
            >
                <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-center text-xs md:text-sm font-medium text-center">
                    <p>
                        Get <span className="text-[#2997ff]">₹500 OFF</span> on your first repair booking. Use code <span className="font-bold">RAM500</span>.
                        <span className="mx-2 text-gray-500">|</span>
                        <a href="/store" className="hover:underline text-[#2997ff] flex items-center inline-flex gap-1">
                            Shop now <ChevronRight size={12} />
                        </a>
                    </p>
                </div>
                <button 
                    onClick={() => setShowBanner(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={14} className="text-gray-400" />
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      
      {/* Header Section */}
      <div className="max-w-[1400px] mx-auto px-6 mb-16 pt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-6 max-w-2xl z-10">
                <div>
                   <h1 className="text-5xl md:text-[64px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">
                        Store.
                   </h1>
                   <p className="text-xl md:text-2xl text-[#6e6e73] font-normal leading-normal mt-4">
                        The best way to buy the products you love.
                        <br />
                        <span className="text-[#1d1d1f] font-medium">Only at Ram Mobiles.</span>
                   </p>
                </div>
            </div>
            
            {/* Dynamic Hero Visual */}
            <div className="hidden lg:block relative w-[400px] h-[300px]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center overflow-hidden">
                    <img 
                        src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708" 
                        alt="Featured Device" 
                        className="w-[120%] h-[120%] object-contain -rotate-12 translate-y-4 hover:rotate-0 transition-transform duration-700"
                    />
                </div>
            </div>

            {/* User Context Area (Mobile Only) */}
            <div className="hidden md:flex flex-col items-start md:items-end space-y-2 lg:hidden">
                <div className="flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=Support&background=random" className="w-10 h-10 rounded-full" alt="Specialist" />
                    <div className="text-sm">
                        <p className="text-[#1d1d1f] font-semibold">Need shopping help?</p>
                        <a href="/contact" className="text-[#0066cc] hover:underline">Ask a Specialist</a>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Category Navigation (Horizontal Icons) */}
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

      {/* Bento Grid */}
      <BentoGrid />

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

            {/* Track Repair - NEW Phase 3 */}
            <TrackRepairWidget />

            {/* Why Choose Ram Mobile */}
            <FeaturesSection />

            {/* Accessories Scroll Section */}
            <ScrollSection 
                title="Accessories." 
                highlight="Essentials that pair perfectly." 
                products={accessoryProducts} 
            />

            {/* Testimonials */}
            <Testimonials />

            {/* FAQ - NEW Phase 3 */}
            <FAQ />

            {/* Footer - NEW Phase 3 */}
            <Footer />
        </>
      )}
    </div>
  );
};

export default Landing;
