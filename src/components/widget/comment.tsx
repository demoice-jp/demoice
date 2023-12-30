import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UserLink from "@/components/widget/user-link";
import { Comment as CommentType } from "@/lib/action/policy-action";
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

type CommentProp = {
  comment: CommentType;
};

export default function Comment({ comment }: CommentProp) {
  let dateString;
  const date = dayjs(comment.postedDate);
  if (date.add(30, "day").toDate() > new Date()) {
    dateString = date.fromNow();
  } else {
    dateString = date.format("YYYY年MM月DD日");
  }

  return (
    <div className="border-t border-gray-100 dark:border-gray-900">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <UserLink user={comment.author} size="small" />
          <div className="text-sm text-gray-500 dark:text-gray-400">{dateString}</div>
        </div>
        <pre className="p-2 text-sm">{comment.content}</pre>
      </div>
    </div>
  );
}
