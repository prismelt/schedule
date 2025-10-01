import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { helpRequests } from "~/server/db/schema";
import { and, eq, gt, gte, lte } from "drizzle-orm";
import { z } from "zod";

const kidViewRouter = createTRPCRouter({
  getOfMonth: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const firstDay = new Date(input.year, input.month, 1);
      const lastDay = new Date(input.year, input.month + 1, 0);
      const requests = await ctx.db.query.helpRequests.findMany({
        where: and(
          eq(helpRequests.userId, ctx.session.user.id),
          gte(helpRequests.date, firstDay),
          lte(helpRequests.date, lastDay),
        ),
        orderBy: (requests, { asc }) => [asc(requests.date)],
      });
      return requests ?? [];
    }),
  getAllFuture: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const requests = await ctx.db.query.helpRequests.findMany({
      where: and(
        eq(helpRequests.userId, ctx.session.user.id),
        gt(helpRequests.date, now),
      ),
      orderBy: (requests, { asc }) => [asc(requests.date)],
    });
    return requests ?? [];
  }),
  getRequest: protectedProcedure
    .input(
      z.object({
        date: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), "invalid date"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const request = await ctx.db.query.helpRequests.findFirst({
        where: and(
          eq(helpRequests.userId, ctx.session.user.id),
          eq(helpRequests.date, new Date(input.date)),
        ),
      });
      return request ?? null;
    }),
});

export default kidViewRouter;
