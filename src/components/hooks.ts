import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ContentContext } from "@/components/contexts";

export function useContentContext() {
  const contentContext = useContext(ContentContext);
  if (!contentContext) {
    throw new Error("ContentContextが見つかりません");
  }
  return contentContext;
}

export function useInfiniteLoad<T>(getUrl: (index: number, previousPageData: T | null) => string | null) {
  const fetching = useRef<boolean>(false);
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(() => {
    if (fetching.current) {
      return;
    }

    const url = getUrl(data.length, data.length === 0 ? null : data[data.length - 1]);
    fetching.current = true;
    setError(null);
    setIsLoading(true);
    if (!url) {
      fetching.current = false;
      setIsLoading(false);
      return;
    }
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw res;
        }
        res.json().then((d: T) => {
          setData((ds) => [...ds, d]);
        });
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        fetching.current = false;
        setIsLoading(false);
      });
  }, [data, getUrl]);

  useEffect(() => {
    if (data.length === 0 && isLoading) {
      fetchData();
    }
  }, [data, isLoading, fetchData]);

  const readMore = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    readMore,
  };
}
