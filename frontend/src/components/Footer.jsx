import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";

export default function Footer() {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut", delay },
    viewport: { once: true, amount: 0.25 }
  });

  const footerLinks = {
    Services: [
      { name: "Repair Services", path: "/repair" },
      { name: "Buy Refurbished", path: "/store" },
      { name: "Sell Your Device", path: "/contact" },
      { name: "Business Solutions", path: "/contact" },
      { name: "Track Order", path: "/dashboard" },
    ],
    Company: [
      { name: "About Us", path: "/intro" },
      { name: "Careers", path: "#" },
      { name: "Our Stores", path: "#" },
      { name: "Sustainability", path: "#" },
      { name: "Press", path: "#" },
    ],
    Support: [
      { name: "Help Center", path: "/contact" },
      { name: "Warranty Policy", path: "#" },
      { name: "Return Policy", path: "#" },
      { name: "Contact Us", path: "/contact" },
      { name: "Sitemap", path: "#" },
    ],
    Legal: [
      { name: "Privacy Policy", path: "#" },
      { name: "Terms of Service", path: "#" },
      { name: "Cookie Policy", path: "#" },
      { name: "Accessibility", path: "#" },
    ]
  };

  return (
    <footer className="bg-black text-white pt-24 pb-12 rounded-t-[3rem] mt-20 px-6 md:px-12 relative overflow-hidden">
      
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#DFFF00] to-transparent opacity-50" />

      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 border-b border-white/10 pb-16">
          <motion.div {...fadeUp(0)}>
            <h2 className="font-serif italic font-black text-5xl md:text-6xl mb-6">
              Run Mobile.
            </h2>
            <p className="text-gray-400 text-lg max-w-md font-sans leading-relaxed">
              The premier destination for mobile restoration and commerce. We give technology a second life, and you, peace of mind.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="flex flex-col justify-center">
            <h3 className="font-bold text-xl uppercase mb-4 tracking-wider">Join the Network</h3>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/5 border border-white/10 rounded-full px-6 py-4 flex-1 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#DFFF00] transition-colors"
              />
              <button className="bg-[#DFFF00] text-black px-8 py-4 rounded-full font-bold hover:bg-white transition-colors">
                <ArrowRight />
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-500 uppercase tracking-widest">
              Unsubscribe at any time. No spam, ever.
            </p>
          </motion.div>
        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-8 mb-20">
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div key={category} {...fadeUp(0.2 + index * 0.05)}>
              <h4 className="font-bold text-lg mb-6 text-[#DFFF00] uppercase tracking-wider">{category}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className="text-gray-400 hover:text-white transition-colors font-medium text-sm md:text-base hover:pl-2 duration-300 block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section: Socials & Copyright */}
        <motion.div 
          {...fadeUp(0.4)}
          className="flex flex-col-reverse md:flex-row items-center justify-between pt-8 border-t border-white/10 gap-8"
        >
          <div className="text-gray-500 text-sm font-medium">
            © {new Date().getFullYear()} Run Mobile Inc. All rights reserved.
          </div>

          <div className="flex gap-6">
             {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
               <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#DFFF00] hover:text-black transition-all">
                  <Icon size={18} />
               </a>
             ))}
          </div>
        </motion.div>

      </div>
    </footer>
  );
}
