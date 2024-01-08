import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.valid) {
    return Response.json(
      {
        success: false,
        message: "ログイン情報がありません",
      },
      {
        status: 401,
      },
    );
  }

  const count = await prisma.policyVote.count({
    where: {
      voterId: session.user!.accountId,
    },
  });

  return Response.json(
    {
      count,
    },
    {
      status: 200,
    },
  );
}
