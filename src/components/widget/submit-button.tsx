import React from "react";
import { useFormStatus } from "react-dom";

export default function SubmitButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn btn-primary" {...props} disabled={pending}>
      {pending ? <span className="loading loading-dots loading-md" /> : props.children}
    </button>
  );
}
