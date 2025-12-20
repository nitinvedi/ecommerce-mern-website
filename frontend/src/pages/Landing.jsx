import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, Shield, Clock, TrendingUp, Zap, CheckCircle2 } from "lucide-react";
import SignIn from "../components/AuthModal.jsx";
import SignUp from "../components/SignUp";
import Footer from "../components/Footer";
import useAuth from "../hooks/useAuth.js";

// Reusing the grain texture from Store.jsx for consistency
const GrainOverlay = () => (
  <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
);

export default function Landing() {
  const [authModal, setAuthModal] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollY } = useScroll();

  // Parallax Values
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const openSignIn = () => { if (user) return navigate("/dashboard"); setAuthModal("signin"); };
  const openSignUp = () => { if (user) return navigate("/dashboard"); setAuthModal("signup"); };
  const closeAuth = () => setAuthModal(null);
  const switchToSignUp = () => setAuthModal("signup");
  const switchToSignIn = () => setAuthModal("signin");

  return (
    <div className="bg-[#F5F5F7] min-h-screen font-sans text-gray-900 selection:bg-black selection:text-white overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        <GrainOverlay />
        
        {/* Animated Background Blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-200/40 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-200/40 rounded-full blur-[100px] pointer-events-none animate-pulse delay-1000" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 border border-black/5 bg-white/50 backdrop-blur-md rounded-full mb-8 shadow-sm"
          >
             <span className="flex relative h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
             </span>
             <span className="text-xs font-bold uppercase tracking-widest text-gray-600">The Future of Repair</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] text-gray-900 mb-8"
          >
            Fix Your Tech. <br /> Without the Stress.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Professional repairs, verified technicians, and real-time tracking. 
            Experience the new standard for device care.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={openSignUp} className="px-10 py-4 bg-black text-white rounded-full font-bold text-sm tracking-widest hover:scale-105 transition-transform shadow-xl hover:shadow-2xl">
               Get Started
            </button>
            <button onClick={() => navigate('/')} className="px-10 py-4 bg-white text-black border border-gray-200 rounded-full font-bold text-sm tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2 group">
               Visit Store <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. BENTO GRID FEATURES */}
      <section className="relative py-32 px-6 max-w-[1400px] mx-auto z-10">
        <motion.div 
           initial={{ opacity: 0, y: 50 }} 
           whileInView={{ opacity: 1, y: 0 }} 
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.8 }}
           className="mb-20 text-center"
        >
           <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Everything you need.</h2>
           <p className="text-gray-500 text-lg">A complete ecosystem for your digital life.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
           {/* Card 1: Large Left */}
           <motion.div 
              whileHover={{ scale: 1.01 }}
              className="md:col-span-2 md:row-span-2 bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 relative overflow-hidden group"
           >
              <div className="relative z-10 max-w-md">
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                    <TrendingUp size={24} />
                 </div>
                 <h3 className="text-3xl font-bold mb-4">Real-Time Tracking</h3>
                 <p className="text-gray-500 leading-relaxed text-lg">Monitor your repair status every step of the way. From pickup to diagnostics, repair, and delivery back to your doorstep.</p>
              </div>
              {/* Abstract Visual */}
              <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-gray-50 rounded-tl-[100px] translate-y-20 translate-x-20 group-hover:translate-x-16 transition-transform duration-700">
                 {/* Visual representation could go here */}
                 <div className="w-full h-full flex flex-col gap-4 p-10 opacity-50">
                    <div className="w-full h-12 bg-white rounded-xl shadow-sm"></div>
                    <div className="w-2/3 h-12 bg-white rounded-xl shadow-sm"></div>
                    <div className="w-3/4 h-12 bg-white rounded-xl shadow-sm"></div>
                 </div>
              </div>
           </motion.div>

           {/* Card 2: Top Right */}
           <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-black text-white rounded-[40px] p-10 shadow-xl relative overflow-hidden group"
           >
              <div className="relative z-10">
                 <Shield size={32} className="mb-6 opacity-80" />
                 <h3 className="text-2xl font-bold mb-2">Verified Pros</h3>
                 <p className="text-gray-400">Every technician is vetted, background-checked, and expert-level.</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
           </motion.div>

           {/* Card 3: Bottom Right */}
           <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col justify-between group"
           >
              <div>
                 <Zap size={32} className="mb-6 text-yellow-500" />
                 <h3 className="text-2xl font-bold mb-2">Lightning Fast</h3>
                 <p className="text-gray-500">24-48 hour turnaround on most standard repairs.</p>
              </div>
           </motion.div>
        </div>
      </section>

      {/* 3. PREMIUM FAQ SECTION */}
      <section className="py-32 px-6 bg-white border-t border-gray-100">
         <div className="max-w-3xl mx-auto">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-center mb-16"
            >
               <h2 className="text-4xl font-bold tracking-tight mb-4">Common Questions</h2>
               <div className="w-12 h-1 bg-black mx-auto rounded-full" />
            </motion.div>

            <div className="space-y-4">
              {FAQ_DATA.map((item, i) => (
                <PremiumFAQItem key={i} question={item.q} answer={item.a} />
              ))}
            </div>
         </div>
      </section>

      {/* 4. FOOTER INTEGRATION */}
      <Footer />

      {/* 5. MODALS */}
      {authModal === "signin" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAuth} />
          <div className="relative z-10 w-full max-w-md">
             <SignIn onClose={closeAuth} onSwitchToSignUp={switchToSignUp} />
          </div>
        </div>
      )}
      {authModal === "signup" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAuth} />
          <div className="relative z-10 w-full max-w-md">
             <SignUp onClose={closeAuth} onSwitchToSignIn={switchToSignIn} />
          </div>
        </div>
      )}
    </div>
  );
}

// Minimalist Accordion Component
function PremiumFAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={false}
      onClick={() => setIsOpen(!isOpen)}
      className="cursor-pointer group"
    >
      <div className={`py-6 flex items-center justify-between border-b border-gray-100 transition-colors ${isOpen ? "border-gray-900" : ""}`}>
         <h3 className={`text-xl font-medium transition-colors ${isOpen ? "text-gray-900" : "text-gray-500 group-hover:text-gray-900"}`}>
            {question}
         </h3>
         <div className={`relative w-6 h-6 flex items-center justify-center transition-transform duration-300 ${isOpen ? "rotate-45" : "rotate-0"}`}>
            <span className="absolute w-full h-[2px] bg-black" />
            <span className="absolute h-full w-[2px] bg-black" />
         </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
             <p className="pt-4 pb-8 text-gray-500 leading-relaxed text-lg">
                {answer}
             </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const FAQ_DATA = [
  {
    q: "How does the repair process work?",
    a: "Booking is simple. Select your device, describe the issue, and choose a verified technician. They picked up your device, repair it, and return it within 24-48 hours.",
  },
  {
    q: "Is my data safe during repair?",
    a: "Absolutely. All our technicians are background-checked and sign strict confidentiality agreements. We facilitate a full data backup before any work begins.",
  },
  {
    q: "Do you offer a warranty?",
    a: "Every repair comes with a 6-month service warranty covering parts and labor. If the issue reoccurs, we fix it for free.",
  },
  {
    q: "Can I track the repair status?",
    a: "Yes. Our real-time dashboard lets you see exactly where your device is—from pickup to diagnostics, repair bench, and final delivery.",
  },
];
