import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/landing.css";
import Navbar from "../components/Navbar";
import SignUp from "../components/SignUp";

export default function Landing() {
  const [signUp, setSignUp] = useState(false);
  const openSignUp = () => setSignUp(true);
  const closeSignUp = () => setSignUp(false);

  // -----------------------------
  // GLOBAL PARALLAX MOUSE TRACKING
  // -----------------------------
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

  // -----------------------------
  // IMAGE SLIDER LOGIC
  // -----------------------------
  const images = ["image1.png", "image2.png", "image3.png"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar openSignUp={openSignUp} />
      <div className="landing min-h-screen flex flex-col items-center pt-28">

        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center justify-center mt-4 md:mt-10 px-6 text-center max-w-5xl">

          {/* -------------------------------- */}
          {/* FLOATING ICONS WITH PARALLAX     */}
          {/* -------------------------------- */}
          {/* <div className="pointer-events-none absolute inset-0"> */}

          {/* MP3 */}
          {/* <motion.img
            src="/icons/mp3.png"
            className="w-14 absolute left-10 top-24"
            animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0] }}
            style={{ transform: `translate(${mouse.x * 18}px, ${mouse.y * 14}px)` }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          /> */}

          {/* PDF */}
          {/* <motion.img
            src="iphone.png"
            className="w-8 absolute left-12 bottom-28"
            animate={{ y: [0, 20, 0], rotate: [0, -10, 10, 0] }}
            style={{ transform: `translate(${mouse.x * 12}px, ${mouse.y * 16}px)` }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          /> */}

          {/* JPG */}
          {/* <motion.img
            src="/icons/jpg.png"
            className="w-14 absolute right-20 top-32"
            animate={{ y: [0, -18, 0], rotate: [0, 6, -6, 0] }}
            style={{ transform: `translate(${mouse.x * 20}px, ${mouse.y * 10}px)` }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          /> */}

          {/* MP4 */}
          {/* <motion.img
            src="/icons/mp4.png"
            className="w-16 absolute right-28 bottom-32"
            animate={{ y: [0, 25, 0], rotate: [0, -12, 12, 0] }}
            style={{ transform: `translate(${mouse.x * 10}px, ${mouse.y * 22}px)` }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </div> */}

          {/* -------------------------------- */}
          {/* TOP BADGE LABEL                  */}
          {/* -------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-black/30 backdrop-blur-sm border border-white/10 px-6 py-2 rounded-full text-white text-sm font-medium shadow-md"
            style={{ transform: `translate(${mouse.x * 4}px, ${mouse.y * 3}px)` }}
          >
            Start using Marammat ❤️
          </motion.div>

          {/* -------------------------------- */}
          {/* MAIN HEADING (PARALLAX)          */}
          {/* -------------------------------- */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ transform: `translate(${mouse.x * 8}px, ${mouse.y * 6}px)` }}
            className="
            heading-font text-gray-200 font-bold
            text-3xl sm:text-4xl md:text-5xl lg:text-6xl
            leading-[1.15] mt-6
          "
          >
            Effortless Phone Repairs,
            <br className="hidden sm:block" />
            Anywhere, Anytime.
          </motion.h1>

          {/* -------------------------------- */}
          {/* SUBHEADING                       */}
          {/* -------------------------------- */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{ transform: `translate(${mouse.x * 5}px, ${mouse.y * 4}px)` }}
            className="
            text-gray-300 text-base sm:text-[10px] md:text-[15px]
            mt-4 max-w-2xl mx-auto
            leading-relaxed font-inter
          "
          >
            Transfer your broken device to experts—fast, safe, and tracked in real time.
          </motion.p>

          {/* -------------------------------- */}
          {/* BUTTONS ROW (PARALLAX)           */}
          {/* -------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            style={{ transform: `translate(${mouse.x * 12}px, ${mouse.y * 10}px)` }}
            className="flex items-center gap-4 mt-8"
          >
            <button className="text-[15px] text-nowrap bg-white text-black font-semibold px-5 py-2 rounded-md text-lg hover:bg-gray-200 transition">
              Try Now →
            </button>

            <button className="shine-btn relative overflow-hidden flex items-center text-[15px] bg-black/10 backdrop-blur-md text-white border border-white/20 px-5 py-2 rounded-md text-lg hover:bg-white/10 transition">
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="#ffffff"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 4l3 5 5-3-2 10H6L4 6l5 3 3-5z" />
  </svg>

  <span className="mx-1">
    Become Pro
  </span>
</button>

          </motion.div>
        </section>

        {/* -------------------------------- */}
        {/* IMAGE SLIDER (PARALLAX)          */}
        {/* -------------------------------- */}
        <div className="w-full flex justify-center mt-10">
          <div
            className="
      relative
      w-[600px] h-[360px]
      sm:w-[750px] sm:h-[450px]
      md:w-[900px] md:h-[560px]
      overflow-hidden rounded-3xl
      shadow-[0_0_40px_-10px_rgba(0,0,0,0.7)]
      border border-white/10
      bg-linear-to-br from-black/60 via-zinc-900/60 to-black/40
      backdrop-blur-xl
    "
            style={{
              transform: `translate(${mouse.x * 4}px, ${mouse.y * 3}px)`
            }}
          >
            {/* subtle top highlight */}
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)]"></div>

            {/* subtle bottom shadow */}
            <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.4))]"></div>

            <AnimatePresence mode="wait">
              <motion.img
                key={index}
                src={images[index]}
                alt="slider"
                className="absolute w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
              />
            </AnimatePresence>
          </div>
        </div>


        {/* SIGN UP MODAL */}
        {signUp && (
          <div className="signup-modal fixed inset-0 z-99999">
            <SignUp onClose={closeSignUp} />
          </div>
        )}
      </div>
    </>
  );
}
