import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  ShieldCheck,
  Truck,
  RotateCcw
} from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import CheckoutProgress from "../components/CheckoutProgress";
import { SOCKET_URL } from "../config/api.js";

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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-6">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
             <ShoppingCart size={32} className="text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Your Bag is Empty</h2>
          <p className="text-gray-500 max-w-md mb-8">
            Looks like you haven't added anything yet. Discover our latest collections and find something you love.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-black text-white rounded-full font-medium shadow-lg hover:bg-gray-900 transition-colors"
          >
            Start Shopping
          </button>
      </div>
    );
  }

  /* ---------- Cart ---------- */
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      <main className="max-w-[1400px] mx-auto px-6 pt-24 pb-20">
        
        <div className="mb-12">
           <CheckoutProgress currentStep={1} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          
          {/* ================= LEFT CART LIST ================= */}
          <div className="lg:col-span-2 space-y-8">
             <header className="flex items-baseline justify-between border-b border-gray-100 pb-6">
                <h1 className="text-3xl font-bold tracking-tight">Shopping Bag</h1>
                <span className="text-gray-500 font-medium">{cartItems.length} items</span>
             </header>

             {/* Free Shipping Progress */}
             <div className="bg-[#F5F5F7] p-5 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-full text-black">
                      <Truck size={18} />
                   </div>
                   <div className="flex-1 text-sm">
                      {shipping === 0 ? (
                         <p className="font-medium">You've unlocked <span className="font-bold">Free Express Shipping</span>!</p>
                      ) : (
                         <p>Add <span className="font-bold">₹{(5000 - subtotal).toLocaleString()}</span> more for Free Shipping</p>
                      )}
                   </div>
                </div>
                {/* Bar */}
                <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${freeShippingProgress}%` }}
                     transition={{ duration: 1 }}
                     className="h-full bg-black rounded-full"
                   />
                </div>
             </div>

             {/* Items */}
             <div className="space-y-8">
               <AnimatePresence>
                 {cartItems.map((item) => (
                   <motion.div
                     key={item._id}
                     layout
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, height: 0 }}
                     className="flex gap-6 group"
                   >
                     {/* Image */}
                     <div className="w-20 h-20 md:w-32 md:h-32 bg-[#F5F5F7] rounded-xl flex-shrink-0 p-2 md:p-4 cursor-pointer" onClick={() => navigate(`/product/${item._id}`)}>
                        <img
                           src={item.images?.[0]?.startsWith("http") ? item.images[0] : `${SOCKET_URL}${item.images?.[0]}`}
                           alt={item.name}
                           className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                        />
                     </div>

                     {/* Details */}
                     <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start gap-4">
                           <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{item.brand}</p>
                              <h3 className="font-bold text-lg leading-tight cursor-pointer hover:underline" onClick={() => navigate(`/product/${item._id}`)}>
                                 {item.name}
                              </h3>
                           </div>
                           <p className="text-lg font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                           {/* Quantity Stepper */}
                           <div className="flex items-center gap-4">
                               <div className="flex items-center border border-gray-200 rounded-full h-10 px-1">
                                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors">
                                     <Minus size={14} />
                                  </button>
                                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors">
                                     <Plus size={14} />
                                  </button>
                               </div>
                               <button onClick={() => removeFromCart(item._id)} className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors underline underline-offset-4">
                                   Remove
                               </button>
                           </div>
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
          </div>

          {/* ================= RIGHT SUMMARY ================= */}
          <div className="lg:col-span-1">
             <div className="sticky top-28">
                <div className="bg-[#F5F5F7] rounded-[24px] p-8">
                   <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                   
                   <div className="space-y-4 text-sm pb-6 border-b border-black/5">
                      <div className="flex justify-between">
                         <span className="text-gray-600">Subtotal</span>
                         <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-600">Estimate Tax (18%)</span>
                         <span className="font-semibold">₹{tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-600">Shipping</span>
                         <span className={shipping === 0 ? "text-green-600 font-bold" : "font-semibold"}>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                      </div>
                   </div>
                   
                   <div className="flex justify-between items-center py-6">
                       <span className="text-lg font-bold">Total</span>
                       <span className="text-2xl font-bold">₹{total.toLocaleString()}</span>
                   </div>

                   <button
                     onClick={() => navigate("/checkout")}
                     className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm tracking-wide hover:scale-[1.02] transition-transform shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                   >
                     Checkout <ArrowRight size={18} />
                   </button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl">
                      <ShieldCheck className="text-gray-400" size={20} />
                      <div className="text-xs font-medium">
                         <div className="font-bold text-gray-900">Secure</div>
                         <div className="text-gray-500">Checkout</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl">
                      <RotateCcw className="text-gray-400" size={20} />
                      <div className="text-xs font-medium">
                         <div className="font-bold text-gray-900">Easy</div>
                         <div className="text-gray-500">Returns</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>

      {/* Mobile Floating Checkout */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
         <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 font-medium">Total</span>
            <span className="text-2xl font-bold">₹{total.toLocaleString()}</span>
         </div>
         <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-black text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
         >
            Checkout <ArrowRight size={18} />
         </button>
      </div>
    </div>
  );
}
