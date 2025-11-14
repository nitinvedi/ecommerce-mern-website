import React, { useState } from 'react';
import '../styles/landing.css';
import Navbar from '../components/Navbar';
import SignUp from '../components/SignUp';

export default function Landing() {
  const [signUp, setSignUp] = useState(false);

  const openSignUp = () => setSignUp(true);
  const closeSignUp = () => setSignUp(false);

  return (
    <div className="landing min-h-screen flex flex-col items-center">

      <Navbar openSignUp={openSignUp} />
      

      {/* Hero Section */}
      <main className="flex flex-col items-center mt-14 sm:mt-16 md:mt-20">

        {/* Heading */}
        <h1 className="oswald text-white font-semibold
          text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
          text-center leading-tight  max-w-4xl px-6">
          <span className="block">Repair Smarter,</span>
          <span className="block">Shop Faster, Track Instantly.</span>
        </h1>

      </main>

      {signUp && <SignUp onClose={closeSignUp} />}
    </div>
  );
}
