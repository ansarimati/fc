import api from "@/lib/api";
import type {
  Order, User, DashboardStats, APIResponse, PaginatedResponse,
} from "@/types";

export const adminService = {
  // ─── Dashboard ──────────────────────────────────────────
  getDashboardStats: async () => {
    const { data } = await api.get<APIResponse<DashboardStats>>("/admin/dashboard/stats");
    return data.data!;
  },

  getLowStockProducts: async (threshold = 5) => {
    const { data } = await api.get(`/admin/dashboard/low-stock?threshold=${threshold}`);
    return data.data.products;
  },

  getOutOfStockProducts: async () => {
    const { data } = await api.get("/admin/dashboard/out-of-stock");
    return data.data.products;
  },

  // ─── Orders ─────────────────────────────────────────────
  orders: {
    getAll: async (params: {
      page?: number; limit?: number; status?: string;
      paymentStatus?: string; search?: string; fromDate?: string; toDate?: string;
    } = {}) => {
      const query = new URLSearchParams(params as any).toString();
      const { data } = await api.get<APIResponse<PaginatedResponse<Order>>>(
        `/admin/orders?${query}`
      );
      return data.data!;
    },

    getById: async (id: string) => {
      const { data } = await api.get<APIResponse<{ order: Order }>>(`/admin/orders/${id}`);
      return data.data!.order;
    },

    updateStatus: async (
      id: string,
      payload: { status: string; message?: string; location?: string; trackingNumber?: string }
    ) => {
      const { data } = await api.put<APIResponse<{ order: Order }>>(
        `/admin/orders/${id}/status`,
        payload
      );
      return data.data!.order;
    },

    updatePaymentStatus: async (id: string, paymentStatus: string) => {
      const { data } = await api.put<APIResponse<{ order: Order }>>(
        `/admin/orders/${id}/payment-status`,
        { paymentStatus }
      );
      return data.data!.order;
    },

    refund: async (id: string, reason?: string) => {
      const { data } = await api.put<APIResponse<{ order: Order }>>(
        `/admin/orders/${id}/refund`,
        { reason }
      );
      return data.data!.order;
    },
  },

  // ─── Users ──────────────────────────────────────────────
  users: {
    getAll: async (params: {
      page?: number; limit?: number; search?: string; role?: string; status?: string;
    } = {}) => {
      const query = new URLSearchParams(params as any).toString();
      const { data } = await api.get<APIResponse<PaginatedResponse<User>>>(
        `/admin/users?${query}`
      );
      return data.data!;
    },

    getById: async (id: string) => {
      const { data } = await api.get(`/admin/users/${id}`);
      return data.data;
    },

    toggleStatus: async (id: string) => {
      const { data } = await api.put<APIResponse<{ user: User }>>(
        `/admin/users/${id}/toggle-status`
      );
      return data.data!.user;
    },

    updateRole: async (id: string, role: "user" | "admin") => {
      const { data } = await api.put<APIResponse<{ user: User }>>(
        `/admin/users/${id}/role`,
        { role }
      );
      return data.data!.user;
    },
  },
};