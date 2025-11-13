import React from 'react'
import '../styles/landing.css';

export default function Landing() {
  return (
    <div className="landing min-h-screen flex justify-center">
      <h1 className="merriweather text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center leading-tight tracking-tight max-w-4xl mx-auto px-4 mt-40">
        <span className="inline">Repair Smarter, </span>
        <span className="inline">Shop Faster,</span>
        <span className="block">Track Instantly.</span>
      </h1>
    </div>

  )
}
