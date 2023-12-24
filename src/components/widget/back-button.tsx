"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      className="flex items-center"
      onClick={() => {
        router.back();
      }}
    >
      <span className="material-symbols-outlined">arrow_back_ios</span>
      <span className="-m-1">戻る</span>
    </button>
  );
}
