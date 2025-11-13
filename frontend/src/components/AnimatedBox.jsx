import React from "react";
import "../styles/animatedBox.css";

export default function AnimatedBox() {
  return (
    <div className="mx-auto relative w-64 h-32 mb-10">
      {/* Glow Layer */}
      <div className="animated-border-box-glow"></div>

      {/* Main Box */}
      <div className="animated-border-box">
        <p className="text-white text-center font-bold text-lg z-10 relative">
          Repair Smarter
        </p>
      </div>
    </div>
  );
}
