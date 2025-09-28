import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { schedules } from "~/server/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const scheduleRouter = createTRPCRouter({
  register: protectedProcedure
    .input(
      z.object({
        date: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), "invalid date"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Parse date and normalize to start of day in local timezone
      const inputDate = new Date(input.date + "T00:00:00");
      const date = new Date(
        inputDate.getFullYear(),
        inputDate.getMonth(),
        inputDate.getDate(),
      );

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (date <= today) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot register date '${date.toLocaleDateString("en-US")}' that's in the past.`,
        });
      }

      const isExist = await ctx.db.query.schedules.findFirst({
        where: and(
          eq(schedules.userId, ctx.session.user.id),
          eq(schedules.date, date),
        ),
      });
      if (isExist) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Schedule on date '${date.toLocaleDateString("en-US")}' already exists for user '${ctx.session.user.name}'`,
        });
      }
      await ctx.db.insert(schedules).values({
        userId: ctx.session.user.id,
        date,
      });
      return { success: true };
    }),
  unregister: protectedProcedure
    .input(
      z.object({
        date: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), "invalid date"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const inputDate = new Date(input.date + "T00:00:00");
      const date = new Date(
        inputDate.getFullYear(),
        inputDate.getMonth(),
        inputDate.getDate(),
      );
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (date <= today) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot unregister date '${date.toLocaleDateString("en-US")}' that's in the past.`,
        });
      }
      const isExist = await ctx.db.query.schedules.findFirst({
        where: and(
          eq(schedules.userId, ctx.session.user.id),
          eq(schedules.date, date),
        ),
      });
      if (!isExist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Schedule on date '${date.toLocaleDateString("en-US")}' does not exist for user '${ctx.session.user.name}'`,
        });
      }
      await ctx.db
        .delete(schedules)
        .where(
          and(
            eq(schedules.userId, ctx.session.user.id),
            eq(schedules.date, date),
          ),
        );
      return { success: true };
    }),
  getAllFuture: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    return await ctx.db.query.schedules.findMany({
      where: and(
        eq(schedules.userId, ctx.session.user.id),
        gte(schedules.date, now),
      ),
      orderBy: (schedules, { asc }) => [asc(schedules.date)],
    });
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.schedules.findMany({
      where: eq(schedules.userId, ctx.session.user.id),
      orderBy: (schedules, { asc }) => [asc(schedules.date)],
    });
  }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .delete(schedules)
      .where(eq(schedules.userId, ctx.session.user.id));
    return { success: true };
  }),
});
