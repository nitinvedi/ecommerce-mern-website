import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import '../styles/landing.css';
import Navbar from '../components/Navbar';
import SignUp from '../components/SignUp';

export default function Landing() {
  const [signUp, setSignUp] = useState(false);

  const openSignUp = () => setSignUp(true);
  const closeSignUp = () => setSignUp(false);

  // -----------------------------
  // IMAGE SLIDER LOGIC
  // -----------------------------
  const images = [
    "image1.png",
    "image2.png",
    "image3.png",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="landing min-h-screen flex flex-col items-center">
      
      <Navbar openSignUp={openSignUp} />

      {/* Hero Section */}
      <main className="flex flex-col items-center mt-14 sm:mt-16 md:mt-20">

        {/* Heading */}
        <h1 className="heading-font text-white font-semibold
          text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
          text-center leading-tight max-w-4xl px-6">
          <span className="block">Repair Smarter,</span>
          <span className="block">Shop Faster, Track Instantly.</span>
        </h1>

        {/* ------------------------------- */}
        {/*     IMAGE SLIDER (FADE ONLY)   */}
        {/* ------------------------------- */}
        <div className="w-full flex justify-center mt-10">
          <div
            className="
      relative 
      w-[600px] h-[360px] 
      sm:w-[750px] sm:h-[450px] 
      md:w-[900px] md:h-[560px] 
      overflow-hidden rounded-2xl shadow-lg
    "
            style={{
              backgroundColor: "#000", // black background behind images
            }}
          >

            <AnimatePresence mode="wait">
              <motion.img
                key={index}
                src={images[index]}
                alt="slider"
                className="absolute w-full h-full object-cover"

                // Fade animation
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}

                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </AnimatePresence>

          </div>
        </div>


      </main>

      {signUp && <SignUp onClose={closeSignUp} />}
    </div>
  );
}
