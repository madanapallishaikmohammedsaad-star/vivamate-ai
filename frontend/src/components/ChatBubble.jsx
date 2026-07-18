import { Copy, User, Bot } from "lucide-react";

export default function ChatBubble({
  type,
  text,
}) {
  const isUser = type === "user";

  function copyText() {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  }

  return (
    <div
      className={`flex mb-6 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-3xl rounded-3xl p-5 shadow ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-white"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">

          {isUser ? (
            <User size={18} />
          ) : (
            <Bot size={18} />
          )}

          <strong>
            {isUser ? "You" : "VivaMate AI"}
          </strong>

        </div>

        <div className="whitespace-pre-wrap leading-8">
          {text}
        </div>

        {!isUser && (
          <button
            onClick={copyText}
            className="mt-5 flex items-center gap-2 text-sm bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"
          >
            <Copy size={16} />
            Copy
          </button>
        )}

      </div>
    </div>
  );
}
