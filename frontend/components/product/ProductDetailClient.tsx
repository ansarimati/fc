"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface ProductVariant {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductReview {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  brand?: string;
  images: string[];
  stock: number;
  averageRating?: number;
  numReviews?: number;
  variants?: ProductVariant[];
  reviews?: ProductReview[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${id}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product not found"
              : "Could not load product"
          );
        }

        const result = await response.json();
        const loadedProduct: Product = result.data ?? result;

        setProduct(loadedProduct);
        setSelectedVariantId(loadedProduct.variants?.[0]?._id ?? "");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Could not load product");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [id]);

  const selectedVariant = product?.variants?.find(
    (variant) => variant._id === selectedVariantId
  );
  const price = selectedVariant?.price ?? product?.price ?? 0;
  const availableStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const isInStock = availableStock > 0;

  async function addToCart(buyNow = false) {
    if (!product || !isInStock) return;

    try {
      setAddingToCart(true);
      setError(null);

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          variantId: selectedVariantId || undefined,
          quantity,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Could not add this product to your cart");
      }

      if (buyNow) router.push("/checkout");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not add this product to your cart"
      );
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container-custom py-16 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length ? product.images : ["/placeholder.png"];
  const roundedRating = Math.round(product.averageRating ?? 0);

  return (
    <main className="container-custom py-8 md:py-12">
      <nav className="mb-6 text-sm text-dark-500" aria-label="Breadcrumb">
        <a href="/" className="hover:text-primary-400">Home</a>
        <span className="mx-2">/</span>
        <a href="/products" className="hover:text-primary-400">Products</a>
        <span className="mx-2">/</span>
        <span className="text-dark-300">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product image gallery */}
        <section>
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-dark-800">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View product image ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-dark-800 ${
                    selectedImage === index
                      ? "border-primary-500"
                      : "border-dark-700"
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Product information */}
        <section>
          {product.brand && (
            <p className="mb-2 text-sm uppercase tracking-wide text-primary-400">
              {product.brand}
            </p>
          )}

          <h1 className="text-3xl font-display font-bold text-white md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-yellow-400" aria-label={`${roundedRating} out of 5 stars`}>
              {"★".repeat(roundedRating)}
              {"☆".repeat(5 - roundedRating)}
            </span>
            <span className="text-dark-400">
              {product.averageRating?.toFixed(1) ?? "No rating"}
              {product.numReviews ? ` (${product.numReviews} reviews)` : ""}
            </span>
          </div>

          <p className="mt-6 text-3xl font-bold text-white">{formatPrice(price)}</p>

          <p className={`mt-3 text-sm ${isInStock ? "text-green-400" : "text-red-400"}`}>
            {isInStock ? `${availableStock} available` : "Out of stock"}
          </p>

          <p className="mt-6 whitespace-pre-line leading-7 text-dark-300">
            {product.description}
          </p>

          {product.variants && product.variants.length > 0 && (
            <div className="mt-6">
              <label htmlFor="variant" className="mb-2 block text-sm font-medium text-white">
                Choose an option
              </label>
              <select
                id="variant"
                value={selectedVariantId}
                onChange={(event) => {
                  setSelectedVariantId(event.target.value);
                  setQuantity(1);
                }}
                className="w-full rounded-xl border border-dark-700 bg-dark-800 px-4 py-3 text-white"
              >
                {product.variants.map((variant) => (
                  <option key={variant._id} value={variant._id}>
                    {variant.name} — {formatPrice(variant.price)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-6">
            <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-white">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              max={availableStock}
              value={quantity}
              disabled={!isInStock}
              onChange={(event) => {
                const value = Number(event.target.value);
                setQuantity(Math.min(availableStock, Math.max(1, value || 1)));
              }}
              className="w-24 rounded-xl border border-dark-700 bg-dark-800 px-4 py-3 text-white disabled:opacity-50"
            />
          </div>

          {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!isInStock || addingToCart}
              onClick={() => addToCart()}
              className="btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>
            <button
              type="button"
              disabled={!isInStock || addingToCart}
              onClick={() => addToCart(true)}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </section>
      </div>

      {/* Customer reviews */}
      <section className="mt-16 border-t border-dark-800 pt-10">
        <h2 className="text-2xl font-display font-bold text-white">Customer Reviews</h2>

        {!product.reviews?.length ? (
          <p className="mt-4 text-dark-400">No reviews yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {product.reviews.map((review) => (
              <article key={review._id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-white">{review.name}</h3>
                  <span
                    className="text-yellow-400"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                <p className="mt-3 text-dark-300">{review.comment}</p>
                <time className="mt-3 block text-xs text-dark-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </time>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}