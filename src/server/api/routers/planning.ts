import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { schedules } from "~/server/db/schema";

export const planningRouter = createTRPCRouter({
  getPartnerFutureSchedule: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });
    if (!user?.partnerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `User does not have a partner`,
      });
    }
    return await ctx.db.query.schedules.findMany({
      where: eq(schedules.userId, user.partnerId),
      orderBy: (schedules, { asc }) => [asc(schedules.date)],
    });
  }),
});
