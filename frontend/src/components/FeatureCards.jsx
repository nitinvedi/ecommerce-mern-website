import { lazy, Suspense } from "react";
import { motion } from "framer-motion";

// Dynamic Icon Loader
function DynamicIcon(name) {
  return lazy(() =>
    import("lucide-react").then((m) => ({ default: m[name] }))
  );
}

// Icons
const SearchCheck = DynamicIcon("SearchCheck");
const Wrench = DynamicIcon("Wrench");
const Cpu = DynamicIcon("Cpu");
const Timer = DynamicIcon("Timer");
const ShoppingBag = DynamicIcon("ShoppingBag");
const ShieldCheck = DynamicIcon("ShieldCheck");
const Truck = DynamicIcon("Truck");
const Percent = DynamicIcon("Percent");

// Features
const features = [
  {
    icon: <SearchCheck className="w-10 h-10 text-white" />,
    title: "Quick Mobile Diagnosis",
    desc: "Identify issues like screen damage, battery drain, overheating, and software errors within minutes."
  },
  {
    icon: <Wrench className="w-10 h-10 text-white" />,
    title: "Expert Mobile Repairs",
    desc: "Certified technicians fix screens, batteries, cameras, speakers, and charging ports with precision."
  },
  {
    icon: <Cpu className="w-10 h-10 text-white" />,
    title: "Genuine Spare Parts",
    desc: "We use original and premium components for every repair, ensuring long-lasting device performance."
  },
  {
    icon: <Timer className="w-10 h-10 text-white" />,
    title: "Fast Same-Day Service",
    desc: "Most repairs are completed within 30–60 minutes so you get your device back quickly and safely."
  },
  {
    icon: <ShoppingBag className="w-10 h-10 text-white" />,
    title: "Shop Mobile Accessories",
    desc: "Browse cases, chargers, cables, earbuds, and tempered glass at the best prices in our online store."
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-white" />,
    title: "Warranty on Repairs & Products",
    desc: "Every repair and accessory comes with warranty protection to ensure quality and peace of mind."
  },
  {
    icon: <Truck className="w-10 h-10 text-white" />,
    title: "Pickup & Doorstep Delivery",
    desc: "We offer convenient pickup for repairs and home delivery for all online accessory orders."
  },
  {
    icon: <Percent className="w-10 h-10 text-white" />,
    title: "Offers & Exclusive Discounts",
    desc: "Enjoy regular deals on repairs, accessories, combo packs, and festive sales to save more."
  }
];

export default function FeatureCards() {
  return (
    <div className="bg-black/50 pb-20 pt-10">

      {/* Heading Animation */}
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, amount: 0.2 }}
        className="text-4xl md:text-6xl mt-10 font-bold text-center text-white"
      >
        Offering Services You'll Love 🎉
      </motion.h2>

      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        viewport={{ once: true, amount: 0.2 }}
        className="text-xl text-gray-500 text-center mt-2"
      >
        All in one place for electronic devices
      </motion.h2>

      <div className="w-full flex justify-center py-20 px-6">

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">

          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              viewport={{ once: true, amount: 0.15 }}
              className="bg-black/75 border border-white/10 rounded-2xl p-6 shadow-lg hover:bg-[#161616] transition"
            >

              <Suspense fallback={<div className="w-10 h-10 bg-white/10 rounded"></div>}>
                {f.icon}
              </Suspense>

              <h3 className="text-white text-xl font-semibold mt-4">
                {f.title}
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed mt-2">
                {f.desc}
              </p>
            </motion.div>
          ))}

        </div>
      </div>
    </div>
  );
}
