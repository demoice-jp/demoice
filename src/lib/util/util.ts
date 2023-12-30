export async function swrFetcher(url: string) {
  return fetch(url).then((r) => {
    if (!r.ok) {
      throw r;
    }
    return r.json();
  });
}
