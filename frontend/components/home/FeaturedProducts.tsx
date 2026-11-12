"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { productService } from "@/lib/services/productService";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCartSkeleton";
import type { Product } from "@/types";

interface Props {
  title: String;
  subtitle: String;
  filterKey: "isFeatured" | "isNewArrival" | "isBestSeller";
  viewAllHref?: string;
};

export default function FeaturedProducts ({ title, subtitle, filterKey, viewAllHref = "/products"}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productService
      .getProducts({ [filterKey]: true, limit: 8 } as any)
      .then((res) => {
        if (mounted && res) setProducts(res.data);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))

      return () => {
      mounted = false;
    };
  }, [filterKey]);

  return (
    <section className="section">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">{title}</h2>
            <p className="section-subtitle">{subtitle}</p>
          </div>
          <Link
            href={viewAllHref}
            className="hidden sm:flex items-center gap-1 text-primary-400 hover:text-primary-300 font-medium text-sm group"
          >
            View All
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>

        {!loading && products.length === 0 && (
          <p className="text-center text-dark-500 py-10">No products found in this section yet.</p>
        )}
      </div>
    </section>
  );
}
