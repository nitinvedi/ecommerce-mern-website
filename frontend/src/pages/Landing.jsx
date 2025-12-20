import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";
import SignIn from "../components/AuthModal.jsx";
import SignUp from "../components/SignUp";
import FeatureCards from "../components/FeatureCards";
import Footer from "../components/Footer";
import useAuth from "../hooks/useAuth.js";

const GrainOverlay = () => (
  <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
);

export default function Landing() {
  const [authModal, setAuthModal] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const openSignIn = () => {
    if (user) return navigate("/dashboard");
    setAuthModal("signin");
  };

  const openSignUp = () => {
    if (user) return navigate("/dashboard");
    setAuthModal("signup");
  };

  const closeAuth = () => setAuthModal(null);
  const switchToSignUp = () => setAuthModal("signup");
  const switchToSignIn = () => setAuthModal("signin");

  /* PARALLAX CONFIG */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for lag-free but organic feel
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transform values for different layers
  const badgeX = useTransform(smoothX, [-1, 1], [-20, 20]);
  const badgeY = useTransform(smoothY, [-1, 1], [-20, 20]);

  const headingX = useTransform(smoothX, [-1, 1], [-40, 40]);
  const headingY = useTransform(smoothY, [-1, 1], [-40, 40]);

  const textX = useTransform(smoothX, [-1, 1], [-15, 15]);
  const textY = useTransform(smoothY, [-1, 1], [-15, 15]);

  const btnX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const btnY = useTransform(smoothY, [-1, 1], [-10, 10]);

  const sliderX = useTransform(smoothX, [-1, 1], [-30, 30]);
  const sliderY = useTransform(smoothY, [-1, 1], [-30, 30]);

  const handleMouseMove = (e) => {
    // Normalize mouse position from -1 to 1
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
  };

  /* SLIDER */
  const images = ["image1.png", "image2.png", "image3.png"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const [activeFAQ, setActiveFAQ] = useState(null);

  return (
    <>
      <div 
        onMouseMove={handleMouseMove}
        className="landing min-h-screen flex flex-col items-center pt-28 overflow-hidden relative"
      >
        <GrainOverlay />
        
        {/* HERO */}
        <section className="relative flex flex-col items-center justify-center mt-4 md:mt-10 px-6 text-center max-w-5xl z-10">
          {/* BADGE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.4 }}
            style={{ x: badgeX, y: badgeY }}
            className="bg-white/70 backdrop-blur-sm border border-black/10 px-6 py-2 rounded-full text-gray-800 text-sm font-medium shadow-md"
          >
            Start using our Store ❤️
          </motion.div>

          {/* HEADING */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true, amount: 0.4 }}
            style={{ x: headingX, y: headingY }}
            className="heading-font text-gray-900 font-bold text-3xl sm:text-4xl md:text-5xl lg:text-7xl leading-[1.1] tracking-tight mt-6"
          >
            Effortless Phone Repairs,
            <br className="hidden sm:block" />
            Anywhere, Anytime.
          </motion.h1>

          {/* SUBTEXT */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            viewport={{ once: true, amount: 0.4 }}
            style={{ x: textX, y: textY }}
            className="text-gray-600 text-lg sm:text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed font-inter"
          >
            Transfer your broken device to experts—fast, safe, and tracked in real
            time.
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            viewport={{ once: true, amount: 0.4 }}
            style={{ x: btnX, y: btnY }}
            className="flex items-center gap-4 mt-10"
          >
            <button
              onClick={openSignUp}
              className="text-[16px] bg-black text-white font-medium px-8 py-3 rounded-full hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer"
            >
              Try Now →
            </button>

            <button className="shine-btn relative overflow-hidden flex items-center text-[16px] bg-white/80 backdrop-blur-md text-gray-900 border border-black/10 px-8 py-3 cursor-pointer rounded-full hover:bg-white hover:border-black/20 hover:shadow-lg transition-all duration-300">
              <span className="mx-1 font-medium">Become Pro</span>
            </button>
          </motion.div>
        </section>

        {/* SLIDER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="w-full flex justify-center mt-16 z-10"
        >
          <div
            className="relative w-[90%] md:w-[1000px] aspect-video overflow-hidden rounded-[40px] shadow-2xl border border-white/50 bg-white/50 backdrop-blur-xl"
            style={{ x: sliderX, y: sliderY }} // Not applying x/y here directly to inner div if previously applied to wrapper
          >
            {/* Inner content (image) */}
            <motion.div style={{ x: sliderX, y: sliderY }} className="absolute inset-0"> 
               <AnimatePresence mode="wait">
                  <motion.img
                    key={index}
                    src={images[index]}
                    alt="slider"
                    className="absolute w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                  />
               </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        <FeatureCards />

        {/* FAQ SECTION */}
        <section className="w-full max-w-4xl mx-auto px-6 mt-24 mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="heading-font text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-10"
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="space-y-4">
            {FAQ_DATA.map((item, i) => (
              <FAQItem
                key={i}
                question={item.q}
                answer={item.a}
                open={activeFAQ === i}
                onToggle={() =>
                  setActiveFAQ(activeFAQ === i ? null : i)
                }
              />
            ))}
          </div>

        </section>

        <Footer />

        {authModal === "signin" && (
          <div className="signup-modal fixed inset-0 z-99999">
            <SignIn onClose={closeAuth} onSwitchToSignUp={switchToSignUp} />
          </div>
        )}

        {authModal === "signup" && (
          <div className="signup-modal fixed inset-0 z-99999">
            <SignUp onClose={closeAuth} onSwitchToSignIn={switchToSignIn} />
          </div>
        )}
      </div>
    </>
  );
}

/* ================= FAQ ITEM ================= */

function FAQItem({ question, answer, open, onToggle }) {
  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.45, ease: "easeInOut" } }}
      className="bg-white/80 backdrop-blur-md border border-black/5 rounded-2xl shadow-sm hover:shadow-md hover:border-black/10 transition-all duration-300 overflow-hidden"
    >
      <motion.button
        onClick={onToggle}
        className="w-full flex justify-between items-center px-8 py-5 text-left"
      >
        <span className="font-medium text-gray-900 text-base sm:text-lg">
          {question}
        </span>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="text-gray-600 text-xl"
        >
          ▾
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{ originY: 0 }}
            className="px-6 pb-4 text-gray-600 text-sm sm:text-base leading-relaxed"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


/* ================= FAQ DATA ================= */

const FAQ_DATA = [
  {
    q: "Do you sell new or used devices?",
    a: "We offer a curated selection of premium refurbished and brand-new smartphones with warranty.",
  },
  {
    q: "How does the repair process work?",
    a: "Book online, we pick up your device, expert technicians fix it, and we deliver it back to you within 24-48h.",
  },
  {
    q: "Is there a warranty on products & repairs?",
    a: "Yes! 6-month warranty on repairs and up to 1-year warranty on refurbished devices.",
  },
  {
    q: "Can I track my order or repair?",
    a: "Absolutely. Use our real-time dashboard to track your package or repair status every step of the way.",
  },
  {
    q: "Do you offer accessories?",
    a: "Yes, we stock high-quality cases, chargers, and audio gear for all major brands.",
  },
];
