import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { helpRequests, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const requestRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        date: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), "invalid date"),
        subject: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User does not exist`,
        });
      }
      if (!user.userType || !user.language) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `User type is not set, set the user type before creating a help request`,
        });
      }

      if (user.userType !== "kid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Only kids can create help requests`,
        });
      }

      await ctx.db.insert(helpRequests).values({
        userId: ctx.session.user.id,
        fulfilled: false,
        date: new Date(input.date),
        subject: input.subject,
        language: user.language,
      });
      return { success: true };
    }),

  respond: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User does not exist`,
        });
      }
      if (!user.userType) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `User type is not set, set the user type before responding to a help request`,
        });
      }
      if (user.userType !== "tutor") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Only tutors can respond to help requests`,
        });
      }
      await ctx.db
        .update(helpRequests)
        .set({ fulfillerId: ctx.session.user.id, fulfilled: true })
        .where(eq(helpRequests.id, input.requestId));
      return { success: true };
    }),

  unrespond: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.query.helpRequests.findFirst({
        where: eq(helpRequests.id, input.requestId),
      });
      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Request does not exist`,
        });
      }
      if (request.fulfillerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You are not authorized to unrespond to this request`,
        });
      }
      await ctx.db
        .update(helpRequests)
        .set({ fulfillerId: null, fulfilled: false })
        .where(eq(helpRequests.id, input.requestId));
      return { success: true };
    }),
  delete: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.query.helpRequests.findFirst({
        where: eq(helpRequests.id, input.requestId),
      });
      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Request does not exist`,
        });
      }
      if (request.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You are not authorized to delete this request`,
        });
      }
      await ctx.db
        .delete(helpRequests)
        .where(eq(helpRequests.id, input.requestId));
      return { success: true };
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .delete(helpRequests)
      .where(eq(helpRequests.userId, ctx.session.user.id));
    return { success: true };
  }),

  clearHelpRespond: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(helpRequests)
      .set({ fulfillerId: null, fulfilled: false })
      .where(eq(helpRequests.fulfillerId, ctx.session.user.id));
    return { success: true };
  }),

  update: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
        subject: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.query.helpRequests.findFirst({
        where: eq(helpRequests.id, input.requestId),
      });
      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Request does not exist`,
        });
      }
      if (request.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You are not authorized to update this request`,
        });
      }
      await ctx.db
        .update(helpRequests)
        .set({ subject: input.subject })
        .where(eq(helpRequests.id, input.requestId));
      return { success: true };
    }),
});

export default requestRouter;
