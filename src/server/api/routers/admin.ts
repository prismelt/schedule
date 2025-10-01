import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { helpRequests, users } from "~/server/db/schema";
import { eq, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const adminRouter = createTRPCRouter({
  authenticate: publicProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input }) => {
      if (input.password !== "password123") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid admin password",
        });
      }
      return { success: true };
    }),

  getAllRequests: publicProcedure
    .input(z.object({ password: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.password !== "password123") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid admin password",
        });
      }

      const requests = await ctx.db.query.helpRequests.findMany({
        orderBy: (requests, { asc }) => [asc(requests.date)],
      });

      const now = new Date();
      const pastRequests = requests.filter((req) => req.date < now);
      const futureRequests = requests.filter((req) => req.date >= now);

      return { pastRequests, futureRequests };
    }),

  getAllUsers: publicProcedure
    .input(z.object({ password: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.password !== "password123") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid admin password",
        });
      }

      const allUsers = await ctx.db.query.users.findMany({
        orderBy: (users, { asc }) => [asc(users.name)],
      });

      return allUsers;
    }),

  deleteRequest: publicProcedure
    .input(
      z.object({
        password: z.string(),
        requestId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.password !== "password123") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid admin password",
        });
      }

      await ctx.db
        .delete(helpRequests)
        .where(eq(helpRequests.id, input.requestId));
      return { success: true };
    }),

  deleteUser: publicProcedure
    .input(
      z.object({
        password: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.password !== "password123") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid admin password",
        });
      }

      // Delete user's requests first
      await ctx.db
        .delete(helpRequests)
        .where(eq(helpRequests.userId, input.userId));
      // Delete user
      await ctx.db.delete(users).where(eq(users.id, input.userId));
      return { success: true };
    }),

  deletePastRequests: publicProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.password !== "password123") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid admin password",
        });
      }

      const now = new Date();
      await ctx.db.delete(helpRequests).where(lt(helpRequests.date, now));
      return { success: true };
    }),
});

export default adminRouter;
