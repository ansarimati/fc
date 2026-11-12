"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiShoppingCart, FiHeart, FiStar } from "react-icons/fi";
import type { Product } from "@/types";
import { formatPrice, discountPercentage, getEffectivePrice, generateStars } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProductCard ({ product }: { product: Product }) {
  const { addToCart } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();

  const effectivePrice = getEffectivePrice(product);
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
  const stars = generateStars(product.rating);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      toast.error("Please login to add items to cart");
      router.push("/login");
    }
    addToCart(product._id, 1);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link href={`/product/${product.slug}`} className="group block h-full">
        <div className="card-hover h-full flex flex-col overflow-hidden">
          {/* Image */}
          <div className="relative aspect-square bg-dark-900 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {hasDiscount && (
                <span className="badge-accent">
                  {discountPercentage(product.basePrice, product.salePrice!)}% OFF
                </span>
              )}
              {product.isFeatured && <span className="badge-primary">New</span>}
              {product.isBestSeller && <span className="badge-success">Bestseller</span>}
            </div>

            {/* Wishlist button */}
            <button
              onClick={(e) => e.preventDefault()}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-dark-900/70 backdrop-blur-sm flex items-center justify-center text-dark-300 hover:text-red-400 hover:bg-dark-900 transition-colors"
            >
              <FiHeart size={15} />
            </button>

            {/* Stock overlay */}
            {!product.stock && (
              <div className="absolute inset-0 bg-dark-950/70 flex items-center justify-center">
                <span className="badge-error">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 flex flex-col flex-1">
            <p className="text-xs text-dark-500 uppercase tracking-wide mb-1">{product.brand}</p>
            <h3 className="text-sm font-medium text-dark-100 line-clamp-2 mb-2 group-hover:text-primary-400 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div className="flex items-center gap-1 mb-2">
                {stars.map((s, i) => (
                  <FiStar
                    key={i}
                    size={12}
                    className={s !== "empty" ? "star-filled fill-current" : "star-empty"}
                  />
                ))}
                <span className="text-xs text-dark-500 ml-1">({product.numReviews})</span>
              </div>
            )}

            <div className="mt-auto">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="price-tag !text-lg">{formatPrice(effectivePrice)}</span>
                {hasDiscount && (
                  <span className="price-original">{formatPrice(product.basePrice)}</span>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.stock}
                className="btn-primary w-full !py-2 !text-sm disabled:opacity-40"
              >
                <FiShoppingCart size={15} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}