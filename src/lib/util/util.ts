import { NextRequest } from "next/server";

export async function swrFetcher(url: string) {
  return fetch(url).then((r) => {
    if (!r.ok) {
      throw r;
    }
    return r.json();
  });
}

export function getPageParam(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestedPage = searchParams.get("page");
  let page = 0;
  try {
    if (requestedPage) {
      page = Number.parseInt(requestedPage);
    }
  } catch (e) {}
  return page;
}
