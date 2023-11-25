type FormErrorProp = {
  id?: string;
  messages?: string[];
};
export default function FormError({ id, messages }: FormErrorProp) {
  if (!messages) {
    return null;
  }
  return (
    <div>
      {messages.map((message) => (
        <p
          id={id}
          key={message}
          aria-live="polite"
          aria-atomic="true"
          className="mt-2 text-sm text-red-500 dark:text-red-600"
        >
          {message}
        </p>
      ))}
    </div>
  );
}
