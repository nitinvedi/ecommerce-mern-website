import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  CheckCircle2, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Cpu, 
  Wrench, 
  Clock, 
  ShieldCheck, 
  Truck, 
  Star, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  MapPin,
  Loader2,
  HelpCircle,
  Plus,
  X,
  Check
} from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errorHandler.js";

import { API_ENDPOINTS, uploadFile } from "../config/api";
import { validate, validateForm } from "../utils/validation";

const GrainOverlay = () => (
  <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
);

// Icon fixes
function ZapIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>; }
function DropletsIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.8-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>; }

const SERVICE_TYPES = [
  { id: 'screen', value: 'Screen Damage', icon: Smartphone, title: 'Screen Replacement', price: '999', desc: 'Cracked or unresponsive screens.' },
  { id: 'battery', value: 'Battery', icon: ZapIcon, title: 'Battery Replacement', price: '799', desc: 'Draining fast or not charging.' }, 
  { id: 'water', value: 'Other', icon: DropletsIcon, title: 'Water Damage', price: '1499', desc: 'Liquid exposure cleaning & repair.' }, 
  { id: 'general', value: 'Other', icon: Cpu, title: 'General Diagnostics', price: '499', desc: 'Hardware or software issues.' },
];

const TESTIMONIALS = [
  { name: "Rahul S.", text: "Fastest repair I've ever had. My iPhone looks brand new.", rating: 5 },
  { name: "Priya M.", text: "Loved the home pickup service. Super convenient!", rating: 5 },
  { name: "Amit K.", text: "Transparent pricing and genuine parts. Highly recommended.", rating: 4.5 },
];

const FAQ_DATA = [
  { q: "How long does a repair take?", a: "Most standard repairs (screen/battery) are completed within 24 hours. Complex board issues may take 48-72 hours." },
  { q: "Do you use original parts?", a: "We use OEM-grade parts that adhere to the strictest quality standards. We offer a 6-month warranty on these parts." },
  { q: "Is my data safe?", a: "Yes. We follow strict data privacy protocols. However, we always recommend taking a backup before submitting your device." },
];

