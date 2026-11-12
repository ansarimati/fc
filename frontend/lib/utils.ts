import { Retrier } from './../node_modules/@humanwhocodes/retry/dist/retrier.d';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price to INR 
export function formatPrice (amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
};

// Format large number e.g 1200 to 1.2K
export function formatNumber (num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

// Calculate discount percentage
export function discountPercentage (original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100)
}

// Truncate text
export function truncate (str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

// Slugify a string
export function slugify (str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

// Capitalize first letter
export function capitaize (str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get initials from name for Avatar
export function getInitials (name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Formate date to readable indian format
export function formatDate (date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// Formate date with time
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day:    "numeric",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/** Get relative time (e.g. "2 hours ago") */
export function timeAgo(date: string | Date): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  const intervals = [
    { label: "year",   seconds: 31536000 },
    { label: "month",  seconds: 2592000  },
    { label: "week",   seconds: 604800   },
    { label: "day",    seconds: 86400    },
    { label: "hour",   seconds: 3600     },
    { label: "minute", seconds: 60       },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

/** Generate star array for rating display */
export function generateStars(rating: number): ("full" | "half" | "empty")[] {
  return Array.from({ length: 5 }, (_, i) => {
    if (i + 1 <= Math.floor(rating)) return "full";
    if (i < rating && rating % 1 >= 0.5) return "half";
    return "empty";
  });
}

/** Check if product is on sale */
export function isOnSale(product: {
  basePrice: number;
  salePrice?: number;
}): boolean {
  return !!product.salePrice && product.salePrice < product.basePrice;
}

/** Get effective product price */
export function getEffectivePrice(product: {
  basePrice: number;
  salePrice?: number;
}): number {
  return product.salePrice && product.salePrice < product.basePrice
    ? product.salePrice
    : product.basePrice;
}

/** Indian states list */
export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep",
  "Puducherry",
] as const;

/** Validate Indian pincode */
export function isValidPincode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin);
}

/** Validate Indian phone number */
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}