import { motion } from "framer-motion";
import {
  SearchCheck,
  Wrench,
  Cpu,
  Timer,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Percent
} from "lucide-react";

/* Icon Map */
const icons = {
  SearchCheck,
  Wrench,
  Cpu,
  Timer,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Percent
};

const features = [
  {
    icon: "SearchCheck",
    title: "Quick Mobile Diagnosis",
    desc: "Identify issues like screen damage, battery drain, overheating, and software errors within minutes."
  },
  {
    icon: "Wrench",
    title: "Expert Mobile Repairs",
    desc: "Certified technicians fix screens, batteries, cameras, speakers, and charging ports with precision."
  },
  {
    icon: "Cpu",
    title: "Genuine Spare Parts",
    desc: "We use premium components for every repair to ensure long-lasting performance."
  },
  {
    icon: "Timer",
    title: "Fast Same-Day Service",
    desc: "Most repairs are completed within 30–60 minutes."
  },
  {
    icon: "ShoppingBag",
    title: "Mobile Accessories",
    desc: "Chargers, cases, earbuds, and more — all at fair prices."
  },
  {
    icon: "ShieldCheck",
    title: "Warranty Protection",
    desc: "All repairs and products include warranty coverage."
  },
  {
    icon: "Truck",
    title: "Pickup & Delivery",
    desc: "Doorstep pickup for repairs and fast delivery."
  },
  {
    icon: "Percent",
    title: "Offers & Discounts",
    desc: "Seasonal deals on repairs and accessories."
  }
];

export default function FeatureCards() {
  return (
    <section className="relative py-20 px-6">
      
      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-3xl md:text-5xl font-bold text-center text-gray-900"
      >
        Services You’ll Love
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-base md:text-lg text-gray-600 text-center mt-3"
      >
        Everything your device needs — in one place
      </motion.p>

      {/* Grid */}
      <div className="mt-14 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {features.map((f, i) => {
            const Icon = icons[f.icon];

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
                className="
                  group
                  bg-white/70 backdrop-blur
                  border border-black/10
                  rounded-2xl p-6
                  hover:border-black/20
                  transition-colors
                "
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-black/5 text-gray-900">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {f.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}
