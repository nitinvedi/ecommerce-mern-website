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

// --- COMPONENTS ---

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

const BentoGrid = () => {
    const navigate = useNavigate();
    return (
        <section className="py-12 max-w-[1400px] mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f] mb-8">
                Featured <span className="text-[#6e6e73]">Collections.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[500px]">
                {/* Large Card: Repair */}
                <div 
                    onClick={() => navigate('/repair')}
                    className="md:col-span-2 md:row-span-2 bg-black rounded-[24px] relative overflow-hidden group cursor-pointer text-white p-8 md:p-12 flex flex-col justify-end"
                >
                    <div className="relative z-10 transition-transform duration-500 group-hover:-translate-y-2">
                        <p className="text-[#2997ff] font-semibold mb-2">Service</p>
                        <h3 className="text-3xl md:text-4xl font-semibold mb-4">Professional Repairs.</h3>
                        <p className="text-gray-400 text-lg mb-6 max-w-sm">From cracked screens to battery replacements, we bring your device back to life.</p>
                        <button className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                            Book a Repair <ChevronRight size={16} />
                        </button>
                    </div>
                    {/* Abstract Tech Bg */}
                    <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-black to-black" />
                    <Wrench className="absolute top-8 right-8 text-gray-800 opacity-50 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-500" size={120} />
                </div>

                {/* Card 2: Refurbished */}
                <div 
                     onClick={() => navigate('/store?category=Mobile')}
                     className="bg-white border border-gray-100 rounded-[24px] p-8 relative overflow-hidden group cursor-pointer md:col-span-1"
                >
                    <div className="relative z-10 text-center flex flex-col h-full justify-between items-center">
                        <Smartphone size={64} className="text-[#1d1d1f] mb-4 group-hover:scale-110 transition-transform" />
                         <div>
                            <h3 className="text-xl font-semibold text-[#1d1d1f]">Refurbished</h3>
                            <p className="text-gray-500 text-sm mt-1">Like new. For less.</p>
                         </div>
                    </div>
                </div>

                {/* Card 3: Accessories */}
                <div 
                    onClick={() => navigate('/store?category=Accessories')}
                     className="bg-[#f5f5f7] rounded-[24px] p-8 relative overflow-hidden group cursor-pointer md:col-span-1"
                >
                    <div className="relative z-10 text-center flex flex-col h-full justify-between items-center">
                        <Headphones size={64} className="text-[#1d1d1f] mb-4 group-hover:scale-110 transition-transform" />
                         <div>
                            <h3 className="text-xl font-semibold text-[#1d1d1f]">Accessories</h3>
                            <p className="text-gray-500 text-sm mt-1">Sound & Power.</p>
                         </div>
                    </div>
                </div>

                {/* Card 4: Sell/Trade (Wide) */}
                <div 
                    onClick={() => navigate('/contact')}
                    className="md:col-span-2 bg-[#1d1d1f] rounded-[24px] p-8 relative overflow-hidden group cursor-pointer text-white flex items-center justify-between"
                >
                     <div className="relative z-10 max-w-xs">
                        <h3 className="text-2xl font-semibold mb-2">Sell Your Device.</h3>
                        <p className="text-gray-400 text-sm">Get instant cash for your old gadgets. Simple and fast.</p>
                     </div>
                     <Package size={80} className="text-[#2997ff] opacity-80 group-hover:scale-105 transition-transform" />
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
                    <h2 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] mb-4">Why Ram Mobile?</h2>
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
    const reviews = [
        { name: "Aditya R.", role: "Student", text: "Fixed my iPhone screen in 20 minutes! Saved me from buying a new one.", rating: 5 },
        { name: "Priya S.", role: "Designer", text: "The refurbished MacBook I bought works perfectly. Highly recommend.", rating: 5 },
        { name: "Rahul K.", role: "Engineer", text: "Authentic accessories and great advice from the staff. My go-to tech shop.", rating: 4 },
        { name: "Neha M.", role: "Freelancer", text: "Super quick battery replacement. Phone feels brand new again.", rating: 5 },
    ];

    return (
        <section className="py-16 bg-[#f5f5f7] overflow-hidden">
             <div className="max-w-[1400px] mx-auto px-6 mb-10">
                <h2 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f]">
                    Loved by <span className="text-[#6e6e73]">Locals.</span>
                </h2>
            </div>
            <div className="flex gap-6 overflow-x-auto px-6 pb-8 hide-scrollbar snap-x snap-mandatory">
                 <div className="min-w-[max(0px,calc(50vw-700px-1.5rem))]" />
                 {reviews.map((r, i) => (
                     <div key={i} className="snap-center shrink-0 w-[300px] bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
                         <div className="flex gap-1 mb-4">
                             {[...Array(5)].map((_, starI) => (
                                 <Star key={starI} size={16} className={`${starI < r.rating ? "fill-[#ffa500] text-[#ffa500]" : "text-gray-300"}`} />
                             ))}
                         </div>
                         <p className="text-[#1d1d1f] font-medium text-lg leading-relaxed mb-6">"{r.text}"</p>
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
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
        </section>
    )
}

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

const Footer = () => {
    return (
        <footer className="bg-[#1d1d1f] text-white pt-20 pb-10">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-gray-800 pb-16">
                    {/* Newsletter */}
                    <div className="md:col-span-1">
                        <h3 className="text-2xl font-semibold mb-6">Stay in the loop.</h3>
                        <p className="text-gray-400 mb-6 text-sm">Get the latest tech news and exclusive offers delivered to your inbox.</p>
                        <div className="flex gap-2">
                             <input type="email" placeholder="Email address" className="bg-white/10 border-none rounded-lg px-4 py-3 w-full text-sm focus:ring-1 focus:ring-[#2997ff]" />
                             <button className="bg-[#2997ff] text-white px-4 py-3 rounded-lg hover:bg-[#0077ed] transition-colors"><ArrowRight size={18} /></button>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-gray-100 mb-6">Shop</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="/store?category=Mobile" className="hover:text-[#2997ff]">Mobiles</a></li>
                            <li><a href="/store?category=Laptop" className="hover:text-[#2997ff]">Laptops</a></li>
                            <li><a href="/store?category=Accessories" className="hover:text-[#2997ff]">Accessories</a></li>
                            <li><a href="/store?category=Tablet" className="hover:text-[#2997ff]">Tablets</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-100 mb-6">Services</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="/repair" className="hover:text-[#2997ff]">Book a Repair</a></li>
                            <li><a href="/status" className="hover:text-[#2997ff]">Check Status</a></li>
                            <li><a href="/contact" className="hover:text-[#2997ff]">Sell Device</a></li>
                            <li><a href="/contact" className="hover:text-[#2997ff]">Business Support</a></li>
                        </ul>
                    </div>
                    <div>
                         <h4 className="font-semibold text-gray-100 mb-6">Account</h4>
                         <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="/dashboard" className="hover:text-[#2997ff]">Manage Orders</a></li>
                            <li><a href="/profile" className="hover:text-[#2997ff]">Profile</a></li>
                            <li><a href="/addresses" className="hover:text-[#2997ff]">Addresses</a></li>
                            <li><a href="/contact" className="hover:text-[#2997ff]">Help</a></li>
                         </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
                    <p>Copyright © {new Date().getFullYear()} Ram Mobile Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Use</a>
                        <a href="#" className="hover:text-white">Sales Policy</a>
                        <a href="#" className="hover:text-white">Legal</a>
                        <a href="#" className="hover:text-white">Site Map</a>
                    </div>
                </div>
            </div>
        </footer>
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
        <title>Store | Ram Mobile - Best Tech Deals</title>
        <meta name="description" content="Shop the latest smartphones, laptops, and accessories at Ram Mobile. Expert repair services and genuine parts available." />
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
                        Get <span className="text-[#2997ff]">₹500 OFF</span> on your first repair booking. Use code <span className="font-bold">FIXITNOW</span>.
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
                        <span className="text-[#1d1d1f] font-medium">Only at Ram Mobile.</span>
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
