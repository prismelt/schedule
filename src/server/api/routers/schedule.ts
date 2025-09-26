import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { schedules } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
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
      const date = new Date(input.date);
      const now = new Date();
      if (date <= now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot register date '${date.toISOString()}' that's in the past.`,
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
      const date = new Date(input.date);
      const now = new Date();
      if (date <= now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot unregister date '${date.toISOString()}' that's in the past.`,
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
          message: `Schedule on date '${date.toISOString()}' does not exist for user '${ctx.session.user.id}'`,
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
});
