import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import userRouter from "./routers/user";
import requestRouter from "./routers/request";
import tutorViewRouter from "./routers/tutor-view";
import kidViewRouter from "./routers/kid-view";
import adminRouter from "./routers/admin";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  request: requestRouter,
  tutorView: tutorViewRouter,
  kidView: kidViewRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
