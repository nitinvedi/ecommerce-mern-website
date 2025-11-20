import { motion } from "framer-motion";

export default function Footer() {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: "easeOut", delay },
    viewport: { once: true, amount: 0.2 }
  });

  return (
    <section
      className="relative w-full min-h-[85vh] flex flex-col items-center justify-between 
      text-center bg-black/30 py-10 px-6 md:px-10 overflow-hidden"
    >
      {/* Top Content */}
      <div className="flex flex-col items-center max-w-3xl">

        {/* Heading */}
        <motion.h1
          {...fadeUp(0)}
          className="text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
        >
          Fast Repairs & Quality Mobile Accessories
        </motion.h1>

        {/* Subtext */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-gray-300 mt-3 text-base sm:text-lg md:text-xl leading-relaxed px-1"
        >
          Trusted mobile repair services, genuine spare parts, and premium accessories —
          all in one place. <br className="hidden sm:block" />
          Experience speed, reliability, and quality with Marammat.
        </motion.p>

        {/* Button */}
        <motion.div {...fadeUp(0.4)} className="flex justify-center mt-6">
          <button className="relative overflow-hidden bg-white/90 text-black px-6 py-2.5 
          rounded-md text-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:bg-white">
            Join Now
          </button>
        </motion.div>
      </div>

      {/* Footer Bottom */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between px-2 md:px-10 gap-4">

        {/* Footer Links */}
        <motion.div
          {...fadeUp(0.6)}
          className="flex flex-wrap justify-center md:justify-start gap-3 text-gray-400 text-sm"
        >
          {["Report an Issue", "Privacy Policy", "Terms of Service", "Credit for Icons"].map(
            (item) => (
              <a key={item} href="#" className="hover:text-white transition duration-200">
                {item}
              </a>
            )
          )}
        </motion.div>

        {/* Branding */}
        <motion.span
          {...fadeUp(0.8)}
          className="text-white/70 text-sm tracking-wide"
        >
          Marammat © {new Date().getFullYear()}
        </motion.span>
      </div>
    </section>
  );
}
