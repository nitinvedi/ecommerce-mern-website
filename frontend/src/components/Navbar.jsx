import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SignInButton from "./SignInButton";

export default function Navbar({ openSignUp }) {
  const [showBanner, setShowBanner] = useState(true);
  const [textIndex, setTextIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const messages = [
    "🔧 Get your device repaired with 100% trusted experts",
    "⚡ Fastest doorstep pickup & delivery",
    "💰 Best prices guaranteed for all repairs",
  ];

  // Auto-hide after X seconds (8 sec example)
  useEffect(() => {
    if (!showBanner) return;

    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 8000); // <-- CHANGE TO CONTROL AUTO-HIDE TIME

    return () => clearTimeout(timer);
  }, [showBanner]);

  // Manual close
  const closeBanner = () => {
    setShowBanner(false);
  };

  // Rotating banner text
  useEffect(() => {
    const interval = setInterval(
      () => setTextIndex((prev) => (prev + 1) % messages.length),
      4000
    );
    return () => clearInterval(interval);
  }, []);

  // Shrink navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ========================= BANNER ========================= */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            key="banner"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}    // SLIDE UP CLOSE
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="
              w-full fixed top-0 left-0
              bg-teal-500 text-black font-semibold
              text-[15px] flex items-center justify-center
              h-8 z-9999
            "
          >
            <div className="relative w-full text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={textIndex}
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {messages[textIndex]}
                </motion.div>
              </AnimatePresence>

              <button
                onClick={closeBanner}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black text-lg font-bold"
              >
                ×
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================= NAVBAR ========================= */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="
          fixed left-0 w-full
          flex items-center justify-between
          px-8 md:px-12
          z-9998
          transition-all duration-300
        "
        style={{
          top: showBanner ? "32px" : "0px",
          backgroundColor: scrolled
            ? "rgba(0,0,0,0.25)"
            : "rgba(0,0,0,0.50)",
          backdropFilter: scrolled ? "blur(14px)" : "blur(4px)",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "blur(4px)",
          height: scrolled ? "50px" : "88px",
          borderBottom: scrolled
            ? "1px dotted rgba(255,255,255,0.08)"
            : "1px dotted transparent",
        }}
      >
        <motion.div
          animate={{ scale: scrolled ? 0.95 : 1 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-between w-full"
        >
          {/* Logo */}
          <motion.div
            animate={{ scale: scrolled ? 0.88 : 1 }}
            transition={{ duration: 0.25 }}
            className="
              text-transparent bg-clip-text
              bg-linear-to-r from-white to-gray-400
              font-extrabold text-2xl tracking-wide
            "
          >
            Maramat
          </motion.div>

          {/* Links */}
          <div className="hidden md:flex space-x-10 text-white font-medium">
            {["Store", "Features", "Service", "Support", "FAQ"].map((text) => (
              <motion.a
                key={text}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ opacity: 0.8 }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer"
                href={`#${text.toLowerCase()}`}
              >
                {text}
              </motion.a>
            ))}
          </div>

          {/* Sign In */}
          <motion.div
            animate={{ scale: scrolled ? 0.92 : 1 }}
            transition={{ duration: 0.25 }}
          >
            <SignInButton onClick={openSignUp} />
          </motion.div>
        </motion.div>
      </motion.nav>
    </>
  );
}
