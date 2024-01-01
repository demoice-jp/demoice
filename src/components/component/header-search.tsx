"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function HeaderSearch() {
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") || "";
  const router = useRouter();

  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam);
    }
  }, [queryParam]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams({
      query: query,
      order: "score",
    });
    router.push(`/policy/search?${params.toString()}`);
  };
  return (
    <div className="flex items-center">
      <form onSubmit={onSubmit} className="hidden sm:block">
        <div className="relative">
          <input
            name="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input input-bordered h-8 pr-8"
            placeholder="検索"
            autoComplete="off"
          />
          <button type="submit" className="absolute right-0 top-0 mt-1 mr-1">
            <span className="material-symbols-outlined text-base-content/20">search</span>
          </button>
        </div>
      </form>
      <div className="block sm:hidden">
        <button
          type="button"
          onClick={() => {
            if (document) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              (document.getElementById("header-search_dialog") as HTMLFormElement)?.showModal();
            }
          }}
          className="btn btn-xs btn-ghost rounded-full"
        >
          <span className="material-symbols-outlined">search</span>
        </button>
        <dialog id="header-search_dialog" className="modal">
          <div className="modal-box absolute top-0 left-0 w-full max-w-full h-14 py-0">
            <form
              onSubmit={(e) => {
                onSubmit(e);
                if (document) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  (document.getElementById("header-search_dialog") as HTMLFormElement)?.close();
                }
              }}
              className="flex items-center h-full"
            >
              <div className="relative mx-auto w-full">
                <input
                  name="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input input-bordered h-8 pr-8 w-full"
                  placeholder="検索"
                  autoComplete="off"
                />
                <button type="submit" className="absolute right-0 top-0 mt-1 mr-1">
                  <span className="material-symbols-outlined text-base-content/20">search</span>
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
}
