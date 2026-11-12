import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PCBuilderBanner from "@/components/home/PCBuilderBanner";
import TrustSection from "@/components/home/TrustSection";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustSection />
      <CategoryGrid />
      <FeaturedProducts
        title="Featured Products"
        subtitle="Hand-picked deals just for you"
        filterKey="isFeatured"
      />
      <PCBuilderBanner />
      <FeaturedProducts
        title="New Arrivals"
        subtitle="Fresh off the shelf"
        filterKey="isNewArrival"
        viewAllHref="/products?isNewArrival=true"
      />
      <FeaturedProducts
        title="Best Sellers"
        subtitle="Our customers' favorites"
        filterKey="isBestSeller"
        viewAllHref="/products?isBestSeller=true"
      />
    </>
  );
}