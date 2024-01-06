import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ja";

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

export function toRelativeDate(date: string | number | Date | dayjs.Dayjs) {
  let dateString;
  const dayJsDate = dayjs(date);
  if (dayJsDate.add(30, "day").toDate() > new Date()) {
    dateString = dayJsDate.fromNow();
  } else {
    dateString = dayJsDate.format("YYYY年MM月DD日");
  }
  return dateString;
}
