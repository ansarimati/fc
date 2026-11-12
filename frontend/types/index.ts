// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  phone?: string;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id?: string;
  fullname: string;
  phone: string;
  line: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: string
}

// Product Types
export type ProductCategory = "desktop"
  | "laptop"
  | "components"
  | "peripherals"
  | "networking"
  | "storage"
  | "monitors"
  | "accessories";

export interface ProductSpec {
  key: string;
  value: string;
}

export interface ProductVariant {
  _id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string;
  category: ProductCategory;
  subcategory: string;
  brand: string;
  images: string[];
  basePrice: number;
  salePrice?: number;
  stock: number;
  sku: string;
  variants: ProductVariant[];
  specs: ProductSpec[];
  tags: string[];
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  pcBuilderCompatible?: PCBuilderCategory;
  createdAt: string;
  updatedAt: string;
}

export type PCBuilderCategory =
  "cpu"
  | "motherboard"
  | "ram"
  | "gpu"
  | "storage"
  | "psu"
  | "cabinet"
  | "cooler"
  | "monitor"
  | "keyboard"
  | "mouse";

// Reviews Types
export interface Review {
  _id: string;
  user: Pick<User, "_id" | "name" | "avatar">;
  product: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  createdAt: string
}

//  Cart Type
export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

export interface Cart {
  Items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: number;
}

// Order Type
export type OrderStatus = | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = | "razorpay"
  | "cod";

export type PaymentStatus = | "pending"
  | "paid"
  | "failed"
  | "refunded";

export interface OrderItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface TrackingEvent {
  status: string;
  message: string;
  timestamp: string;
  location?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: Pick<User, "_id" | "name" | "email">;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  PaymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: OrderStatus;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  total: number;
  couponCode?: string;
  notes?: string;
  trackingNumber: string;
  trackingEvents: TrackingEvent[];
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  parent?: string;
  isActive: boolean;
  sortOrder: number
}

// PC Builder Types
export interface PCBuild {
  _id?: string;
  name: string;
  user?: string;
  components: Partial<Record<PCBuilderCategory, Product>>;
  totalPrice: number;
  isPublic: boolean;
  createdAt?: string;
}

// Filter and Search Types
export interface ProductFilters {
  category?: string;
  subCategory?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  ratings?: number;
  inStock?: boolean;
  tags?: string[];
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest" | "popular";
  page?: number;
  limit?: number;
  search?: string
}

export interface PaginatedResponse<T>{
  data: T[];
  page: number;
  pages: number;
  total: number;
  hasMore: boolean
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string
}

// Dashboard  Stats Admin
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenueChange: number;
  orderChange: number;
  recentOrders: Order[];
  topProducts: (Product & { sold: number })[];
  salesChart: { date: string, revenue: number, orders: number }[];
  ordersByStatus: Record<OrderStatus, number>
}