import React from "react";
import { useFormStatus } from "react-dom";

export default function SubmitCancelButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();

  if (pending) {
    return null;
  }

  return (
    <button className="btn" {...props}>
      {props.children}
    </button>
  );
}
