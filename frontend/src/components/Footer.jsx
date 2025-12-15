import { motion } from "framer-motion";
import { Link } from "react-router-dom";
export default function Footer() {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut", delay },
    viewport: { once: true, amount: 0.25 }
  });

  return (
    <section className="relative w-full bg-transparent py-24 px-6 md:px-10">

      {/* Top Content */}
      <div className="max-w-4xl mx-auto text-center">

        {/* Heading */}
        <motion.h2
          {...fadeUp(0)}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
        >
          Repairs & Accessories, Done Right
        </motion.h2>

        {/* Subtext */}
        <motion.p
          {...fadeUp(0.1)}
          className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed"
        >
          Trusted mobile repair services, genuine spare parts, and premium
          accessories — all in one place.
        </motion.p>

        {/* CTA */}
        <motion.div {...fadeUp(0.2)} className="mt-10">
          <button
            className="
              inline-flex items-center justify-center
              rounded-xl bg-black text-white
              px-7 py-3 text-sm font-medium
              hover:bg-gray-900 transition
            "
          >
            Get Started
          </button>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto mt-20 border-t border-black/10" />

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto mt-8 flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Links */}
        {/* Links */}
        <motion.div
          {...fadeUp(0.3)}
          className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500"
        >
          {[
            { label: "FAQ", path: "/faq" },
            { label: "Contact", path: "/repair" }
          ].map(({ label, path }) => (
            <Link
              key={label}
              to={path}
              className="hover:text-gray-900 transition-colors"
            >
              {label}
            </Link>
          ))}
        </motion.div>

        {/* Copyright */}
        <motion.span
          {...fadeUp(0.4)}
          className="text-sm text-gray-500"
        >
          © {new Date().getFullYear()} Marammat
        </motion.span>
      </div>
    </section>
  );
}
