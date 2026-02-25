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
        <section className="py-24 max-w-[1400px] mx-auto px-6 relative">
            {/* 5. Bento Section Header Enhancement */}
            <div className="flex flex-col items-start mb-14">
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-[#0071e3] text-sm font-semibold mb-4 border border-blue-500/20 shadow-sm flex items-center gap-2 backdrop-blur-md">
                    <Star size={14} className="fill-[#0071e3]" /> Highlighted Experiences
                </span>
                <h2 className="text-4xl md:text-6xl font-bold text-[#1d1d1f] tracking-tight">
                    Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">Collections.</span>
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[600px]">
                {/* 6. Repair Service Card - Large Card */}
                <div 
                    onClick={() => navigate('/repair')}
                    className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-[32px] p-8 md:p-12 cursor-pointer group shadow-xl hover:shadow-2xl transition-all duration-700 bg-black border border-white/5"
                >
                    {/* Background Gradient & Animated Orbs */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#101012] to-black opacity-90 z-0" />
                    <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 group-hover:opacity-40 group-hover:scale-125 transition-all duration-1000" />
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-10 group-hover:opacity-30 group-hover:scale-125 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-20 group-hover:scale-105 transition-all duration-1000 mix-blend-overlay z-0" />
                    
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white uppercase tracking-widest backdrop-blur-md shadow-lg inline-block">Service Center</span>
                            <h3 className="text-5xl md:text-[64px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mt-6 leading-[1.1] group-hover:translate-x-2 transition-transform duration-500">Expert <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#2997ff]">Repairs.</span></h3>
                            <p className="text-gray-400 mt-5 max-w-sm text-lg font-medium leading-relaxed">Official parts. Certified technicians. Same-day service assurance.</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-8">
                             <button className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-3 group-hover:pr-6 duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                Book Appointment <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                             </button>
                        </div>
                    </div>
                </div>

                {/* 7. Refurbished Store */}
                <div 
                     onClick={() => navigate('/store?category=Mobile')}
                     className="md:col-span-1 bg-white rounded-[32px] p-8 relative overflow-hidden cursor-pointer group shadow-md hover:shadow-2xl transition-all duration-700 border border-gray-100 flex flex-col justify-between hover:border-blue-100/50"
                >
                    {/* Animated gradient border on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-700 pointer-events-none" />
                    
                    <div className="relative z-10 group-hover:-translate-y-1 transition-transform duration-500">
                        <h3 className="text-5xl font-bold text-[#1d1d1f] tracking-tight">Refurb.</h3>
                        <p className="text-gray-500 font-medium mt-3 text-lg">Good as new.</p>
                    </div>
                    {/* Abstract blurry blobs for premium feel */}
                    <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-gray-50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-700" />
                    <Smartphone size={140} className="text-[#1d1d1f] absolute bottom-2 right-2 opacity-[0.03] translate-y-8 translate-x-8 group-hover:translate-y-2 group-hover:translate-x-2 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700" />
                     <div className="mt-8 flex justify-end relative z-10">
                        <div className="w-14 h-14 rounded-full bg-[#f5f5f7] flex items-center justify-center group-hover:bg-[#0071e3] group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-sm">
                             <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                     </div>
                </div>

                {/* 8. Accessories */}
                <div 
                    onClick={() => navigate('/store?category=Accessories')}
                     className="md:col-span-1 bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] rounded-[32px] p-8 relative overflow-hidden cursor-pointer group shadow-md hover:shadow-2xl transition-all duration-700 flex flex-col justify-between border border-white"
                >
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-100/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <div className="relative z-10 group-hover:-translate-y-1 transition-transform duration-500">
                        <h3 className="text-[40px] font-bold text-[#1d1d1f] leading-none tracking-tight">Sounds &<br/>Power.</h3>
                        <p className="text-gray-500 font-medium mt-3 text-lg">Top accessories.</p>
                    </div>
                    {/* Floating headset animation */}
                    <Headphones size={130} className="text-[#1d1d1f] absolute bottom-4 right-4 opacity-[0.03] rotate-12 group-hover:-rotate-12 group-hover:scale-125 group-hover:opacity-10 transition-all duration-700 group-hover:-translate-y-2" />
                    <div className="mt-8 flex justify-end relative z-10">
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:shadow-lg">
                             <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                        </div>
                     </div>
                </div>

                {/* 9. Trade In */}
                <div 
                    onClick={() => navigate('/contact')}
                    className="md:col-span-2 bg-[#1d1d1f] rounded-[32px] p-8 md:p-10 relative overflow-hidden cursor-pointer group shadow-xl hover:shadow-2xl transition-all duration-700 flex flex-row items-center justify-between border border-gray-800"
                >
                     {/* Shimmer sweep animation background */}
                     <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[50%] transition-transform duration-[1500ms] ease-in-out pointer-events-none" />
                     <div className="absolute right-0 top-0 w-80 h-80 bg-green-500/10 blur-[80px] rounded-full group-hover:bg-green-400/20 transition-colors duration-700" />

                     <div className="relative z-10 max-w-sm group-hover:translate-x-2 transition-transform duration-500">
                         <span className="inline-block px-3 py-1.5 rounded-lg bg-[#2997ff]/10 text-[#2997ff] font-bold tracking-widest uppercase text-xs mb-4 border border-[#2997ff]/20">Trade-In</span>
                        <h3 className="text-4xl font-bold text-white mt-1">Upgrade & Save.</h3>
                        <p className="text-gray-400 mt-3 text-base leading-relaxed font-medium">Exchange your current device for credit towards a new one. It's good for you and the planet.</p>
                     </div>
                     <div className="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:text-[#1d1d1f] transition-all duration-500 shadow-lg text-white">
                        <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
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
      <div className="max-w-[1400px] mx-auto px-6 mb-16 pt-20 relative">
        {/* 4. Subtle Background Glow */}
        <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
            <div className="space-y-8 max-w-2xl z-10">
                <div>
                   {/* 1. Hero Text Gradient */}
                   <h1 className="text-6xl md:text-[80px] font-bold tracking-tight leading-[1.1]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d1d1f] to-[#555555]">Store.</span>
                   </h1>
                   <p className="text-2xl md:text-3xl text-[#6e6e73] font-medium leading-tight mt-6">
                        The best way to buy the products you love.
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] to-[#42a1ec] font-semibold">Only at Ram Mobiles.</span>
                   </p>
                </div>
                
                {/* 2. Hero Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button onClick={() => navigate('/store')} className="px-8 py-4 rounded-full bg-[#1d1d1f] text-white font-semibold text-lg hover:bg-[#333336] hover:scale-105 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
                        Shop the Latest
                    </button>
                    <button onClick={() => navigate('/repair')} className="px-8 py-4 rounded-full bg-white text-[#1d1d1f] font-semibold text-lg border border-gray-200 hover:border-[#1d1d1f] hover:bg-gray-50 hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-sm">
                        Book a Repair <ChevronRight size={20} className="text-gray-400" />
                    </button>
                </div>
            </div>
            
            {/* 3. Hero Visual Depth */}
            <div className="hidden lg:block relative lg:w-[500px] lg:h-[400px] xl:w-[600px] xl:h-[500px] group cursor-pointer" onClick={() => navigate('/store')}>
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 -z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#f5f5f7] to-[#ffffff] border border-white rounded-3xl shadow-2xl overflow-hidden group-hover:-translate-y-4 transition-all duration-700">
                    {/* Inner animated blob */}
                    <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-100/50 rounded-full blur-[60px] group-hover:bg-indigo-100/50 transition-colors duration-700" />
                    <img 
                        src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708" 
                        alt="Featured Device" 
                        className="w-[120%] h-[120%] object-contain -rotate-6 translate-y-8 group-hover:rotate-0 group-hover:scale-105 group-hover:translate-y-4 transition-all duration-700 drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)]"
                    />
                </div>
            </div>

            {/* User Context Area (Mobile Only) */}
            <div className="hidden md:flex flex-col items-start md:items-end space-y-2 lg:hidden">
                <div className="flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=Support&background=random" className="w-10 h-10 rounded-full shadow-sm" alt="Specialist" />
                    <div className="text-sm">
                        <p className="text-[#1d1d1f] font-semibold">Need shopping help?</p>
                        <a href="/contact" className="text-[#0066cc] hover:underline font-medium">Ask a Specialist</a>
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
              className="flex flex-col items-center gap-4 min-w-[100px] cursor-pointer group snap-start"
            >
              {/* 10. Category Navigation Hover Glows */}
              <div className="relative w-24 h-24 rounded-[24px] bg-white border border-gray-100 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:border-blue-100 group-hover:bg-blue-50/50">
                 <div className="absolute inset-0 bg-blue-400/5 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl pointer-events-none" />
                 <div className="text-[#1d1d1f] opacity-80 group-hover:text-[#0071e3] group-hover:opacity-100 transition-colors duration-300 relative z-10 group-hover:scale-110 transform">
                    {cat.icon}
                 </div>
              </div>
              <span className="text-sm font-semibold text-gray-500 group-hover:text-[#1d1d1f] transition-colors duration-300 bg-white/50 px-3 py-1 rounded-full border border-transparent group-hover:border-gray-200">
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
