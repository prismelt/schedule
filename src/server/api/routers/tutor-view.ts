import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { helpRequests, users } from "~/server/db/schema";
import { and, eq, gt, arrayContains } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const tutorViewRouter = createTRPCRouter({
  getAllTutorFutureView: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const requests = await ctx.db.query.helpRequests.findMany({
      where: and(
        arrayContains(helpRequests.fulfillerIdArray, [ctx.session.user.id]),
        gt(helpRequests.date, now),
      ),
      orderBy: (requests, { asc }) => [asc(requests.date)],
    });
    return requests ?? [];
  }),

  getAllRequestsAbsolute: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db.query.helpRequests.findMany({
      orderBy: (requests, { asc }) => [asc(requests.date)],
    });
    return requests ?? [];
  }),

  getAllFutureRequestAbsolute: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const requests = await ctx.db.query.helpRequests.findMany({
      where: and(gt(helpRequests.date, now)),
      orderBy: (requests, { asc }) => [asc(requests.date)],
    });
    return requests ?? [];
  }),

  getAllFutureRequestRelative: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const tutor = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });
    if (!tutor) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Tutor does not exist`,
      });
    }
    if (!tutor.language || !tutor.userType) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Tutor is not fully set up`,
      });
    }
    if (tutor.userType !== "tutor") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Only tutors can view requests`,
      });
    }
    const tutorLanguage = tutor.language;
    const requests = await ctx.db.query.helpRequests.findMany({
      where: and(
        gt(helpRequests.date, now),
        eq(helpRequests.language, tutorLanguage),
      ),
      orderBy: (requests, { asc }) => [asc(requests.date)],
    });
    return requests ?? [];
  }),
});

export default tutorViewRouter;
