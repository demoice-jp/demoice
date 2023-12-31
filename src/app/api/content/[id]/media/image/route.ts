import z from "zod";
import { auth } from "@/lib/auth/auth";
import { saveContentImage } from "@/lib/data/image";
import prisma from "@/lib/db/prisma";

export type ImagePostResponse = {
  location: string;
};

export type ImagePostError = {
  message: string;
};

const postSchema = z.object({
  image: z.string().max(2_000_000),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.valid) {
    return Response.json(
      {
        message: "ログインして下さい",
      },
      {
        status: 401,
      },
    );
  }

  const content = await prisma.content.findUnique({
    select: {
      id: true,
    },
    where: {
      id: params.id,
      authorId: session.user!.accountId,
    },
  });
  if (!content) {
    return Response.json(
      {
        message: "アップロード先のコンテンツが見つかりません",
      },
      {
        status: 400,
      },
    );
  }

  let requestJson;
  try {
    requestJson = await request.json();
  } catch (e) {
    return Response.json(
      {
        message: "リクエスト形式が不正です",
      },
      {
        status: 400,
      },
    );
  }

  const parsedBody = postSchema.safeParse(requestJson);
  if (!parsedBody.success) {
    return Response.json(
      {
        message: "リクエストをパースできません",
      },
      {
        status: 400,
      },
    );
  }

  const result = await saveContentImage(params.id, parsedBody.data.image);
  if (!result.success) {
    return Response.json(
      {
        message: result.message,
      },
      {
        status: result.type === "InputError" ? 400 : 500,
      },
    );
  }

  return Response.json({
    location: result.location,
  });
}
