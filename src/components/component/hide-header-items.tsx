"use client";

import React from "react";
import { usePathname } from "next/navigation";

const NOT_DISPLAY_PATH = ["/auth/signup", "/auth/signin", "/auth/post-signin", "/account/register"];

type HideHeaderItemsProp = {
  children: React.ReactNode;
};

export default function HideHeaderItems({ children }: HideHeaderItemsProp) {
  const pathName = usePathname();

  if (NOT_DISPLAY_PATH.includes(pathName)) {
    return null;
  }

  return <>{children}</>;
}
