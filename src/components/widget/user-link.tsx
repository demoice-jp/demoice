import UserAvatar from "@/components/widget/user-avatar";
import { PublicUser } from "@/lib/data/user";

type UserProp = {
  user: PublicUser;
  size: "small";
};

export default function UserLink({ user }: UserProp) {
  return (
    <div className="h-10 w-fit flex items-center gap-1.5">
      <UserAvatar user={user} />
      <span className="font-bold">{user.userName}</span>
    </div>
  );
}
