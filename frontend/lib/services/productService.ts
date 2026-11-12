import api from "@/lib/api";
import type {
  Product,
  ProductFilters,
  PaginatedResponse,
  Category,
  APIResponse
} from "@/types/index";
import axios from "axios";

export const productService = {
    /** Get paginated + filtered product list */
    getProducts: async (filters: ProductFilters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (Array.isArray(value)) params.append(key, value.join(","));
        else params.append(key, String(value));
      });

      const { data } = await api.get<APIResponse<PaginatedResponse<Product>>>(
        `/products?${params.toString()}`
      );
      return data.data;
    },

  /** Get single product by slug */
  getProductBySlug: async (slug: string) => {
    const { data } = await api.get<APIResponse<{ product: Product }>>(
      `/product/${slug}`
    );
    return data.data!.product;
  },

  /** Get related products */
  getRelatedProducts: async (slug: string) => {
    const { data } = await api.get<APIResponse<{ products: Product[] }>>(`/products/${slug}/related`);
      return data.data!.products;
  },

   /** Get filter options (brands + price range) for a category */
  getFilterOptions: async (category: string) => {
    const { data } = await api.get<APIResponse<{ brands: string[]; priceRange: { min: number, max: number } }>>(`/products/filter/${category}`);
    return data.data!;
  },

  /** Get PC builder components by type (cpu, gpu, ram, etc.) */
  getPCBuilderComponents: async (
    componentType: string,
    filters: { minPrice?: number, maxPrice?: number, brand?: string[], sortBy?: string } = {}
  ) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined) return;
      if (Array.isArray(value)) params.append(key, value.join(","));
      else params.append(key, String(value));
    });

    const { data } = await axios.get<APIResponse<{ products: Product[] }>>(`/products/pc-builder/${componentType}?${params.toString()}`);
    return data.data!.products;
  },

  /** ─── Admin methods ─── */
  admin: {
    getAll: async (params: { page?: number; limit?: number; search?: string; category?: string; status?: string } = {}) => {
      const query = new URLSearchParams(params as any).toString();
      const { data } = await api.get<APIResponse<PaginatedResponse<Product>>>(
        `/admin/products?${query}`
      );
      return data.data!;
    },

    getById: async (id: string) => {
      const { data } = await api.get<APIResponse<{ product: Product }>>(
        `/admin/products/${id}`
      );
      return data.data!.product;
    },

    create: async (payload: Partial<Product>) => {
      const { data } = await api.post<APIResponse<{ product: Product }>>(
        "/admin/products",
        payload
      );
      return data.data!.product;
    },

    update: async (id: string, payload: Partial<Product>) => {
      const { data } = await api.put<APIResponse<{ product: Product }>>(
        `/admin/products/${id}`,
        payload
      );
      return data.data!.product;
    },

    delete: async (id: string) => {
      await api.delete(`/admin/products/${id}`);
    },
  },
}


export const categoryService = {
  getAll: async () => {
    const { data } = await api.get<APIResponse<{ categories: Category[] }>>("/categories");
    return data.data!.categories;
  },

  getBySlug: async (slug: string) => {
    const { data } = await api.get<APIResponse<{ category: Category }>>(`/categories/${slug}`);
    return data.data!.category;
  },

  admin: {
    getAll: async () => {
      const { data } = await api.get<APIResponse<{ categories: Category[] }>>("/admin/categories");
      return data.data!.categories;
    },
    create: async (payload: Partial<Category>) => {
      const { data } = await api.post<APIResponse<{ category: Category }>>(
        "/admin/categories",
        payload
      );
      return data.data!.category;
    },
    update: async (id: string, payload: Partial<Category>) => {
      const { data } = await api.put<APIResponse<{ category: Category }>>(
        `/admin/categories/${id}`,
        payload
      );
      return data.data!.category;
    },
    delete: async (id: string) => {
      await api.delete(`/admin/categories/${id}`);
    },
  },
}

export const uploadService = {
  uploadProductImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const { data } = await api.post<APIResponse<{ urls: string[] }>>(
      "/upload/products",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data!.urls;
  },
};