import { useContext } from "react";
import { ContentContext } from "@/components/contexts";

export function useContentContext() {
  const contentContext = useContext(ContentContext);
  if (!contentContext) {
    throw new Error("ContentContextが見つかりません");
  }
  return contentContext;
}
