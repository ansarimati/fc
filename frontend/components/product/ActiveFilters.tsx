"use client";

import { FiX } from "react-icons/fi";
import { useProductFilters } from "@/hooks/useProductFilters";
import { formatPrice } from "@/lib/utils";

export default function ActiveFilters() {
  const { filters, setFilters, clearFilters, activeCount } = useProductFilters();
  if (activeCount === 0) return null;

  const chips: { label: string; onRemove: () => void }[] = [];

  if (filters.category)
    chips.push({ label: `Category: ${filters.category}`, onRemove: () => setFilters({ category: undefined }) });

  filters.brand?.forEach((b) =>
    chips.push({
      label: b,
      onRemove: () => setFilters({ brand: filters.brand!.filter((x) => x !== b) }),
    })
  );

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice !== undefined ? formatPrice(filters.minPrice) : "₹0";
    const max = filters.maxPrice !== undefined ? formatPrice(filters.maxPrice) : "∞";
    chips.push({
      label: `${min} – ${max}`,
      onRemove: () => setFilters({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  if (filters.rating)
    chips.push({ label: `${filters.rating}★ & up`, onRemove: () => setFilters({ rating: undefined }) });

  if (filters.inStock)
    chips.push({ label: "In stock", onRemove: () => setFilters({ inStock: undefined }) });

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-primary-600/15 border border-primary-600/30 text-primary-300 text-xs capitalize"
        >
          {chip.label}
          <button onClick={chip.onRemove} className="hover:text-white">
            <FiX size={13} />
          </button>
        </span>
      ))}
      <button onClick={clearFilters} className="text-xs text-dark-400 hover:text-white underline ml-1">
        Clear all
      </button>
    </div>
  );
}