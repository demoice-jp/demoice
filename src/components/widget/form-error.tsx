type FormErrorProp = {
  id?: string;
  messages?: string[] | string;
};
export default function FormError({ id, messages }: FormErrorProp) {
  if (!messages || messages.length === 0) {
    return null;
  }

  let messageArray;
  if (typeof messages === "string") {
    messageArray = [messages];
  } else {
    messageArray = messages;
  }

  return (
    <div>
      {messageArray.map((message) => (
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
