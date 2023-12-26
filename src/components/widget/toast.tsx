"use client";

import { Toaster } from "react-hot-toast";

export default function Toast() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: "!bg-white dark:!bg-black !text-current",
      }}
    />
  );
}
