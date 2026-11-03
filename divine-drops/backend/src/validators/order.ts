import { z } from "zod";

const kuwaitPhone = z
  .string()
  .regex(/^(?:\+965|00965|965)?[569]\d{7}$/, "Enter a valid Kuwait phone number");

export const createOrderSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: kuwaitPhone,
  customerEmail: z.string().email().optional().or(z.literal("")),
  governorate: z.string().min(2),
  area: z.string().min(2),
  block: z.string().min(1),
  street: z.string().min(1),
  buildingNumber: z.string().min(1),
  deliveryInstructions: z.string().max(500).optional().or(z.literal("")),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(20),
        selectedSize: z.string().optional().nullable(),
        selectedColour: z.string().optional().nullable(),
      }),
    )
    .min(1),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export const orderNotesSchema = z.object({
  adminNotes: z.string().max(2000),
});
