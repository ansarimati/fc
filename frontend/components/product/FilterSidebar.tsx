"use client";

import { useEffect, useState } from "react";
import { FiStar, FiX } from "react-icons/fi";
import { useProductFilters } from "@/hooks/useProductFilters";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Desktops",       value: "desktop" },
  { label: "Laptops",        value: "laptop" },
  { label: "Components",     value: "components" },
  { label: "Peripherals",    value: "peripherals" },
  { label: "Networking",     value: "networking" },
  { label: "Storage",        value: "storage" },
  { label: "Monitors",       value: "monitors" },
  { label: "Accessories",    value: "accessories" },
];

const BRANDS = [
  "ASUS", "MSI", "Gigabyte", "Dell", "HP", "Lenovo", "Acer",
  "Intel", "AMD", "NVIDIA", "Corsair", "Logitech", "Samsung",
];

const PRICE_PRESETS = [
  { label: "Under ₹10,000",       min: undefined, max: 10000 },
  { label: "₹10,000 – ₹30,000",   min: 10000,     max: 30000 },
  { label: "₹30,000 – ₹60,000",   min: 30000,     max: 60000 },
  { label: "₹60,000 – ₹1,00,000", min: 60000,     max: 100000 },
  { label: "Above ₹1,00,000",     min: 100000,    max: undefined },
];

function Section ({ title, children }: { title: string, children: React.ReactNode })  {
  return (
    <div className="py-5 border-b border-dark-800 last:border-0">
      <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
      {children}
    </div>
  );
};

export default function FilterSidebar ({ onClose }: { onClose?: () => void }) {
  const { filters, setFilters, clearFilters, activeCount } = useProductFilters();

  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");

  // Keep input in sync when URL changes (clear filter / back button)
  useEffect(() => {
    setMinInput(filters.minPrice?.toString() ?? "");
    setMaxInput(filters.maxPrice?.toString() ?? "")
  }, [filters.minPrice, filters.maxPrice]);

  const toggleBrand = (brand: string) => {
    const current = filters.brand || [];
    const next = current.includes(brand) ? current.filter((b) => b !== brand) : [...current, brand];
    setFilters({ brand: next });
  }

  const applyPrice = () => {
    setFilters({
      minPrice: minInput ? Number(minInput) : undefined,
      maxPrice: maxInput ? Number(maxInput) : undefined,
    })
  };

  const optionClass = (active: boolean) =>
    cn(
      "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors",
      active
        ? "bg-primary-600/20 text-primary-400 font-medium"
        : "text-dark-300 hover:bg-dark-800 hover:text-white"
    );

    return (
    <aside className="w-full">
      <div className="flex items-center justify-between pb-4 border-b border-dark-800">
        <h3 className="text-lg font-display font-bold text-white">
          Filters {activeCount > 0 && <span className="text-primary-400">({activeCount})</span>}
        </h3>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-primary-400 hover:text-primary-300">
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-dark-400 hover:text-white">
              <FiX size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <Section title="Category">
        <ul className="space-y-1">
          {CATEGORIES.map((c) => (
            <li key={c.value}>
              <button
                onClick={() => setFilters({ category: c.value || undefined })}
                className={optionClass((filters.category || "") === c.value)}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </Section>
      {/* Price */}
      <Section title="Price Range">
        <div className="space-y-1 mb-3">
          {PRICE_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setFilters({ minPrice: p.min, maxPrice: p.max })}
              className={optionClass(filters.minPrice === p.min && filters.maxPrice === p.max)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            className="input !py-2 !text-sm"
          />
          <span className="text-dark-500">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            className="input !py-2 !text-sm"
          />
        </div>
        <button onClick={applyPrice} className="btn-secondary w-full !py-2 !text-sm mt-2">
          Apply
        </button>
      </Section>

      {/* Brand */}
      <Section title="Brand">
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.brand?.includes(brand) || false}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-dark-300 group-hover:text-white transition-colors">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Rating */}
      <Section title="Customer Rating">
        <div className="space-y-1">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => setFilters({ rating: filters.rating === r ? undefined : r })}
              className={cn(
                "w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                filters.rating === r
                  ? "bg-primary-600/20 text-primary-400"
                  : "text-dark-300 hover:bg-dark-800"
              )}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar
                  key={i}
                  size={14}
                  className={i < r ? "text-yellow-400 fill-current" : "text-dark-600"}
                />
              ))}
              <span className="ml-1">& up</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Availability */}
      <Section title="Availability">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock || false}
            onChange={(e) => setFilters({ inStock: e.target.checked })}
            className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-dark-300">In stock only</span>
        </label>
      </Section>
    </aside>
  );

}