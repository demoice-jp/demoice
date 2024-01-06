import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.valid) {
    return {
      success: false,
      message: "ログイン情報がありません",
    };
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
