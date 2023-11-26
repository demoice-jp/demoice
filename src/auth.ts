import { JWT } from "@auth/core/jwt";
import Line from "@auth/core/providers/line";
import NextAuth from "next-auth";

import { NextAuthConfig } from "next-auth";

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
    jwt({ token, account, trigger }) {
      const after: JWT = {
        sub: token.sub,
        iat: token.iat,
        exp: token.exp,
        jti: token.jti,
        activeAccount: token.activeAccount,
        provider: token.provider,
        providerAccountId: token.providerAccountId,
      };

      if (trigger === "signIn" && account) {
        after.provider = account.provider;
        after.providerAccountId = account.providerAccountId;
        after.activeAccount = false;
      }

      return after;
    },
    session({ session, token }) {
      session.valid = true;
      if (!token.activeAccount) {
        session.valid = false;
        session.provider = {
          provider: token.provider,
          providerAccountId: token.providerAccountId,
        };
        session.user = undefined;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
