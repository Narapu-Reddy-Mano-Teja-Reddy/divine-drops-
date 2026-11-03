import { OrderStatus, Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { generateOrderNumber } from "../utils/orderNumber";
import { createOrderSchema, orderNotesSchema, orderStatusSchema } from "../validators/order";

const CONFIRMED_STATUSES: OrderStatus[] = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

async function getDeliverySettings() {
  const [fee, threshold] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "deliveryFee" } }),
    prisma.setting.findUnique({ where: { key: "freeDeliveryThreshold" } }),
  ]);
  return {
    deliveryFee: Number(fee?.value ?? 2),
    freeThreshold: Number(threshold?.value ?? 50),
  };
}

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createOrderSchema.parse(req.body);
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== new Set(productIds).size) {
      throw new HttpError(400, "One or more products are invalid");
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const itemsData = data.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new HttpError(400, "Invalid product");
      if (product.stock < item.quantity) {
        throw new HttpError(400, `Insufficient stock for ${product.nameEn}`);
      }
      if (product.sizes.length && item.selectedSize && !product.sizes.includes(item.selectedSize)) {
        throw new HttpError(400, `Invalid size for ${product.nameEn}`);
      }
      if (product.colours.length && item.selectedColour && !product.colours.includes(item.selectedColour)) {
        throw new HttpError(400, `Invalid colour for ${product.nameEn}`);
      }
      const unit = Number(product.discountPrice ?? product.price);
      const line = unit * item.quantity;
      subtotal += line;
      return {
        productId: product.id,
        productNameEn: product.nameEn,
        productNameAr: product.nameAr,
        quantity: item.quantity,
        selectedSize: item.selectedSize ?? null,
        selectedColour: item.selectedColour ?? null,
        unitPrice: new Prisma.Decimal(unit.toFixed(3)),
        subtotal: new Prisma.Decimal(line.toFixed(3)),
      };
    });

    const settings = await getDeliverySettings();
    const deliveryFee = subtotal >= settings.freeThreshold ? 0 : settings.deliveryFee;
    const total = subtotal + deliveryFee;

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          governorate: data.governorate,
          area: data.area,
          block: data.block,
          street: data.street,
          buildingNumber: data.buildingNumber,
          deliveryInstructions: data.deliveryInstructions || null,
          subtotal: new Prisma.Decimal(subtotal.toFixed(3)),
          deliveryFee: new Prisma.Decimal(deliveryFee.toFixed(3)),
          total: new Prisma.Decimal(total.toFixed(3)),
          currency: "KWD",
          orderStatus: "PENDING",
          paymentMethod: "CASH_ON_DELIVERY",
          paymentStatus: "UNPAID",
          items: { create: itemsData },
        },
        include: { items: true },
      });
      return created;
    });

    res.status(201).json({ success: true, order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
}

export async function getOrderByNumber(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { items: true },
    });
    if (!order) throw new HttpError(404, "Order not found");
    res.json({ success: true, order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
}

export async function listAdminOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, q } = req.query;
    const where: Prisma.OrderWhereInput = {};
    if (typeof status === "string" && status !== "ALL") {
      where.orderStatus = status as OrderStatus;
    }
    if (typeof q === "string" && q.trim()) {
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q, mode: "insensitive" } },
      ];
    }
    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, orders: orders.map(serializeOrder) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!order) throw new HttpError(404, "Order not found");
    res.json({ success: true, order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = orderStatusSchema.parse(req.body);
    const existing = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!existing) throw new HttpError(404, "Order not found");

    const nextConfirmed = CONFIRMED_STATUSES.includes(status);
    const wasConfirmed = existing.inventoryAdjusted;

    const order = await prisma.$transaction(async (tx) => {
      if (nextConfirmed && !wasConfirmed) {
        for (const item of existing.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stock < item.quantity) {
            throw new HttpError(400, `Insufficient stock for ${item.productNameEn}`);
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      if (status === "CANCELLED" && wasConfirmed) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id: existing.id },
        data: {
          orderStatus: status,
          inventoryAdjusted: status === "CANCELLED" ? false : nextConfirmed || wasConfirmed,
          paymentStatus: status === "DELIVERED" ? "PAID" : existing.paymentStatus,
        },
        include: { items: true },
      });
    });

    res.json({ success: true, order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const { adminNotes } = orderNotesSchema.parse(req.body);
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { adminNotes },
      include: { items: true },
    });
    res.json({ success: true, order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
}

export async function exportOrdersCsv(_req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    const header = [
      "OrderNumber",
      "Status",
      "Customer",
      "Phone",
      "Email",
      "Governorate",
      "Area",
      "TotalKWD",
      "Payment",
      "CreatedAt",
    ];
    const rows = orders.map((o) =>
      [
        o.orderNumber,
        o.orderStatus,
        `"${o.customerName}"`,
        o.customerPhone,
        o.customerEmail ?? "",
        o.governorate,
        o.area,
        Number(o.total).toFixed(3),
        o.paymentMethod,
        o.createdAt.toISOString(),
      ].join(","),
    );
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=divine-drops-orders.csv");
    res.send([header.join(","), ...rows].join("\n"));
  } catch (err) {
    next(err);
  }
}

function serializeOrder(order: {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  governorate: string;
  area: string;
  block: string;
  street: string;
  buildingNumber: string;
  deliveryInstructions: string | null;
  subtotal: { toString(): string };
  deliveryFee: { toString(): string };
  total: { toString(): string };
  currency: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId: string;
    productNameEn: string;
    productNameAr: string;
    quantity: number;
    selectedSize: string | null;
    selectedColour: string | null;
    unitPrice: { toString(): string };
    subtotal: { toString(): string };
  }>;
}) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })),
  };
}
