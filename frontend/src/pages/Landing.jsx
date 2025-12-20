import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";
import SignIn from "../components/AuthModal.jsx";
import SignUp from "../components/SignUp";
import FeatureCards from "../components/FeatureCards";
import Footer from "../components/Footer";
import useAuth from "../hooks/useAuth.js";

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

  /* PARALLAX */
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

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
      <div className="landing min-h-screen flex flex-col items-center pt-28">
        {/* HERO */}
        <section className="relative flex flex-col items-center justify-center mt-4 md:mt-10 px-6 text-center max-w-5xl">
          {/* BADGE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.4 }}
            style={{ transform: `translate(${mouse.x * 4}px, ${mouse.y * 3}px)` }}
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
            style={{ transform: `translate(${mouse.x * 8}px, ${mouse.y * 6}px)` }}
            className="heading-font text-gray-900 font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15] mt-6"
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
            style={{ transform: `translate(${mouse.x * 5}px, ${mouse.y * 4}px)` }}
            className="text-gray-600 text-base sm:text-[10px] md:text-[15px] mt-4 max-w-2xl mx-auto leading-relaxed font-inter"
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
            style={{ transform: `translate(${mouse.x * 12}px, ${mouse.y * 10}px)` }}
            className="flex items-center gap-4 mt-8"
          >
            <button
              onClick={openSignUp}
              className="text-[15px] bg-black text-white font-semibold px-5 py-2 rounded-md hover:bg-gray-800 transition cursor-pointer"
            >
              Try Now →
            </button>

            <button className="shine-btn relative overflow-hidden flex items-center text-[15px] bg-white/70 backdrop-blur-md text-gray-900 border border-black/15 px-5 py-2 cursor-pointer rounded-md hover:bg-white transition">
              <span className="mx-1">Become Pro</span>
            </button>
          </motion.div>
        </section>

        {/* SLIDER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="w-full flex justify-center mt-10"
        >
          <div
            className="relative w-[600px] h-[360px] sm:w-[750px] sm:h-[450px] md:w-[900px] md:h-[560px] overflow-hidden rounded-3xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.25)] border border-black/10 bg-linear-to-br from-white/70 via-gray-100/60 to-white/80 backdrop-blur-xl"
            style={{ transform: `translate(${mouse.x * 4}px, ${mouse.y * 3}px)` }}
          >
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
      className="bg-white/70 backdrop-blur-md border border-black/10 rounded-xl shadow-sm overflow-hidden"
    >
      <motion.button
        onClick={onToggle}
        whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex justify-between items-center px-6 py-4 text-left"
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
    q: "How does Ram Mobile work?",
    a: "You book a repair, our technician picks up your device, repairs it, and delivers it back with full tracking.",
  },
  {
    q: "Is my device safe?",
    a: "Yes. All repairs are handled by verified technicians and are fully trackable and insured.",
  },
  {
    q: "How long does a repair take?",
    a: "Most repairs are completed within 24–48 hours depending on the device and issue.",
  },
  {
    q: "Do you provide warranty?",
    a: "Yes, every repair includes a service warranty based on the repair type.",
  },
  {
    q: "Can I track my repair?",
    a: "You can track your device in real time directly from your dashboard.",
  },
];
