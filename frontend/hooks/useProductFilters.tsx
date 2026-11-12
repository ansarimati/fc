"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export interface ProductFilters {
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  sort?: string;
  inStock?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  page: number;
}

export function useProductFilters () {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: ProductFilters = useMemo(() => {
    const brand = searchParams.get("brand");
    return {
      category: searchParams.get("category") || undefined,
      brand: brand ? brand.split("," ) : undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      rating: searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined,
      search: searchParams.get("search") || undefined,
      sort: searchParams.get("sort") || "newest",
      inStock: searchParams.get("inStock") === "true" || undefined,
      isNewArrival: searchParams.get("isNewArrival") === "true" || undefined,
      isBestSeller: searchParams.get("isBestSeller") ===  "true" || undefined,
      page: Math.max(1, Number(searchParams.get("page")) || 1) 
    };
  }, [searchParams]);

  /** Update one or more filters. Resets to page 1 unless `page` is being set. */
  const setFilters = useCallback((updates: Partial<Record<keyof ProductFilters, string | number | boolean | string[] | undefined>>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (
          value === undefined || value === null || value === "" || value === false ||
          (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, String(value));
      }
    });

    if (!("page" in updates)) params.delete("page");

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  },
    [router, pathname, searchParams]
  );


  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.category) n++;
    if (filters.brand?.length) n += filters.brand.length;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) n++;
    if (filters.rating) n++;
    if (filters.inStock) n++;
    return n;
  }, [filters]);

  return { filters, setFilters, clearFilters, activeCount };

}