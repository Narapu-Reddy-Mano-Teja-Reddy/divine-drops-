import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { loginSchema, registerSchema } from "../validators/auth";

function signToken(user: { id: string; email: string; role: "CUSTOMER" | "ADMIN" }) {
  const payload = { userId: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (exists) throw new HttpError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        passwordHash,
        role: "CUSTOMER",
      },
    });

    const token = signToken(user);
    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Authentication required");
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) throw new HttpError(404, "User not found");
    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}
