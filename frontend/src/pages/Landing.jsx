import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Wrench, ShoppingBag, Truck, ShieldCheck, Zap } from "lucide-react";
import Footer from "../components/Footer";
import "../styles/landing.css"; // Ensure this still works or add custom styles in index.css

// ANIMATIONS
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#DFFF00] selection:text-black pt-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 md:px-8 text-center max-w-[1400px] mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-6">
             <span className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest">
               India's No.1
             </span>
          </motion.div>

          {/* Massive Heading */}
          <motion.h1 variants={fadeInUp} className="font-serif italic font-black text-4xl sm:text-7xl md:text-8xl lg:text-[7rem] leading-none md:leading-[0.9] tracking-tighter uppercase mb-8 text-black">
            The First <span className="text-stroke-black text-transparent">Premium</span><br/>
            Mobile Network
          </motion.h1>

          <motion.p variants={fadeInUp} className="max-w-xl text-lg md:text-xl text-gray-500 font-medium mb-10 leading-relaxed font-sans">
            Your one-stop partner for repairs, refurbished devices, and premium accessories. 
            All tracked in real-time.
          </motion.p>

          {/* CTA & QR */}
          <motion.div variants={fadeInUp} className="relative">
             <div className="bg-[#DFFF00] p-4 rounded-xl rotate-3 hover:rotate-0 transition-transform duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black cursor-pointer group">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://ecommerce-mern-website-1.onrender.com" 
                  alt="QR Code" 
                  className="w-24 h-24 mix-blend-multiply group-hover:scale-105 transition-transform"
                />
                <div className="mt-2 text-xs font-bold font-mono tracking-tighter text-center uppercase">
                   Scan to Explore
                </div>
             </div>
          </motion.div>
        </motion.div>
      </section>


      {/* 2. CHOOSE YOUR PLAN (BENTO GRID) */}
      <section className="px-4 md:px-8 py-12 md:py-20 max-w-[1400px] mx-auto">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
         >
            <h2 className="font-serif italic font-black text-5xl md:text-7xl uppercase tracking-tighter">
               Choose Your Path
            </h2>
            <div className="hidden md:block text-right">
               <p className="font-mono text-sm uppercase tracking-widest text-gray-500">Service Request</p>
               <p className="font-bold text-xl">001 — 2025</p>
            </div>
         </motion.div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARD 1: REPAIR (Purple) */}
            <motion.div 
               whileHover={{ y: -10 }}
               className="bg-[#F3E8FF] rounded-[2.5rem] p-6 md:p-8 border-2 border-transparent hover:border-black transition-all flex flex-col justify-between min-h-[340px] md:min-h-[400px] group cursor-pointer"
               onClick={() => navigate('/repair')}
            >
               <div>
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mb-6 text-purple-900">
                     <Wrench size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-black text-3xl uppercase mb-4 leading-none">Instant Repair</h3>
                  <ul className="space-y-3 font-medium text-gray-700 font-sans">
                     <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-black rounded-full"/> Doorstep Pickup</li>
                     <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-black rounded-full"/> Expert Technicians</li>
                     <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-black rounded-full"/> 6-Month Warranty</li>
                  </ul>
               </div>
               <button className="flex items-center justify-between w-full bg-black text-white px-6 py-4 rounded-full font-bold uppercase tracking-wider mt-8 group-hover:bg-[#DFFF00] group-hover:text-black transition-colors">
                  Book Repair <ArrowUpRight size={20} />
               </button>
            </motion.div>

            {/* CARD 2: STORE (Neon) - FEATURED */}
            <motion.div 
               whileHover={{ y: -10 }}
               className="md:-mt-12 bg-[#DFFF00] rounded-[2.5rem] p-8 border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[440px] group cursor-pointer relative overflow-hidden"
               onClick={() => navigate('/')}
            >  
               <div className="absolute top-6 right-6 font-mono text-xs font-bold uppercase border border-black px-2 py-1 rounded-full bg-white">
                  Most Popular
               </div>
               <div>
                  <div className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center mb-6 text-black border border-black">
                     <ShoppingBag size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-black text-3xl uppercase mb-4 leading-none">Premium Store</h3>
                  <ul className="space-y-3 font-bold text-black font-sans">
                     <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"/> Refurbished iPhones</li>
                     <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"/> Flagship Androids</li>
                     <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"/> Luxury Accessories</li>
                  </ul>
               </div>
               <button className="flex items-center justify-between w-full bg-black text-white px-6 py-4 rounded-full font-bold uppercase tracking-wider mt-8 group-hover:scale-105 transition-transform">
                  Shop Now <ArrowUpRight size={20} />
               </button>
            </motion.div>

            {/* CARD 3: SELL (Blue) */}
            <motion.div 
               whileHover={{ y: -10 }}
               className="bg-[#E0F2FE] rounded-[2.5rem] p-8 border-2 border-transparent hover:border-black transition-all flex flex-col justify-between min-h-[400px] group cursor-pointer"
               onClick={() => navigate('/contact')}
            >
               <div>
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mb-6 text-blue-900">
                     <Zap size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-black text-3xl uppercase mb-4 leading-none">Sell Device</h3>
                  <ul className="space-y-3 font-medium text-gray-700 font-sans">
                     <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-black rounded-full"/> Instant Cash</li>
                     <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-black rounded-full"/> Best Market Value</li>
                     <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-black rounded-full"/> Free Pickup</li>
                  </ul>
               </div>
               <button className="flex items-center justify-between w-full bg-black text-white px-6 py-4 rounded-full font-bold uppercase tracking-wider mt-8 group-hover:bg-[#DFFF00] group-hover:text-black transition-colors">
                  Get Quote <ArrowUpRight size={20} />
               </button>
            </motion.div>

         </div>
      </section>

      
      {/* 3. FAIR PRICES BANNER */}
      <section className="px-4 md:px-8 pb-20 max-w-[1400px] mx-auto">
         <div className="bg-sky-400 rounded-[3rem] p-8 md:p-16 text-center border-2 border-black shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"/>
            <div className="relative z-10">
               <h2 className="font-black text-4xl md:text-6xl text-white uppercase drop-shadow-md mb-8">
                  Fair Prices. No Hidden Fees.
               </h2>
               
               <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                  <div className="bg-white px-8 py-4 rounded-full font-bold text-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                     Free Diagnosis
                  </div>
                  <div className="hidden md:block text-white font-black text-2xl">→</div>
                  <div className="bg-white px-8 py-4 rounded-full font-bold text-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                     Transparent Quote
                  </div>
                  <div className="hidden md:block text-white font-black text-2xl">→</div>
                  <div className="bg-black text-[#DFFF00] px-8 py-4 rounded-full font-bold text-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                     No Fix, No Fee
                  </div>
               </div>
            </div>
         </div>
      </section>

      
      {/* 4. STAYING ONLINE (WIDE CARDS) */}
      <section className="px-4 md:px-8 pb-24 max-w-[1400px] mx-auto space-y-6">
         <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-serif italic font-black text-4xl md:text-6xl text-center uppercase mb-16"
         >
            Staying Online, Made Easy
         </motion.h2>

         {/* Wide Card 1 */}
         <div className="bg-[#dafbe1] rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-black/5 hover:border-black transition-all">
            <div className="flex-1 space-y-6">
               <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-green-800">
                  <ShieldCheck size={24} />
               </div>
               <h3 className="font-black text-3xl md:text-5xl uppercase leading-[0.9]">
                  Real, Fast Warranties. <br/>You Decide.
               </h3>
               <p className="text-lg font-medium text-gray-700 max-w-md font-sans">
                  We stand by our work. All repairs come with a standard 6-month warranty. Upgrade to Pro for lifetime coverage.
               </p>
            </div>
            <div className="flex-1 w-full max-w-sm">
               <div className="bg-black rounded-[2rem] p-6 text-white aspect-[4/5] flex flex-col justify-center items-center text-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  <ShieldCheck size={64} className="text-[#DFFF00] mb-4" />
                  <h4 className="font-bold text-2xl mb-2">Ram Care+</h4>
                  <p className="opacity-70">Extended Protection Plan</p>
                  <div className="mt-8 text-4xl font-black">₹999<span className="text-sm font-normal text-gray-400">/yr</span></div>
               </div>
            </div>
         </div>

         {/* Wide Card 2 */}
         <div className="bg-[#fdf4ff] rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row-reverse items-center gap-8 border border-black/5 hover:border-black transition-all">
            <div className="flex-1 space-y-6">
               <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center text-pink-800">
                  <Truck size={24} />
               </div>
               <h3 className="font-black text-3xl md:text-5xl uppercase leading-[0.9]">
                  One Shop, <br/>Every Zip Code.
               </h3>
               <p className="text-lg font-medium text-gray-700 max-w-md font-sans">
                  Whether you're in the city or the suburbs, our logistics network ensures your device reaches us safely and returns faster.
               </p>
            </div>
            <div className="flex-1 w-full max-w-sm relative">
               <img 
                  src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=1000&auto=format&fit=crop" 
                  alt="Delivery" 
                  className="rounded-[2rem] shadow-2xl object-cover w-full aspect-square -rotate-2 hover:rotate-0 transition-transform duration-500 border-4 border-white"
               />
            </div>
         </div>

      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
