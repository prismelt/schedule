import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { languageEnum, users, userTypeEnum } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const languageSchema = z.nativeEnum(
  Object.fromEntries(languageEnum.enumValues.map((v) => [v, v])) as {
    [k in (typeof languageEnum.enumValues)[number]]: k;
  },
);

const userTypeSchema = z.nativeEnum(
  Object.fromEntries(userTypeEnum.enumValues.map((v) => [v, v])) as {
    [k in (typeof userTypeEnum.enumValues)[number]]: k;
  },
);

const userRouter = createTRPCRouter({
  setLanguage: protectedProcedure
    .input(z.object({ language: languageSchema }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ language: input.language })
        .where(eq(users.id, ctx.session.user.id));
      return { success: true };
    }),
  setUserType: protectedProcedure
    .input(z.object({ userType: userTypeSchema }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ userType: input.userType })
        .where(eq(users.id, ctx.session.user.id));
      return { success: true };
    }),
  updateName: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ name: input.name })
        .where(eq(users.id, ctx.session.user.id));
      return { success: true };
    }),
  updateEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ email: input.email })
        .where(eq(users.id, ctx.session.user.id));
      return { success: true };
    }),

  getLanguage: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });
    return user?.language;
  }),
  getUserType: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });
    return user?.userType;
  }),

  getName: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });
      return user?.name;
    }),
});

export default userRouter;
