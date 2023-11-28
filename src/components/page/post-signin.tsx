"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

// ログイン失敗時にサーバー側からSignOutする手段がなく、JWTが残り、DBリクエストを送り続けてしまうので、クライアント側でSignOutする。
export default function PostSignin() {
  const { replace } = useRouter();

  useEffect(() => {
    signOut({
      redirect: false, //signOutと同時にリダイレクトするとTypeError: Response body object should not be disturbed or lockedになるため
    }).then(() => {
      replace("/auth/signin?error=NO_ACCOUNT");
    });
  }, [replace]);

  return <span className="loading loading-dots loading-lg" />;
}
