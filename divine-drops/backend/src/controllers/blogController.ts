import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { blogBodySchema } from "../validators/content";

export async function listBlogs(_req: Request, res: Response, next: NextFunction) {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, blogs });
  } catch (err) {
    next(err);
  }
}

export async function getBlog(req: Request, res: Response, next: NextFunction) {
  try {
    const blog = await prisma.blog.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isPublished: true },
    });
    if (!blog) throw new HttpError(404, "Blog not found");
    res.json({ success: true, blog });
  } catch (err) {
    next(err);
  }
}

export async function createBlog(req: Request, res: Response, next: NextFunction) {
  try {
    const data = blogBodySchema.parse(req.body);
    const blog = await prisma.blog.create({ data });
    res.status(201).json({ success: true, blog });
  } catch (err) {
    next(err);
  }
}

export async function updateBlog(req: Request, res: Response, next: NextFunction) {
  try {
    const data = blogBodySchema.partial().parse(req.body);
    const blog = await prisma.blog.update({ where: { id: req.params.id }, data });
    res.json({ success: true, blog });
  } catch (err) {
    next(err);
  }
}

export async function deleteBlog(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.blog.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function listReviews(_req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
}

export async function subscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const email = String(req.body.email ?? "").toLowerCase().trim();
    if (!email.includes("@")) throw new HttpError(400, "Valid email required");
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function settings(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.setting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({ success: true, settings: map });
  } catch (err) {
    next(err);
  }
}
