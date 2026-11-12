"use client";

import { FiChevronDown } from "react-icons/fi";
import { useProductFilters } from "@/hooks/useProductFilters";

const SORT_OPTIONS = [
  { label: "Newest First",       value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated",          value: "rating" },
  { label: "Best Selling",       value: "popular" },
];

export default function SortDropdown() {
  const { filters, setFilters } = useProductFilters();

  return (
    <div className="relative">
      <select
        value={filters.sort}
        onChange={(e) => setFilters({ sort: e.target.value })}
        className="appearance-none bg-dark-800 border border-dark-700 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 cursor-pointer"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
    </div>
  );
}