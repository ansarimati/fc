"use client";

import Link from "next/link";
import {motion} from "framer-motion";
import { FiArrowRight, FiCpu, FiShield, FiTruck } from "react-icons/fi";


const stats = [
  { label: "Products",       value: "5,000+" },
  { label: "Happy Customers",value: "50,000+" },
  { label: "Brands",         value: "100+" },
  { label: "Cities Served",  value: "500+" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid-pattern">
      {/* Background glow orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" />

      <div className="container-custom relative pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 badge-primary mb-6">
              <FiCpu size={14} />
              <span>Build. Upgrade. Dominate.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1] mb-6 text-balance">
              Power Your World with{" "}
              <span className="gradient-text">Next-Gen Tech</span>
            </h1>

            <p className="text-dark-400 text-lg mb-8 max-w-lg leading-relaxed">
              From gaming rigs to workstation laptops — shop genuine components,
              build your dream desktop with our PC Configurator, and get it
              delivered anywhere in India.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/products" className="btn-primary group">
                Shop Now
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/pc-builder" className="btn-accent group">
                <FiCpu />
                Build Your PC
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 text-sm text-dark-400">
              <div className="flex items-center gap-2">
                <FiTruck className="text-primary-400" />
                <span>Free shipping over ₹5,000</span>
              </div>
              <div className="flex items-center gap-2">
                <FiShield className="text-primary-400" />
                <span>1-3 year warranty</span>
              </div>
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-4xl bg-gradient-to-br from-primary-600/20 to-accent-500/20 backdrop-blur-sm border border-dark-700/50 flex items-center justify-center animate-float">
                <FiCpu className="text-primary-500/40" size={200} />
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 md:-left-8 card p-4 w-40"
              >
                <p className="text-xs text-dark-400">RTX 4070 Ti</p>
                <p className="text-white font-bold">₹64,999</p>
                <span className="badge-success mt-1">In Stock</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-4 -right-4 md:-right-8 card p-4 w-44"
              >
                <p className="text-xs text-dark-400">Custom Build Saved</p>
                <p className="text-white font-bold">₹1,24,500</p>
                <span className="badge-primary mt-1">Gaming PC</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-dark-800"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-display font-bold gradient-text-blue">
                {stat.value}
              </p>
              <p className="text-dark-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}