export default function Repair() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { scrollY } = useScroll();
  
  const [authModal, setAuthModal] = useState(false);
  const [bookingForm, setBookingForm] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Parallax
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  
  const [formData, setFormData] = useState({
    deviceType: "Mobile",
    brand: "",
    model: "",
    issue: "",
    problemDescription: "",
    fullName: user?.name || "",
    phoneNumber: user?.phone || "",
    pickupAddress: user?.address?.street || user?.address || "",
    city: user?.address?.city || "",
    pincode: user?.address?.zip || "",
    pickupDate: "",
    pickupTimeSlot: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleServiceSelect = (service) => {
    setFormData(prev => ({ 
      ...prev, 
      issue: service.value,
      // Pre-fill description for water damage to be specific since it maps to "Other"
      problemDescription: service.id === 'water' ? 'Water Damage Assessment' : prev.problemDescription
    }));
    setBookingForm(true);
    // Smooth scroll to form
    setTimeout(() => {
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const submit = async () => {
    if (!user) {
      toast.error("Please sign in to confirm booking");
      setAuthModal(true);
      return;
    }

    // 1. Validate Form
    const schema = {
        fullName: validate.name,
        phoneNumber: validate.phone,
        pickupAddress: (v) => validate.required(v, "Address"),
        city: (v) => validate.required(v, "City"),
        pincode: validate.pincode,
        deviceType: (v) => validate.required(v, "Device Type"),
        brand: (v) => validate.required(v, "Brand"),
        model: (v) => validate.required(v, "Model"),
        issue: (v) => validate.required(v, "Issue"),
        problemDescription: (v) => validate.required(v, "Description"),
    };

    const { isValid, errors: newErrors } = validateForm(formData, schema);
    setErrors(newErrors);

    if (!isValid) {
        console.log("Validation Errors:", newErrors);
        toast.error("Please fix the errors in the form: " + Object.keys(newErrors).join(", "));
        return;
    }

    // 10. SUCCESS CONFETTI
    const triggerConfetti = () => {
        const colors = ['#0071e3', '#34c759', '#ff3b30', '#ff9500'];
        [...Array(50)].forEach((_, i) => {
            const el = document.createElement('div');
            el.style.position = 'fixed';
            el.style.left = '50%';
            el.style.top = '50%';
            el.style.width = '10px';
            el.style.height = '10px';
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            el.style.borderRadius = '50%';
            el.style.pointerEvents = 'none';
            el.style.zIndex = '9999';
            document.body.appendChild(el);

            const angle = Math.random() * Math.PI * 2;
            const velocity = 5 + Math.random() * 10;
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity;

            el.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${dx * 50}px, ${dy * 50}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0, .9, .57, 1)',
            }).onfinish = () => el.remove();
        });
    };

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      await uploadFile(API_ENDPOINTS.REPAIRS.BASE, fd);
      triggerConfetti();
      toast.success("Booking confirmed! Tracking ID sent to your email.");
      // Keep form open but show success state or just step 2
      // Actually step 2 is "Ready to submit", maybe we need a success step?
      // Let's just close for now as per original logic but trigger confetti first
      // Or better, let's have a success modal state?
      // Original logic just closed it. Let's keep it simple but add confetti.
      setBookingForm(false);
      setStep(0);
      navigate("/dashboard");
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error(getErrorMessage(error, "Booking failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // 4. POPULAR MODELS
  const POPULAR_MODELS = ["iPhone 14", "iPhone 13", "iPhone 11", "Samsung S23", "OnePlus 11"];

  // 6. LIVE PRICE ESTIMATE
  const currentService = SERVICE_TYPES.find(s => s.value === formData.issue);
  const estimatedPrice = currentService ? currentService.price : "---";

  // 7. REAL-TIME VALIDATION HELPER
  const ValidIcon = ({ field }) => {
      // Very basic check: if field has value and no error
      if (formData[field] && formData[field].length > 2 && !errors[field]) {
          return <CheckCircle2 size={16} className="text-green-500 absolute right-4 top-1/2 -translate-y-1/2" />;
      }
      return null;
  };

  return (
    <div className="bg-[#F5F5F7] min-h-screen text-gray-900 font-sans selection:bg-black selection:text-white pb-24 md:pb-0">
      
      {/* 1. BREADCRUMBS */}
      <Breadcrumbs />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 max-w-[1400px] mx-auto overflow-hidden">
        <GrainOverlay />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
            <div className="flex-1 text-center lg:text-left">
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl md:text-[80px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.05] mb-6"
                >
                    Repair. <br/>
                    <span className="text-[#6e6e73]">Revive.</span> <span className="text-[#0071e3]">Reuse.</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl md:text-2xl text-[#6e6e73] font-medium max-w-2xl leading-relaxed mb-10 mx-auto lg:mx-0"
                >
                    Professional care for your favorite devices. <br className="hidden md:block" />
                     Genuine parts. Expert technicians. 6-Month Warranty.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                    <button 
                        onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 bg-[#0071e3] text-white rounded-full font-medium text-lg hover:bg-[#0077ed] transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95"
                    >
                        Book a Repair
                    </button>
                    <button 
                         onClick={() => navigate('/status/check')}
                         className="px-8 py-4 bg-white text-[#1d1d1f] border border-gray-200 rounded-full font-medium text-lg hover:bg-gray-50 transition-all active:scale-95"
                    >
                         Check Status
                    </button>
                </motion.div>
            </div>

            {/* Hero Visual */}
            <motion.div 
                 initial={{ opacity: 0, x: 50 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.3 }}
                 className="flex-1 w-full lg:max-w-[600px] h-[400px] md:h-[500px] bg-[#fbfbfd] rounded-[40px] relative overflow-hidden flex items-center justify-center shadow-2xl border border-white"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-indigo-50/50" />
                <div className="relative z-10 grid grid-cols-2 gap-4 p-8 w-full h-full">
                    <div className="space-y-4 pt-12">
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 animate-float-slow">
                             <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-600"><CheckCircle2 size={20} /></div>
                             <p className="font-bold text-sm">Genuine Parts</p>
                             <p className="text-xs text-gray-500">100% Authentic</p>
                        </div>
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 animate-float-delayed">
                             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-blue-600"><Clock size={20} /></div>
                             <p className="font-bold text-sm">Fast Service</p>
                             <p className="text-xs text-gray-500">Same Day Fix</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                         <div className="bg-[#1d1d1f] text-white p-4 rounded-3xl shadow-lg shadow-black/20 animate-float">
                             <Wrench size={24} className="mb-3 text-[#2997ff]" />
                             <p className="font-bold text-lg">Expert<br/>Service</p>
                        </div>
                        <img src="https://images.unsplash.com/photo-1597504879054-084090bc1f9b?auto=format&fit=crop&q=80&w=400" className="w-full h-32 object-cover rounded-3xl shadow-sm border border-white" alt="Repair" />
                    </div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* 2. PROCESS TIMELINE */}
      <section className="py-20 bg-white border-y border-gray-100">
         <div className="max-w-[1400px] mx-auto px-6">
            <div className="text-center mb-16">
                 <h2 className="text-3xl font-semibold text-[#1d1d1f]">How it works.</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { icon: Calendar, title: "Book Online", desc: "Select service & time." },
                 { icon: Truck, title: "We Pickup", desc: "Secure doorstep collection." },
                 { icon: Wrench, title: "Expert Fix", desc: "Repaired in 24-48 hrs." },
                 { icon: CheckCircle2, title: "Delivery", desc: "Delivered back to you." },
               ].map((step, i) => (
                 <div key={i} className="flex flex-col items-center text-center group">
                    <div className="w-16 h-16 rounded-3xl bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] mb-6 group-hover:bg-[#0071e3] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-500/30">
                       <step.icon size={28} />
                    </div>
                    <h3 className="font-semibold text-lg text-[#1d1d1f] mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 3. BENTO GRID SERVICES */}
      <section id="services" className="py-24 px-6 max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12">
            <div>
                 <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] mb-4">Select Service.</h2>
                 <p className="text-xl text-[#6e6e73]">Choose what you need fixed.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-auto md:h-[500px]">
             
             {/* 2. 3D TILT EFFECT CARDS using motion */}
             {/* 1. Screen Repair (Large) */}
             <motion.div 
               onClick={() => handleServiceSelect(SERVICE_TYPES[0])}
               whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
               className="md:col-span-2 md:row-span-2 bg-white rounded-[30px] p-10 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col justify-between"
             >
                <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-[#0071e3] text-xs font-bold uppercase tracking-wider rounded-full mb-4">Most Popular</span>
                    <h3 className="text-3xl font-semibold text-[#1d1d1f] mb-2">{SERVICE_TYPES[0].title}</h3>
                    <p className="text-gray-500 max-w-sm">{SERVICE_TYPES[0].desc}</p>
                </div>
                <div className="relative z-10 flex items-center justify-between mt-8">
                    <div>
                         <p className="text-xs text-gray-400 uppercase font-bold">From</p>
                         <p className="text-2xl font-bold text-[#1d1d1f]">₹{SERVICE_TYPES[0].price}</p>
                    </div>
                    <button className="w-12 h-12 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </button>
                </div>
                
                {/* Visuals */}
                <Smartphone className="absolute top-1/2 -right-12 w-64 h-64 text-gray-50 -translate-y-1/2 group-hover:-translate-x-4 transition-transform duration-700" strokeWidth={1} />
             </motion.div>

             {/* 2. Battery */}
             <motion.div 
               onClick={() => handleServiceSelect(SERVICE_TYPES[1])}
               whileHover={{ scale: 1.02, rotateX: 2 }}
               className="md:col-span-1 md:row-span-2 bg-black text-white rounded-[30px] p-8 relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-between"
             >
                 <div className="relative z-10">
                    <ZapIcon className="w-12 h-12 text-[#2997ff] mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">{SERVICE_TYPES[1].title}</h3>
                    <p className="text-gray-400 text-sm">{SERVICE_TYPES[1].desc}</p>
                 </div>
                 <div className="relative z-10 pt-8 border-t border-white/10">
                     <p className="text-2xl font-bold">₹{SERVICE_TYPES[1].price}</p>
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />
             </motion.div>

             {/* 3. Water Damage */}
             <motion.div 
               onClick={() => handleServiceSelect(SERVICE_TYPES[2])}
               whileHover={{ scale: 1.02, rotateY: 2 }}
               className="md:col-span-1 bg-blue-50 rounded-[30px] p-8 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-500 border border-blue-100"
             >
                 <div className="flex justify-between items-start mb-4">
                    <DropletsIcon className="w-10 h-10 text-blue-500" />
                    <span className="font-bold text-blue-900">₹{SERVICE_TYPES[2].price}</span>
                 </div>
                 <h3 className="font-semibold text-blue-900 mb-1">{SERVICE_TYPES[2].title}</h3>
                 <p className="text-blue-700/60 text-xs">Liquid exposure fix.</p>
             </motion.div>

             {/* 4. General Diag */}
             <motion.div 
               onClick={() => handleServiceSelect(SERVICE_TYPES[3])}
               whileHover={{ scale: 1.02 }}
               className="md:col-span-1 bg-white rounded-[30px] p-8 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-500 border border-gray-100"
             >
                 <div className="flex justify-between items-start mb-4">
                    <Cpu className="w-10 h-10 text-gray-400 group-hover:text-[#1d1d1f] transition-colors" />
                    <span className="font-bold text-[#1d1d1f]">₹{SERVICE_TYPES[3].price}</span>
                 </div>
                 <h3 className="font-semibold text-[#1d1d1f] mb-1">{SERVICE_TYPES[3].title}</h3>
                 <p className="text-gray-400 text-xs">Software & Hardware check.</p>
             </motion.div>

          </div>
      </section>

      {/* 4. BOOKING SECTION */}
      <AnimatePresence>
        {bookingForm && (
          <section id="booking-section" className="py-20 px-6 bg-white border-t border-gray-100">
             <div className="max-w-3xl mx-auto">
                <motion.div
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: "auto" }}
                   exit={{ opacity: 0, height: 0 }}
                   className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden"
                >
                     {/* 3. PROGRESS BAR */}
                     <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((step + 1) / 3) * 100}%` }}
                            className="h-full bg-[#0071e3]"
                         />
                     </div>
                     <button onClick={() => setBookingForm(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-20">
                         <X size={20} className="text-gray-500" />
                     </button>

                    <div className="p-8 md:p-12 bg-white text-[#1d1d1f] border-b border-gray-100 flex justify-between items-center">
                       <div>
                           <h2 className="text-2xl font-bold">Book Your Repair</h2>
                           <p className="text-gray-500 text-sm">Step {step + 1} of 3</p>
                       </div>
                       <div className="text-right hidden sm:block">
                           <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Estimated Total</p>
                           <p className="text-xl font-bold">₹{estimatedPrice}</p>
                       </div>
                    </div>
                    
                    <div className="p-8 md:p-12 max-h-[70vh] overflow-y-auto">
                       {step === 0 && (
                               <div className="space-y-4">
                                   <div className="space-y-1 relative">
                                       <label className="text-sm font-medium text-gray-500">Device Type</label>
                                       <select name="deviceType" value={formData.deviceType} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.deviceType ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-[#0071e3]/20 border border-gray-200'}`}>
                                          <option>Mobile</option>
                                          <option>Tablet</option>
                                          <option>Laptop</option>
                                       </select>
                                   </div>
                                   <div className="space-y-1 relative">
                                       <label className="text-sm font-medium text-gray-500">Brand</label>
                                       <input name="brand" placeholder="e.g. Apple" value={formData.brand} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.brand ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-[#0071e3]/20 border border-gray-200'}`} />
                                       <ValidIcon field="brand" />
                                       {errors.brand && <p className="text-red-500 text-xs">{errors.brand}</p>}
                                   </div>
                                   <div className="space-y-1 relative">
                                       <label className="text-sm font-medium text-gray-500">Model</label>
                                       <input name="model" placeholder="e.g. iPhone 14 Pro" value={formData.model} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.model ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-[#0071e3]/20 border border-gray-200'}`} />
                                       <ValidIcon field="model" />
                                       {errors.model && <p className="text-red-500 text-xs">{errors.model}</p>}
                                       
                                       {/* 5. POPULAR MODELS CHIPS */}
                                       <div className="flex flex-wrap gap-2 mt-2">
                                           {POPULAR_MODELS.map(model => (
                                               <button 
                                                   key={model}
                                                   onClick={() => setFormData({...formData, model, brand: model.split(" ")[0]})} 
                                                   className="px-3 py-1 bg-gray-100 hover:bg-[#0071e3] hover:text-white text-xs rounded-full transition-colors text-gray-600"
                                               >
                                                   {model}
                                               </button>
                                           ))}
                                       </div>
                                   </div>
                                   <div className="space-y-1 relative">
                                       <label className="text-sm font-medium text-gray-500">Issue Description</label>
                                       <input name="problemDescription" placeholder="Briefly describe the issue" value={formData.problemDescription} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.problemDescription ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-[#0071e3]/20 border border-gray-200'}`} />
                                       <ValidIcon field="problemDescription" />
                                       {errors.problemDescription && <p className="text-red-500 text-xs">{errors.problemDescription}</p>}
                                   </div>
                               </div>
                       )}

                       {step === 1 && (
                          <div className="space-y-6">
                             <h3 className="text-xl font-bold mb-6">Pickup Details</h3>
                             <div className="space-y-4">
                                <div className="space-y-1 relative">
                                    <input name="pickupAddress" placeholder="Full Address" value={formData.pickupAddress} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.pickupAddress ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-[#0071e3]/20 border border-gray-200'}`} />
                                    <ValidIcon field="pickupAddress" />
                                    {errors.pickupAddress && <p className="text-red-500 text-xs">{errors.pickupAddress}</p>}
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-1 relative">
                                        <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.city ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-[#0071e3]/20 border border-gray-200'}`} />
                                        <ValidIcon field="city" />
                                        {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-1 relative">
                                        <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.pincode ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-[#0071e3]/20 border border-gray-200'}`} />
                                        <ValidIcon field="pincode" />
                                        {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode}</p>}
                                    </div>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#0071e3]/20 border border-gray-200" />
                                    
                                    {/* 8. VISUAL TIME SLOTS */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Prefered Time</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {["Morning (9-12)", "Afternoon (12-4)", "Evening (4-8)"].map(slot => (
                                                <button
                                                    key={slot}
                                                    onClick={() => setFormData({...formData, pickupTimeSlot: slot})}
                                                    className={`p-3 rounded-lg text-sm font-medium transition-all text-left flex justify-between ${formData.pickupTimeSlot === slot ? 'bg-black text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    {slot}
                                                    {formData.pickupTimeSlot === slot && <Check size={16} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                             </div>
                          </div>
                       )}

                       {step === 2 && (
                          <div className="space-y-6 text-center">
                             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} className="text-green-600" />
                             </div>
                             <h3 className="text-2xl font-bold">Ready to submit?</h3>
                             <p className="text-gray-500 max-w-sm mx-auto">
                                We'll pick up your {formData.brand} {formData.model} from {formData.city} on {formData.pickupDate}.
                             </p>
                          </div>
                       )}

                      <div className="flex justify-between mt-12 pt-8 border-t border-gray-100 gap-4">
                         {step > 0 ? (
                            <button onClick={() => setStep(s => s - 1)} className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition">
                               Back
                            </button>
                         ) : (
                            <button onClick={() => setBookingForm(false)} className="px-8 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition">
                               Cancel
                            </button>
                         )}
                         
                         <button 
                            onClick={() => step < 2 ? setStep(s => s + 1) : submit()}
                            disabled={loading || (step === 0 && (!formData.brand || !formData.model))}
                            className="px-10 py-3 bg-black text-white rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                         >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {step < 2 ? "Next Step" : "Confirm Booking"}
                         </button>
                      </div>
                   </div>
                </motion.div>
             </div>
          </section>
        )}
      </AnimatePresence>

      {/* 5. TRUST & TESTIMONIALS */}
      <section className="py-32 px-6 bg-black text-white">
         <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-20 items-center">
               <div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Trusted by 10,000+ <br /> Happy Customers</h2>
                  <p className="text-gray-400 text-lg mb-10">We don't just fix devices; we restore peace of mind. Rated 4.8/5 on Google Reviews.</p>
                  
                  <div className="space-y-6">
                     {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur p-6 rounded-2xl border border-white/10">
                           <div className="flex gap-1 text-yellow-400 mb-3">
                              {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill={idx < Math.floor(t.rating) ? "currentColor" : "none"} />)}
                           </div>
                           <p className="mb-4 font-medium">"{t.text}"</p>
                           <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">— {t.name}</p>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 p-8 rounded-3xl text-center border border-white/10 hover:bg-white/10 transition">
                     <ShieldCheck size={40} className="mx-auto mb-4 text-green-400" />
                     <h3 className="font-bold text-xl mb-2">6 Months</h3>
                     <p className="text-sm text-gray-400">Warrenty on all repairs</p>
                  </div>
                  <div className="bg-white/5 p-8 rounded-3xl text-center border border-white/10 hover:bg-white/10 transition mt-12">
                     <Cpu size={40} className="mx-auto mb-4 text-blue-400" />
                     <h3 className="font-bold text-xl mb-2">OEM Parts</h3>
                     <p className="text-sm text-gray-400">100% Genuine Components</p>
                  </div>
                  <div className="bg-white/5 p-8 rounded-3xl text-center border border-white/10 hover:bg-white/10 transition">
                     <Truck size={40} className="mx-auto mb-4 text-purple-400" />
                     <h3 className="font-bold text-xl mb-2">Free Pickup</h3>
                     <p className="text-sm text-gray-400">Doorstep service included</p>
                  </div>
                  <div className="bg-white/5 p-8 rounded-3xl text-center border border-white/10 hover:bg-white/10 transition mt-12">
                     <Clock size={40} className="mx-auto mb-4 text-yellow-400" />
                     <h3 className="font-bold text-xl mb-2">24h Delivery</h3>
                     <p className="text-sm text-gray-400">Fast turnaround time</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-32 px-6 max-w-3xl mx-auto">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
         </div>
         <div className="space-y-4">
            {FAQ_DATA.map((item, i) => (
               <div key={i} className="border-b border-gray-100 pb-4">
                  <details className="group">
                     <summary className="flex justify-between items-center cursor-pointer list-none py-4 text-lg font-medium">
                        {item.q}
                        <span className="transition group-open:rotate-180">
                           <ChevronRight size={20} />
                        </span>
                     </summary>
                     <div className="text-gray-500 mt-2 leading-relaxed pb-4 animate-in slide-in-from-top-2 opacity-0 fade-in duration-300">
                        {item.a}
                     </div>
                  </details>
               </div>
            ))}
         </div>
      </section>

      {authModal && (
        <AuthModal 
          onClose={() => setAuthModal(false)} 
          onAuthSuccess={() => {
             setAuthModal(false);
             toast.success("Signed in successfully! Please confirm your booking now.");
          }}
        />
      )}
      {/* 3. STICKY MOBILE CTA */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 z-40">
           <button 
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-4 bg-[#0071e3] text-white rounded-xl font-bold shadow-lg"
           >
                Book Repair Now
           </button>
      </div>

      <Footer />
    </div>
  );
}
