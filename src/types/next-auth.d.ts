/* eslint-disable @typescript-eslint/no-unused-vars,unused-imports/no-unused-imports-ts */

import { JWT } from "@auth/core/jwt";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    valid: boolean;
    user?: {
      accountId: string;
    };
    provider?: {
      provider: string;
      providerAccountId: string;
    };
    expires: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    sub: string;
    iat: number;
    exp: number;
    jti: string;
    activeAccount: boolean;
    provider: string;
    providerAccountId: string;
  }
}
