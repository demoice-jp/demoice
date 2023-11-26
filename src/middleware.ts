import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/account/register")) {
    const session = await auth();
    if (session?.valid) {
      //登録済みのアカウントを再登録したケース
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signup";
      url.search = "error=DUPLICATED_ACCOUNT";
      const response = NextResponse.redirect(url);
      response.cookies.delete("next-auth.session-token");
      return response;
    }
  }
}

export const config = {
  matcher: ["/auth/signup", "/account/register"],
};
