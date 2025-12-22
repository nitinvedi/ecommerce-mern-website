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
  Plus
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
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

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      await uploadFile(API_ENDPOINTS.REPAIRS.BASE, fd);
      toast.success("Booking confirmed! Tracking ID sent to your email.");
      setBookingForm(false);
      setStep(0);
      navigate("/dashboard");
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error(error.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F5F7] min-h-screen text-gray-900 font-sans selection:bg-black selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <GrainOverlay />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-[#F5F5F7] z-0" />
        
        <motion.div style={{ y: heroY }} className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 border border-black/5 bg-white/60 backdrop-blur-md rounded-full mb-8 shadow-sm"
          >
            <Wrench size={14} className="text-black" />
            <span className="text-xs font-bold uppercase tracking-widest">Certified Repair Center</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8"
          >
            Revive Your <br /> Device.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Expert technicians, genuine parts, and door-to-door service. 
            The premium care your tech deserves.
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-black text-white rounded-full font-bold text-sm tracking-widest hover:scale-105 transition-transform shadow-xl"
          >
             Start a Repair
          </motion.button>
        </motion.div>
      </section>

      {/* 2. PROCESS TIMELINE */}
      <section className="py-20 px-6 bg-white border-y border-gray-100">
         <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative">
               {/* Connecting Line (Desktop) */}
               <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gray-200 -z-10 -translate-y-1/2" />
               
               {[
                 { icon: Calendar, title: "Book Online", desc: "Choose service & slot" },
                 { icon: Truck, title: "We Pickup", desc: "Safe doorstep collection" },
                 { icon: Wrench, title: "Expert Repair", desc: "Diagnosis & fix" },
                 { icon: CheckCircle2, title: "Delivered", desc: "Back to you in 24h" },
               ].map((step, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="flex flex-col items-center text-center bg-white p-4"
                 >
                    <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mb-4 shadow-lg shadow-black/20">
                       <step.icon size={28} />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 3. SERVICE GRID */}
      <section id="services" className="py-32 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Select Service</h2>
            <div className="w-12 h-1 bg-black mx-auto rounded-full" />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICE_TYPES.map((service, i) => (
               <motion.div
                  key={service.id}
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => handleServiceSelect(service)}
               >
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                     <service.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-500 text-sm mb-6 h-10">{service.desc}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                     <div>
                        <span className="text-xs text-gray-400 uppercase font-bold">Starts at</span>
                        <div className="text-lg font-bold">₹{service.price}</div>
                     </div>
                     <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:border-black group-hover:text-white transition-all">
                        <Plus size={18} />
                     </button>
                  </div>
               </motion.div>
            ))}
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
                   <div className="p-8 md:p-12 bg-black text-white text-center">
                      <h2 className="text-3xl font-bold mb-2">Book Your Repair</h2>
                      <p className="text-gray-400">Step {step + 1} of 3</p>
                   </div>
                   
                   <div className="p-8 md:p-12">
                      {step === 0 && (
                              <div className="space-y-4">
                                  <div className="space-y-1">
                                      <label className="text-sm font-medium text-gray-500">Device Type</label>
                                      <select name="deviceType" value={formData.deviceType} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.deviceType ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-black/10'}`}>
                                         <option>Mobile</option>
                                         <option>Tablet</option>
                                         <option>Laptop</option>
                                      </select>
                                      {errors.deviceType && <p className="text-red-500 text-xs">{errors.deviceType}</p>}
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-sm font-medium text-gray-500">Brand</label>
                                      <input name="brand" placeholder="e.g. Apple" value={formData.brand} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.brand ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-black/10'}`} />
                                      {errors.brand && <p className="text-red-500 text-xs">{errors.brand}</p>}
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-sm font-medium text-gray-500">Model</label>
                                      <input name="model" placeholder="e.g. iPhone 14 Pro" value={formData.model} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.model ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-black/10'}`} />
                                      {errors.model && <p className="text-red-500 text-xs">{errors.model}</p>}
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-sm font-medium text-gray-500">Issue Description</label>
                                      <input name="problemDescription" placeholder="Briefly describe the issue" value={formData.problemDescription} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.problemDescription ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-black/10'}`} />
                                      {errors.problemDescription && <p className="text-red-500 text-xs">{errors.problemDescription}</p>}
                                  </div>
                              </div>
                      )}

                      {step === 1 && (
                         <div className="space-y-6">
                            <h3 className="text-xl font-bold mb-6">Pickup Details</h3>
                            <div className="space-y-4">
                               <div className="space-y-1">
                                   <input name="pickupAddress" placeholder="Full Address" value={formData.pickupAddress} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.pickupAddress ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-black/10'}`} />
                                   {errors.pickupAddress && <p className="text-red-500 text-xs">{errors.pickupAddress}</p>}
                               </div>
                               <div className="grid md:grid-cols-2 gap-6">
                                   <div className="space-y-1">
                                       <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.city ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-black/10'}`} />
                                       {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                                   </div>
                                   <div className="space-y-1">
                                       <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} className={`w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ${errors.pincode ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-black/10'}`} />
                                       {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode}</p>}
                                   </div>
                               </div>
                               
                               <div className="grid md:grid-cols-2 gap-6">
                                   <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/10" />
                                   <select name="pickupTimeSlot" value={formData.pickupTimeSlot} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/10">
                                      <option value="">Select Time Slot</option>
                                      <option>Morning (9 AM - 12 PM)</option>
                                      <option>Afternoon (12 PM - 4 PM)</option>
                                      <option>Evening (4 PM - 8 PM)</option>
                                   </select>
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
      <Footer />
    </div>
  );
}
