"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiCpu, FiArrowRight, FiSettings } from "react-icons/fi";

export default function PCBuilderBanner() {
  return (
    <section className="section">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-950 via-dark-900 to-accent-950/40 border border-dark-700 p-8 md:p-16"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 badge-accent mb-5">
                <FiSettings size={14} className="animate-spin-slow" />
                <span>Custom PC Configurator</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 text-balance">
                Build Your Dream PC, Piece by Piece
              </h2>
              <p className="text-dark-400 mb-8 max-w-md leading-relaxed">
                Pick your CPU, GPU, RAM, storage & more. We check compatibility
                in real-time and show you the total price instantly.
              </p>
              <Link href="/pc-builder" className="btn-accent group">
                Start Building
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex justify-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-48 h-48 md:w-64 md:h-64 rounded-4xl bg-dark-800/50 backdrop-blur-sm border border-dark-700 flex items-center justify-center"
              >
                <FiCpu className="text-primary-500" size={100} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}