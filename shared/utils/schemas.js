import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
});

export const transactionSchema = z.object({
  accountId: z.string().uuid(),
  type: z.enum(["EXPENSE", "INCOME", "TRANSFER", "INVESTMENT"]),
  amountPaise: z.number().int().positive(),
  categoryId: z.string().uuid().optional(),
  note: z.string().max(500).optional(),
  receiptUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  date: z.string().datetime(),
  splits: z.array(
    z.object({
      categoryId: z.string().uuid(),
      amountPaise: z.number().int().positive()
    })
  ).optional()
});

export const authRegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  currencyPreference: z.string().min(3).max(3).default("INR"),
  timezone: z.string().default("Asia/Kolkata")
});

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72)
});
