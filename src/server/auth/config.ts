import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        email: { label: "Email", type: "email" },
      } satisfies Record<"username" | "email", { label: string; type: string }>,
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("No credentials provided");
        }
        if (!credentials.username || !credentials.email) {
          throw new Error("Missing username or email");
        }
        if (
          typeof credentials.username !== "string" ||
          typeof credentials.email !== "string"
        ) {
          throw new Error("Invalid username or email");
        }

        const username = credentials.username;
        const email = credentials.email;

        const user = await db.query.users.findFirst({
          where: (users, { or, eq }) =>
            or(eq(users.name, username), eq(users.email, email)),
        });

        if (user) {
          console.log("User found!!! ", user);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } else {
          const [newUser] = await db
            .insert(users)
            .values({
              name: credentials.username,
              email: credentials.email,
            })
            .returning();

          if (!newUser) {
            throw new Error("Failed to create new user");
          }

          console.log("New user created!!! ", newUser);
          return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
          };
        }
      },
    }),
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback - user:", user, "token.id before:", token.id);
      if (user) {
        token.id = user.id;
      }
      console.log("JWT callback - token.id after:", token.id);
      return token;
    },

    session: ({ session, token }) => {
      console.log("Session callback - token.id:", token.id);
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
