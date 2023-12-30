import React from "react";
import { User } from "@prisma/client";
import Image from "next/image";
import NoAvatar from "@/asset/no_avatar.svg";

type UserAvatarProp = {
  user: Pick<User, "id" | "avatar">;
  size?: 128 | 64 | 32;
};

export default function UserAvatar({ user, size }: UserAvatarProp) {
  let img;
  if (user.avatar) {
    const avatarSize = size || 64;
    // eslint-disable-next-line @next/next/no-img-element
    img = <img src={`/media/user-image/${user.id}/avatar/${user.avatar}/avatar${avatarSize}.png`} alt="アバター" />;
  } else {
    img = <Image src={NoAvatar} alt="アバター" />;
  }

  return (
    <div className="avatar h-full w-full max-h-full max-w-full">
      <div className="rounded-full overflow-hidden">{img}</div>
    </div>
  );
}
