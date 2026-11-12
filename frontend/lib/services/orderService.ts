import api from "@/lib/api";
import type { Address, Order, APIResponse, PaginatedResponse } from "@/types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/** Dynamically loads the Razorpay checkout script */
const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  export const orderService = {
  /** Full Razorpay checkout flow: create order → open widget → verify → confirm */
  payWithRazorpay: async (
    shippingAddress: Address,
    notes: string,
    userInfo: { name: string; email: string; contact: string },
    onSuccess: (order: Order) => void,
    onFailure: (message: string) => void
  ) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      onFailure("Failed to load payment gateway. Check your internet connection.");
      return;
    }

    try {
      const { data: createData } = await api.post("/orders/create-razorpay-order", {
        shippingAddress,
      });
      const { razorpayOrderId, amount, currency, keyId } = createData.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "TechBazaar",
        description: "Order Payment",
        image: "/logo.png",
        order_id: razorpayOrderId,
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.contact,
        },
        theme: { color: "#2563eb" },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
        },
        handler: async (response: any) => {
          try {
            const { data: verifyData } = await api.post("/orders/verify-payment", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              shippingAddress,
              notes,
            });
            onSuccess(verifyData.data.order);
          } catch (err: any) {
            onFailure(err.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => onFailure("Payment cancelled"),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        onFailure(response.error.description || "Payment failed");
      });
      rzp.open();
    } catch (err: any) {
      onFailure(err.message || "Failed to initiate payment");
    }
  },

  /** Cash on Delivery order */
  placeCODOrder: async (shippingAddress: Address, notes: string) => {
    const { data } = await api.post<APIResponse<{ order: Order }>>("/orders/cod", {
      shippingAddress,
      notes,
    });
    return data.data!.order;
  },

  getMyOrders: async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const { data } = await api.get<APIResponse<PaginatedResponse<Order>>>(
      `/orders?${query}`
    );
    return data.data!;
  },

  getOrderById: async (id: string) => {
    const { data } = await api.get<APIResponse<{ order: Order }>>(`/orders/${id}`);
    return data.data!.order;
  },

  trackOrder: async (orderNumber: string) => {
    const { data } = await api.get(`/orders/track/${orderNumber}`);
    return data.data;
  },

  cancelOrder: async (id: string, reason?: string) => {
    const { data } = await api.put<APIResponse<{ order: Order }>>(
      `/orders/${id}/cancel`,
      { reason }
    );
    return data.data!.order;
  },
};