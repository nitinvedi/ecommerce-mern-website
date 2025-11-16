import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SignInButton from "./SignInButton";

export default function Navbar({ openSignUp }) {
  const [showBanner, setShowBanner] = useState(true);
  const [textIndex, setTextIndex] = useState(0);

  // Text Messages for the Banner
  const messages = [
    "🔧 Get your device repaired with 100% trusted experts",
    "⚡ Fastest doorstep pickup & delivery",
    "💰 Best prices guaranteed for all repairs"
  ];

  // Change text every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Green Banner */}
      {showBanner && (
        <div className="relative w-full bg-green-500 text-black font-semibold text-center py-2 text-[13px] sm:text-[13px] overflow-hidden">

          {/* Animated Changing Text */}
          <div className="h-[20px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={textIndex}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute w-full"
              >
                {messages[textIndex]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-3 top-1 text-black text-xl font-bold hover:text-gray-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav className="top-0 left-0 w-full flex items-start justify-between px-10 py-5 bg-black/90 backdrop-blur-sm z-50">

        <div className="text-white font-bold text-xl">PhoneSphere</div>

        <div className="hidden md:flex space-x-10 text-white font-medium items-start">
          <a className="hover:text-gray-300" href="#store">Store</a>
          <a className="hover:text-gray-300" href="#features">Features</a>
          <a className="hover:text-gray-300" href="#service">Service</a>
          <a className="hover:text-gray-300" href="#support">Support</a>
          <a className="hover:text-gray-300" href="#faq">FAQ</a>
        </div>

        <SignInButton onClick={openSignUp} />
      </nav>
    </>
  );
}
