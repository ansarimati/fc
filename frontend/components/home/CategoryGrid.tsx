"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiMonitor, FiCpu, FiHardDrive, FiHeadphones,
  FiWifi, FiDatabase, FiTv, FiPackage,
} from "react-icons/fi";

const categories = [
  { name: "Desktops",     icon: FiMonitor,   href: "/products?category=desktop",     color: "from-blue-500 to-blue-700" },
  { name: "Laptops",      icon: FiCpu,       href: "/products?category=laptop",      color: "from-purple-500 to-purple-700" },
  { name: "Components",   icon: FiHardDrive, href: "/products?category=components",  color: "from-orange-500 to-orange-700" },
  { name: "Peripherals",  icon: FiHeadphones,href: "/products?category=peripherals", color: "from-green-500 to-green-700" },
  { name: "Networking",   icon: FiWifi,      href: "/products?category=networking",  color: "from-cyan-500 to-cyan-700" },
  { name: "Storage",      icon: FiDatabase,  href: "/products?category=storage",     color: "from-pink-500 to-pink-700" },
  { name: "Monitors",     icon: FiTv,        href: "/products?category=monitors",    color: "from-red-500 to-red-700" },
  { name: "Accessories",  icon: FiPackage,   href: "/products?category=accessories", color: "from-yellow-500 to-yellow-700" },
];

export default function CategoryGrid() {
  return (
    <section className="section">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Everything you need, organized for you</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href={cat.href} className="group block">
                <div className="card-hover p-6 flex flex-col items-center text-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <cat.icon className="text-white" size={24} />
                  </div>
                  <span className="text-sm font-medium text-dark-200 group-hover:text-white transition-colors">
                    {cat.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}