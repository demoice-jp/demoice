import prisma from "@/lib/db/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const count = await prisma.comment.count({
    where: {
      parentType: "policy",
      parentId: params.id,
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
