import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";

const sipPlanSchema = z.object({
  fundName: z.string().min(2),
  amountPaise: z.coerce.number().int().positive(),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY"),
  nextDue: z.string().datetime(),
  accountId: z.string().uuid().optional().nullable(),
  platform: z.enum(["Zerodha", "Groww", "Dhan"]).default("Zerodha"),
  type: z.enum(["SIP", "LUMPSUM"]).default("SIP"),
  active: z.boolean().default(true)
});

const actionSchema = z.object({
  note: z.string().optional(),
  snoozeDays: z.coerce.number().int().min(1).max(31).default(3)
});

const addNextDue = (date, frequency) => {
  const next = new Date(date);
  if (frequency === "QUARTERLY") next.setMonth(next.getMonth() + 3);
  else if (frequency === "YEARLY") next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
};

const buildTransactionNote = (plan, actionLabel) => `SIP Plan: ${plan.fundName} | Platform: ${plan.platform} | ${plan.type} | ${actionLabel}`;

export const listSipPlans = async (req, res, next) => {
  try {
    const items = await prisma.sipPlan.findMany({
      where: { userId: req.user.sub },
      include: {
        account: { select: { id: true, name: true, type: true } },
        executions: { orderBy: { executedAt: "desc" }, take: 5 }
      },
      orderBy: [{ active: "desc" }, { nextDue: "asc" }]
    });

    return ok(res, items);
  } catch (error) {
    return next(error);
  }
};

export const createSipPlan = async (req, res, next) => {
  try {
    const body = sipPlanSchema.parse(req.body);
    const item = await prisma.sipPlan.create({
      data: {
        ...body,
        userId: req.user.sub,
        nextDue: new Date(body.nextDue)
      },
      include: { account: true, executions: true }
    });
    return ok(res, item, 201);
  } catch (error) {
    return next(error);
  }
};

export const updateSipPlan = async (req, res, next) => {
  try {
    const body = sipPlanSchema.partial().parse(req.body);
    const data = {
      ...body,
      ...(body.nextDue ? { nextDue: new Date(body.nextDue) } : {})
    };

    const item = await prisma.sipPlan.update({
      where: { id: req.params.id, userId: req.user.sub },
      data,
      include: { account: true, executions: true }
    });
    return ok(res, item);
  } catch (error) {
    return next(error);
  }
};

export const deleteSipPlan = async (req, res, next) => {
  try {
    await prisma.sipPlan.delete({
      where: { id: req.params.id, userId: req.user.sub }
    });
    return ok(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
};

export const markSipPaid = async (req, res, next) => {
  try {
    const body = actionSchema.parse(req.body);
    const plan = await prisma.sipPlan.findUnique({
      where: { id: req.params.id, userId: req.user.sub },
      include: { account: true }
    });

    if (!plan) throw new Error("SIP plan not found");

    let debitAccountId = plan.accountId || plan.account?.id || null;
    if (!debitAccountId) {
      const fallbackAccount = await prisma.account.findFirst({
        where: { userId: req.user.sub },
        orderBy: { createdAt: "asc" }
      });

      if (fallbackAccount) {
        debitAccountId = fallbackAccount.id;
      } else {
        const createdAccount = await prisma.account.create({
          data: {
            userId: req.user.sub,
            name: "Main Wallet",
            type: "WALLET",
            balancePaise: 0
          }
        });
        debitAccountId = createdAccount.id;
      }
    }

    const nextDue = addNextDue(plan.nextDue, plan.frequency);

    const result = await prisma.$transaction(async (tx) => {
      let category = await tx.category.findFirst({
        where: { userId: req.user.sub, name: "Mutual Fund", type: "INVESTMENT" }
      });

      if (!category) {
        category = await tx.category.create({
          data: { userId: req.user.sub, name: "Mutual Fund", type: "INVESTMENT" }
        });
      }

      const transaction = await tx.transaction.create({
        data: {
          userId: req.user.sub,
          accountId: debitAccountId,
          categoryId: category.id,
          type: "INVESTMENT",
          amountPaise: plan.amountPaise,
          date: new Date(plan.nextDue),
          description: plan.fundName,
          note: buildTransactionNote(plan, body.note || "SIP Confirmed")
        }
      });

      const mutualFund = await tx.mutualFund.create({
        data: {
          userId: req.user.sub,
          fundName: plan.fundName,
          sipAmountPaise: plan.amountPaise,
          type: plan.type,
          platform: plan.platform,
          syncTxId: transaction.id,
          date: new Date(plan.nextDue)
        }
      });

      const execution = await tx.sipExecution.create({
        data: {
          userId: req.user.sub,
          sipPlanId: plan.id,
          transactionId: transaction.id,
          mutualFundId: mutualFund.id,
          status: "PAID",
          amountPaise: plan.amountPaise,
          note: body.note || null,
          executedAt: new Date()
        }
      });

      const updatedPlan = await tx.sipPlan.update({
        where: { id: plan.id },
        data: { nextDue, active: true }
      });

      return { transaction, mutualFund, execution, updatedPlan };
    });

    return ok(res, result);
  } catch (error) {
    return next(error);
  }
};

export const skipSip = async (req, res, next) => {
  try {
    const body = actionSchema.parse(req.body);
    const plan = await prisma.sipPlan.findUnique({
      where: { id: req.params.id, userId: req.user.sub }
    });

    if (!plan) throw new Error("SIP plan not found");

    const nextDue = addNextDue(plan.nextDue, plan.frequency);

    const result = await prisma.$transaction(async (tx) => {
      const execution = await tx.sipExecution.create({
        data: {
          userId: req.user.sub,
          sipPlanId: plan.id,
          status: "SKIPPED",
          amountPaise: plan.amountPaise,
          note: body.note || null,
          executedAt: new Date()
        }
      });

      const updatedPlan = await tx.sipPlan.update({
        where: { id: plan.id },
        data: { nextDue }
      });

      return { execution, updatedPlan };
    });

    return ok(res, result);
  } catch (error) {
    return next(error);
  }
};

export const snoozeSip = async (req, res, next) => {
  try {
    const body = actionSchema.parse(req.body);
    const plan = await prisma.sipPlan.findUnique({
      where: { id: req.params.id, userId: req.user.sub }
    });

    if (!plan) throw new Error("SIP plan not found");

    const snoozedNextDue = new Date(plan.nextDue);
    snoozedNextDue.setDate(snoozedNextDue.getDate() + body.snoozeDays);

    const result = await prisma.$transaction(async (tx) => {
      const execution = await tx.sipExecution.create({
        data: {
          userId: req.user.sub,
          sipPlanId: plan.id,
          status: "SNOOZED",
          amountPaise: plan.amountPaise,
          note: body.note || null,
          executedAt: new Date()
        }
      });

      const updatedPlan = await tx.sipPlan.update({
        where: { id: plan.id },
        data: { nextDue: snoozedNextDue }
      });

      return { execution, updatedPlan };
    });

    return ok(res, result);
  } catch (error) {
    return next(error);
  }
};