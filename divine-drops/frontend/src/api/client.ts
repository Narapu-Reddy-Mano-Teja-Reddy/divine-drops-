import axios from "axios";
import type { BlogPost, Category, Order, Product, Review, User } from "../types";

export const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dd_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function fetchProducts(params?: Record<string, string | number | boolean | undefined>) {
  const { data } = await api.get<{ products: Product[]; total: number }>("/products", { params });
  return data;
}

export async function fetchProduct(id: string) {
  const { data } = await api.get<{ product: Product }>(`/products/${id}`);
  return data.product;
}

export async function fetchCategories() {
  const { data } = await api.get<{ categories: Category[] }>("/categories");
  return data.categories;
}

export async function fetchBlogs() {
  const { data } = await api.get<{ blogs: BlogPost[] }>("/blogs");
  return data.blogs;
}

export async function fetchBlog(id: string) {
  const { data } = await api.get<{ blog: BlogPost }>(`/blogs/${id}`);
  return data.blog;
}

export async function fetchReviews() {
  const { data } = await api.get<{ reviews: Review[] }>("/reviews");
  return data.reviews;
}

export async function subscribeNewsletter(email: string) {
  await api.post("/newsletter", { email });
}

export async function createOrder(payload: unknown) {
  const { data } = await api.post<{ order: Order }>("/orders", payload);
  return data.order;
}

export async function fetchOrder(orderNumber: string) {
  const { data } = await api.get<{ order: Order }>(`/orders/${orderNumber}`);
  return data.order;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
  localStorage.setItem("dd_token", data.token);
  return data.user;
}

export async function register(body: { fullName: string; email: string; phone?: string; password: string }) {
  const { data } = await api.post<{ token: string; user: User }>("/auth/register", body);
  localStorage.setItem("dd_token", data.token);
  return data.user;
}

export async function fetchMe() {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function fetchAdminDashboard() {
  const { data } = await api.get("/admin/dashboard");
  return data;
}

export async function fetchAdminOrders(params?: { status?: string; q?: string }) {
  const { data } = await api.get<{ orders: Order[] }>("/admin/orders", { params });
  return data.orders;
}

export async function fetchAdminOrder(id: string) {
  const { data } = await api.get<{ order: Order }>(`/admin/orders/${id}`);
  return data.order;
}

export async function patchOrderStatus(id: string, status: string) {
  const { data } = await api.patch<{ order: Order }>(`/admin/orders/${id}/status`, { status });
  return data.order;
}

export async function patchOrderNotes(id: string, adminNotes: string) {
  const { data } = await api.patch<{ order: Order }>(`/admin/orders/${id}/notes`, { adminNotes });
  return data.order;
}

export async function fetchInventory() {
  const { data } = await api.get("/admin/inventory");
  return data.products as Product[];
}

export async function fetchCustomers() {
  const { data } = await api.get("/admin/customers");
  return data.customers as Array<{
    customerPhone: string;
    customerName: string;
    customerEmail: string | null;
    governorate: string;
    area: string;
    _count: { _all: number };
    _sum: { total: number };
    _max: { createdAt: string };
  }>;
}

export function money(value: number, lang: "en" | "ar" = "en") {
  const formatted = value.toFixed(3);
  return lang === "ar" ? `${formatted} د.ك` : `KWD ${formatted}`;
}

export const GOVERNORATES = [
  { en: "Capital (Al Asimah)", ar: "العاصمة" },
  { en: "Hawalli", ar: "حولي" },
  { en: "Farwaniya", ar: "الفروانية" },
  { en: "Mubarak Al-Kabeer", ar: "مبارك الكبير" },
  { en: "Ahmadi", ar: "الأحمدي" },
  { en: "Jahra", ar: "الجهراء" },
];
