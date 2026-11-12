"use client";

import { useEffect, useState } from "react";
import { FiFilter, FiPackage } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { productService } from "@/lib/services/productService";
import { useProductFilters } from "@/hooks/useProductFilters";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCartSkeleton";
import FilterSidebar from "./FilterSidebar";
import SortDropdown from "./SortDropdown";
import ActiveFilters from "./ActiveFilters";
import Pagination from "@/components/ui/Pagination";
import type { Product } from "@/types";

const PAGE_SIZE = 12;

export default function ProductListing() {
  const { filters, setFilters, activeCount } = useProductFilters();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Serialize filters so the effect only re-runs on real changes
  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    productService
      .getProducts({
        ...filters,
        brand: filters.brand?.join(","),
        limit: PAGE_SIZE,
      } as any)
      .then((res) => {
        if (cancelled) return;
        if (!res) {
          setError("No products found");
          return;
        }
        setProducts(res.data);
        setTotal(res.total);
        setPages(res.pages);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const handlePageChange = (page: number) => {
    setFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const heading = filters.search
    ? `Results for "${filters.search}"`
    : filters.category
    ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1)
    : "All Products";

  return (
    <div className="container-custom py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-dark-500 mb-4">
        <Link href="/" className="hover:text-primary-400">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-dark-300">Products</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">{heading}</h1>
          {!loading && (
            <p className="text-dark-400 text-sm mt-1">
              {total} {total === 1 ? "product" : "products"} found
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden btn-secondary !py-2.5 !px-4 text-sm"
          >
            <FiFilter size={16} />
            Filters{activeCount > 0 && ` (${activeCount})`}
          </button>
          <SortDropdown />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="card p-5 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <FilterSidebar />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <ActiveFilters />

          {error ? (
            <div className="card p-10 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={() => setFilters({})} className="btn-primary">Try Again</button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center">
              <FiPackage className="mx-auto text-dark-600 mb-4" size={56} />
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-dark-400 mb-6">Try adjusting or clearing your filters.</p>
              <Link href="/products" className="btn-primary">Clear Filters</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
              <Pagination page={filters.page} pages={pages} onChange={handlePageChange} />
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-dark-900 z-50 p-5 overflow-y-auto lg:hidden"
            >
              <FilterSidebar onClose={() => setDrawerOpen(false)} />
              <button
                onClick={() => setDrawerOpen(false)}
                className="btn-primary w-full mt-4"
              >
                Show {total} Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}