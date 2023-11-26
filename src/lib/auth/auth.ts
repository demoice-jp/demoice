import { JWT } from "@auth/core/jwt";
import Line from "@auth/core/providers/line";
import NextAuth from "next-auth";

import { NextAuthConfig } from "next-auth";
import IdProvider from "@/lib/data/id-provider";
import prisma from "@/lib/orm/client";

export const config = {
  providers: [
    Line({
      checks: ["pkce", "state"],
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  callbacks: {
    async jwt({ token, account, trigger }) {
      const after: JWT = {
        sub: token.sub,
        iat: token.iat,
        exp: token.exp,
        jti: token.jti,
        activeAccount: token.activeAccount,
        accountId: token.accountId,
        provider: token.provider,
        providerAccountId: token.providerAccountId,
      };

      if (trigger === "signIn" && account) {
        try {
          after.provider = IdProvider.validateProviderId(account.provider);
          after.providerAccountId = account.providerAccountId;
        } catch (e) {
          console.error(e);
        }
        after.activeAccount = false;
      }

      if (!after.activeAccount) {
        const loggedInUser = await prisma.user.findFirst({
          where: {
            idProvider: {
              some: {
                provider: after.provider,
                providerId: after.providerAccountId,
              },
            },
          },
        });
        if (loggedInUser) {
          after.accountId = loggedInUser.id;
          after.activeAccount = true;
        }
      }

      return after;
    },
    session({ session, token }) {
      session.valid = false;
      if (token.provider && token.providerAccountId) {
        if (!token.activeAccount) {
          session.provider = {
            provider: token.provider,
            providerAccountId: token.providerAccountId,
          };
        } else {
          console.error("Provider info is not found in the token.");
          delete session.provider;
        }
        delete session.user;
      } else {
        if (token.accountId) {
          session.user = {
            accountId: token.accountId,
          };
          session.valid = true;
        } else {
          console.error("Account info is not found in the token.");
        }
        delete session.provider;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
