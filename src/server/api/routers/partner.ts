import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const partnerRouter = createTRPCRouter({
  hasPartner: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });
    return user?.partnerId !== null;
  }),
  getPartner: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });
    return user?.partnerName;
  }),
  getPartnerId: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });
    return user?.partnerId;
  }),
  setPartner: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.name === ctx.session.user.name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot partner with yourself",
        });
      }

      const partner = await ctx.db.query.users.findFirst({
        where: eq(users.name, input.name),
      });
      if (!partner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Partner '${input.name}' does not exist`,
        });
      }
      if (partner.partnerId !== null || partner.partnerName !== null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Partner '${input.name}' already has a partner`,
        });
      }
      await ctx.db
        .update(users)
        .set({
          partnerId: partner.id,
          partnerName: partner.name,
        })
        .where(eq(users.id, ctx.session.user.id));

      await ctx.db
        .update(users)
        .set({
          partnerId: ctx.session.user.id,
          partnerName: ctx.session.user.name,
        })
        .where(eq(users.id, partner.id));

      return { success: true };
    }),

  removePartner: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });
    if (!user?.partnerId || !user?.partnerName) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `User does not have a partner`,
      });
    }
    await ctx.db
      .update(users)
      .set({
        partnerId: null,
        partnerName: null,
      })
      .where(eq(users.id, user.partnerId));
    await ctx.db
      .update(users)
      .set({
        partnerId: null,
        partnerName: null,
      })
      .where(eq(users.id, ctx.session.user.id));

    return { success: true };
  }),
  changeUsername: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.name, input.name),
      });
      if (existingUser && existingUser.id !== ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Username '${input.name}' is already taken`,
        });
      }

      await ctx.db
        .update(users)
        .set({ name: input.name })
        .where(eq(users.id, ctx.session.user.id));

      // Update partner's partnerName if they have this user as partner
      const partner = await ctx.db.query.users.findFirst({
        where: eq(users.partnerId, ctx.session.user.id),
      });
      if (partner) {
        await ctx.db
          .update(users)
          .set({ partnerName: input.name })
          .where(eq(users.id, partner.id));
      }

      return { success: true };
    }),
});
