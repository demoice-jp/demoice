import UserLink from "@/components/widget/user-link";
import { Comment as CommentType } from "@/lib/action/policy-action";
import { toRelativeDate } from "@/lib/util/date";

type CommentProp = {
  comment: CommentType;
};

export default function Comment({ comment }: CommentProp) {
  const dateString = toRelativeDate(comment.postedDate);

  return (
    <div className="border-t border-gray-100 dark:border-gray-900">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <UserLink user={comment.author} size="small" />
          <div className="light-text">{dateString}</div>
        </div>
        <pre className="p-2 text-sm">{comment.content}</pre>
      </div>
    </div>
  );
}
