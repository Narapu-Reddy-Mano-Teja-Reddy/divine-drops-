import type { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { productBodySchema, productQuerySchema } from "../validators/product";

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const q = productQuerySchema.parse(req.query);
    const page = q.page ?? 1;
    const limit = q.limit ?? 24;
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (q.q) {
      where.OR = [
        { nameEn: { contains: q.q, mode: "insensitive" } },
        { nameAr: { contains: q.q, mode: "insensitive" } },
        { sku: { contains: q.q, mode: "insensitive" } },
      ];
    }
    if (q.category) {
      where.category = { OR: [{ slug: q.category }, { id: q.category }] };
    }
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.price = {};
      if (q.minPrice !== undefined) where.price.gte = q.minPrice;
      if (q.maxPrice !== undefined) where.price.lte = q.maxPrice;
    }
    if (q.featured) where.isFeatured = true;
    if (q.bestSeller) where.isBestSeller = true;
    if (q.newArrival) where.isNewArrival = true;

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (q.sort === "price_asc") orderBy = { price: "asc" };
    if (q.sort === "price_desc") orderBy = { price: "desc" };
    if (q.sort === "featured") orderBy = { isFeatured: "desc" };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, reviews: { where: { isApproved: true } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      page,
      limit,
      total,
      products: items.map(serializeProduct),
    });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: req.params.id }, { sku: req.params.id }], isActive: true },
      include: { category: true, reviews: { where: { isApproved: true } } },
    });
    if (!product) throw new HttpError(404, "Product not found");
    res.json({ success: true, product: serializeProduct(product) });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = productBodySchema.parse(req.body);
    const product = await prisma.product.create({ data });
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = productBodySchema.partial().parse(req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true, message: "Product archived" });
  } catch (err) {
    next(err);
  }
}

function serializeProduct(product: {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: { toString(): string };
  discountPrice: { toString(): string } | null;
  images: string[];
  sizes: string[];
  colours: string[];
  stock: number;
  sku: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  category: { id: string; slug: string; nameEn: string; nameAr: string };
  reviews?: { rating: number }[];
}) {
  const ratings = product.reviews ?? [];
  const avg =
    ratings.length === 0
      ? 0
      : ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  return {
    id: product.id,
    nameEn: product.nameEn,
    nameAr: product.nameAr,
    descriptionEn: product.descriptionEn,
    descriptionAr: product.descriptionAr,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    images: product.images,
    sizes: product.sizes,
    colours: product.colours,
    stock: product.stock,
    sku: product.sku,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    category: product.category,
    rating: Number(avg.toFixed(1)),
    reviewCount: ratings.length,
  };
}
