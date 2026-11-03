import { z } from "zod";

export const categoryBodySchema = z.object({
  slug: z.string().min(2),
  nameEn: z.string().min(2),
  nameAr: z.string().min(2),
  image: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const blogBodySchema = z.object({
  slug: z.string().min(2),
  titleEn: z.string().min(2),
  titleAr: z.string().min(2),
  excerptEn: z.string().min(2),
  excerptAr: z.string().min(2),
  contentEn: z.string().min(2),
  contentAr: z.string().min(2),
  coverImage: z.string().url(),
  isPublished: z.boolean().optional(),
});
