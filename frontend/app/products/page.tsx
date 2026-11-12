import { Suspense } from "react";
import type { Metadata } from "next";
import ProductListing from "@/components/product/ProductListing";
import ProductCardSkeleton from "@/components/product/ProductCartSkeleton";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse desktops, laptops, components and peripherals with filters for brand, price and rating.",
};

function ListingFallback() {
  return (
    <div className="container-custom py-12">
      <div className="skeleton h-8 w-48 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ListingFallback />}>
      <ProductListing />
    </Suspense>
  );
}