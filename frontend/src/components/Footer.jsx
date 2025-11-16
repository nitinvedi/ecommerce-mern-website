import { motion } from "framer-motion";

export default function Footer() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center bg-black/50 overflow-hidden">

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
        className="text-white text-4xl md:text-6xl font-bold relative z-10 px-4"
      >
        Fast Repairs & Quality Mobile Accessories
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true, amount: 0.2 }}
        className="text-gray-300 mt-4 text-lg md:text-xl max-w-2xl leading-relaxed relative z-10"
      >
        Trusted mobile repair services, genuine spare parts, and premium accessories — all in one place.
        <br />
        Experience speed, reliability, and quality with Marammat.
      </motion.p>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
        viewport={{ once: true, amount: 0.2 }}
        className="flex items-center justify-center gap-6 mt-10 relative z-10"
      >
        <button className="shine-btn relative overflow-hidden bg-gray-400 text-black px-8 py-3 rounded-md text-lg font-semibold shadow-lg hover:shadow-xl transition">
          Join Now
        </button>
      </motion.div>

      {/* Footer Links */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
        // viewport={{ once: true, amount: 0.2 }}
        className="absolute bottom-8 text-gray-400 text-sm flex gap-6"
      >
        <a href="#" className="hover:text-white transition">Report an Issue</a>
        <a href="#" className="hover:text-white transition">Privacy Policy</a>
        <a href="#" className="hover:text-white transition">Terms of Service</a>
        <a href="#" className="hover:text-white transition">Credit for Icons</a>
      </motion.div>

      {/* Branding */}
      <motion.span
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
        // viewport={{ once: true, amount: 0.2 }}
        className="absolute bottom-8 right-10 text-white/70 text-sm tracking-wide"
      >
        Marammat
      </motion.span>
    </section>
  );
}
