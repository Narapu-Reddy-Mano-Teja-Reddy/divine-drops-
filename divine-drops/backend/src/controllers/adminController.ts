import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function dashboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalOrders,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      sales,
      products,
      lowStock,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: "PENDING" } }),
      prisma.order.count({ where: { orderStatus: "CONFIRMED" } }),
      prisma.order.count({ where: { orderStatus: "PROCESSING" } }),
      prisma.order.count({ where: { orderStatus: "SHIPPED" } }),
      prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
      prisma.order.count({ where: { orderStatus: "CANCELLED" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { orderStatus: { not: "CANCELLED" } },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: 5 } },
        orderBy: { stock: "asc" },
        take: 20,
        include: { category: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { items: true },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pending,
        confirmed,
        processing,
        shipped,
        delivered,
        cancelled,
        totalSales: Number(sales._sum.total ?? 0),
        productCount: products,
        lowStockCount: lowStock.length,
      },
      lowStock,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
}

export async function inventory(_req: Request, res: Response, next: NextFunction) {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { stock: "asc" },
    });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
}

export async function customers(_req: Request, res: Response, next: NextFunction) {
  try {
    const grouped = await prisma.order.groupBy({
      by: ["customerPhone", "customerName", "customerEmail", "governorate", "area"],
      _count: { _all: true },
      _sum: { total: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
    });
    res.json({ success: true, customers: grouped });
  } catch (err) {
    next(err);
  }
}
