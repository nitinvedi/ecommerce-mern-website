import React from 'react';
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#1d1d1f] text-white py-10 border-t border-gray-800 font-sans">
            <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                 {/* Brand */}
                 <div className="text-center md:text-left">
                     <h3 className="text-lg font-bold tracking-tight text-white/90">Ram Mobiles.</h3>
                     <p className="text-xs text-gray-500 mt-1">Premium Tech & Repair Center.</p>
                     <div className="mt-4 text-xs text-gray-400 space-y-1">
                        <p>Shop No.- 302, Model Town,</p>
                        <p>Near Shiv Chowk, Rewari (Hr.)</p>
                        <p>+91 7015313247 | +91 8684085974</p>
                        <p>Rammobiles2021@gmail.com</p>
                     </div>
                 </div>

                 {/* Minimal Nav - Only Valid Routes */}
                 <nav className="flex flex-wrap justify-center gap-8 text-sm text-gray-400 font-medium">
                     <a href="/store" className="hover:text-white transition-colors">Store</a>
                     <a href="/repair" className="hover:text-white transition-colors">Book Repair</a>
                     <a href="/dashboard" className="hover:text-white transition-colors">My Orders</a>
                     <a href="/contact" className="hover:text-white transition-colors">Contact</a>
                 </nav>

                 {/* Socials & Legal */}
                 <div className="flex flex-col items-center md:items-end gap-3">
                      <div className="flex gap-5">
                          <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={18} /></a>
                          <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={18} /></a>
                          <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={18} /></a>
                      </div>
                      <p className="text-[11px] text-gray-600">© {new Date().getFullYear()} Ram Mobiles Inc.</p>
                 </div>
            </div>
        </footer>
    );
}
