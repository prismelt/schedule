import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { helpRequests } from "~/server/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";

const kidViewRouter = createTRPCRouter({
  getAllFuture: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    return await ctx.db.query.helpRequests.findMany({
      where: and(
        eq(helpRequests.userId, ctx.session.user.id),
        gt(helpRequests.date, now),
      ),
      orderBy: (requests, { asc }) => [asc(requests.date)],
    });
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
      return await ctx.db.query.helpRequests.findFirst({
        where: and(
          eq(helpRequests.userId, ctx.session.user.id),
          eq(helpRequests.date, new Date(input.date)),
        ),
      });
    }),
});

export default kidViewRouter;
