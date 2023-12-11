import { fillContent } from "@/lib/data/content";

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

  const result = await fillContent({
    ...requestJson,
    id: params.id,
  });

  if (!result.success) {
    switch (result.errorType) {
      case "NoLogin":
        return Response.json(
          {
            message: "ログイン情報がありません",
          },
          {
            status: 401,
          },
        );
      case "InvalidId":
        return Response.json(
          {
            message: "コンテンツIDが不正です",
          },
          {
            status: 400,
          },
        );
      case "ParseError":
        return Response.json(
          {
            message: result.message,
          },
          {
            status: 400,
          },
        );
      default:
        throw new Error("fillContent時のエラーケースの実装漏れ");
    }
  }

  return Response.json({
    updated: result.updated,
  });
}
