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

// Icon Map
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
    desc: "Most repairs are done in 30–60 minutes so you get your device back quickly."
  },
  {
    icon: "ShoppingBag",
    title: "Shop Mobile Accessories",
    desc: "Browse chargers, cases, earbuds, and more at the best prices."
  },
  {
    icon: "ShieldCheck",
    title: "Warranty on Repairs & Products",
    desc: "Every repair & accessory comes with warranty protection."
  },
  {
    icon: "Truck",
    title: "Pickup & Home Delivery",
    desc: "We offer pickup for repairs and doorstep delivery for accessories."
  },
  {
    icon: "Percent",
    title: "Offers & Discounts",
    desc: "Enjoy deals on repairs and accessories during festive seasons."
  }
];

export default function FeatureCards() {
  return (
    <section className="bg-black/20 min-h-[85vh] flex flex-col items-center justify-center py-10 px-6">

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="text-3xl md:text-5xl font-bold text-center text-white"
      >
        Offering Services You'll Love 🎉
      </motion.h2>

      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        viewport={{ once: true }}
        className="text-lg md:text-xl text-gray-400 text-center mt-2"
      >
        All in one place for your devices
      </motion.h2>

      {/* Grid */}
      <div className="w-full flex justify-center mt-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">

          {features.map((f, i) => {
            const Icon = icons[f.icon];

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 30px rgba(0,0,0,0.3)"
                }}
                className="bg-black/80 border border-white/10 rounded-2xl p-5 
                           shadow-xl hover:border-white/20 hover:bg-black/90
                           cursor-pointer transition-transform"
              >
                {/* Icon */}
                <motion.div whileHover={{ scale: 1.15 }} className="text-white">
                  <Icon className="w-9 h-9" />
                </motion.div>

                {/* Title */}
                <h3 className="text-white text-lg font-semibold mt-4">
                  {f.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mt-1.5">
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
