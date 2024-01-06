import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

export async function swrFetcher(url: string) {
  return fetch(url).then((r) => {
    if (!r.ok) {
      throw r;
    }
    return r.json();
  });
}

export function extendDayJsRelativeTime() {
  dayjs.extend(relativeTime, {
    thresholds: [
      { l: "s", r: 1 },
      { l: "m", r: 1 },
      { l: "mm", r: 59, d: "minute" },
      { l: "h", r: 1 },
      { l: "hh", r: 23, d: "hour" },
      { l: "d", r: 1 },
      { l: "dd", r: 29, d: "day" },
    ],
  });
  dayjs.locale("ja");
}
