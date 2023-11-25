import React from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProp = {
  children?: React.ReactNode;
};

export default function SubmitButton({ children }: SubmitButtonProp) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? <span className="loading loading-dots loading-md" /> : children}
    </button>
  );
}
