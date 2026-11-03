export type Lang = "en" | "ar";

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  image?: string | null;
}

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  sizes: string[];
  colours: string[];
  stock: number;
  sku: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  rating: number;
  reviewCount: number;
  category: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColour?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  contentEn: string;
  contentAr: string;
  coverImage: string;
  createdAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  commentEn: string;
  commentAr: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productNameEn: string;
  productNameAr: string;
  quantity: number;
  selectedSize?: string | null;
  selectedColour?: string | null;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  governorate: string;
  area: string;
  block: string;
  street: string;
  buildingNumber: string;
  deliveryInstructions?: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: "CUSTOMER" | "ADMIN";
}
