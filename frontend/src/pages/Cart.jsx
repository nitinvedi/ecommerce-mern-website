import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw
} from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import CheckoutProgress from "../components/CheckoutProgress";
 

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal
  } = useCart();

  const calculateTax = (subtotal) => subtotal * 0.18;
  const calculateShipping = (subtotal) => (subtotal > 5000 ? 0 : 100);

  const subtotal = getCartTotal();
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax + shipping;

  const freeShippingProgress = Math.min((subtotal / 5000) * 100, 100);

  /* ---------- Empty Cart ---------- */
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
             <ShoppingCart className="text-gray-300" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8 max-w-md">
            Looks like you haven't added anything yet. Discover our latest collections.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-300"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Cart ---------- */
  return (
    <div className="min-h-screen bg-[#F8FAFC]">


      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        
        {/* Progress Indicator */}
        <div className="mb-12">
           <CheckoutProgress currentStep={1} />
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* ================= LEFT CART LIST ================= */}
          <div className="flex-1 space-y-6">
             <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Your Cart <span className="text-gray-400 font-normal">({cartItems.length} items)</span></h1>
             </div>

             {/* Free Shipping Progress */}
             <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                <div className="flex items-center gap-3 relative z-10">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Truck size={20} />
                   </div>
                   <div className="flex-1">
                      {shipping === 0 ? (
                         <p className="text-sm font-bold text-gray-900">You've unlocked <span className="text-green-600">Free Shipping</span>!</p>
                      ) : (
                         <p className="text-sm text-gray-600">Add <span className="font-bold text-gray-900">₹{(5000 - subtotal).toLocaleString()}</span> more for Free Shipping</p>
                      )}
                   </div>
                </div>
                {/* Bar */}
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative z-10">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${freeShippingProgress}%` }}
                     transition={{ duration: 1 }}
                     className={`h-full rounded-full ${shipping === 0 ? 'bg-green-500' : 'bg-blue-600'}`}
                   />
                </div>
             </div>

             {/* Items */}
             <div className="space-y-4">
               <AnimatePresence>
                 {cartItems.map((item) => (
                   <motion.div
                     key={item._id}
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, height: 0 }}
                     className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-200 shadow-sm flex gap-6 transition-all"
                   >
                     {/* Image */}
                     <div className="w-28 h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 p-2 border border-gray-50">
                        <img
                           src={item.images?.[0]?.startsWith("http") ? item.images[0] : `http://localhost:5000${item.images?.[0]}`}
                           alt={item.name}
                           className="w-full h-full object-contain mix-blend-multiply"
                        />
                     </div>

                     {/* Details */}
                     <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start gap-4">
                           <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{item.brand || "Brand"}</p>
                              <h3 className="font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate(`/product/${item._id}`)}>
                                 {item.name}
                              </h3>
                           </div>
                           <p className="text-lg font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                           {/* Quantity Stepper */}
                           <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                              <button
                                 onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                 className="p-1 hover:bg-white rounded-md shadow-sm transition-all"
                              >
                                 <Minus size={14} className="text-gray-600" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                 onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                 className="p-1 hover:bg-white rounded-md shadow-sm transition-all"
                              >
                                 <Plus size={14} className="text-gray-600" />
                              </button>
                           </div>

                           <button
                              onClick={() => removeFromCart(item._id)}
                              className="text-gray-400 hover:text-red-500 text-sm font-medium flex items-center gap-1.5 transition-colors"
                           >
                              <Trash2 size={16} /> Remove
                           </button>
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
          </div>

          {/* ================= RIGHT SUMMARY ================= */}
          <div className="lg:w-[380px]">
             <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                   <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                   
                   <div className="space-y-4 text-sm">
                      <div className="flex justify-between text-gray-600">
                         <span>Subtotal</span>
                         <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                         <span className="flex items-center gap-1">Tax Estimate <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold">18%</span></span>
                         <span className="font-medium text-gray-900">₹{tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                         <span>Shipping</span>
                         <span className={shipping === 0 ? "text-green-600 font-bold" : "font-medium text-gray-900"}>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                         <span className="text-base font-semibold text-gray-900">Order Total</span>
                         <span className="text-2xl font-bold text-gray-900">₹{total.toLocaleString()}</span>
                      </div>
                   </div>

                   <button
                     onClick={() => navigate("/checkout")}
                     className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                   >
                     Checkout <ArrowRight size={18} />
                   </button>
                </div>

                {/* Trust Badges Simple */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                      <ShieldCheck className="text-gray-400" size={20} />
                      <div className="text-xs">
                         <p className="font-bold text-gray-900">Secure</p>
                         <p className="text-gray-500">Checkout</p>
                      </div>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                      <RotateCcw className="text-gray-400" size={20} />
                      <div className="text-xs">
                         <p className="font-bold text-gray-900">Easy</p>
                         <p className="text-gray-500">Returns</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
