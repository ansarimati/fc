import { create } from "zustand";
import type { Cart } from "@/types";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  removeItem: (productId: string, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/cart");
      set({ cart: data.data.cart });
    } catch (err: any) {
      // Silently fail for guests
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity = 1, variantId) => {
    try {
      const { data } = await api.post("/cart/add", { productId, quantity, variantId });
      set({ cart: data.data.cart });
      toast.success("Added to cart 🛒");
    } catch (err: any) {
      toast.error(err.message);
    }
  },

  updateQuantity: async (productId, quantity, variantId) => {
    try {
      const { data } = await api.put("/cart/update", { productId, quantity, variantId });
      set({ cart: data.data.cart });
    } catch (err: any) {
      toast.error(err.message);
    }
  },

  removeItem: async (productId, variantId) => {
    try {
      const { data } = await api.delete("/cart/remove", { data: { productId, variantId } });
      set({ cart: data.data.cart });
      toast.success("Item removed from cart");
    } catch (err: any) {
      toast.error(err.message);
    }
  },

  clearCart: async () => {
    try {
      await api.delete("/cart/clear");
      set({ cart: null });
    } catch (err: any) {
      toast.error(err.message);
    }
  },

  applyCoupon: async (code) => {
    try {
      const { data } = await api.post("/cart/coupon", { code });
      set({ cart: data.data.cart });
      toast.success("Coupon applied! 🎉");
    } catch (err: any) {
      toast.error(err.message);
    }
  },
}));