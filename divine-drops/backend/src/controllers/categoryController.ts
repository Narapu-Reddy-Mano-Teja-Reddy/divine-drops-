import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { categoryBodySchema } from "../validators/content";

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { nameEn: "asc" },
    });
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = categoryBodySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = categoryBodySchema.partial().parse(req.body);
    const category = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
}
