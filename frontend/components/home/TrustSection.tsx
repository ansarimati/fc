"use client";

import { motion } from "framer-motion";
import { FiShield, FiTruck, FiRefreshCw, FiHeadphones } from "react-icons/fi";

const features = [
  { icon: FiTruck,      title: "Fast Delivery",     desc: "2-5 day delivery across India" },
  { icon: FiShield,     title: "Genuine Products",  desc: "100% authentic, brand warranty" },
  { icon: FiRefreshCw,  title: "Easy Returns",      desc: "7-day hassle-free return policy" },
  { icon: FiHeadphones, title: "24/7 Support",      desc: "Dedicated customer support team" },
];

export default function TrustSection() {
  return (
    <section className="section pt-0">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-3">
                <f.icon className="text-primary-400" size={22} />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-dark-500 text-xs">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}