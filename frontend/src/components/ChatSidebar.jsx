import { Plus, MessageSquare, Trash2 } from "lucide-react";

export default function ChatSidebar({
  chats = [],
  currentChat,
  setCurrentChat,
  createNewChat,
  deleteChat,
}) {
  return (
    <aside className="w-full md:w-72 shrink-0 bg-white border-r flex flex-col min-h-0">
      <div className="p-4 border-b">
        <button
          type="button"
          onClick={createNewChat}
          className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
        >
          <Plus size={18} aria-hidden="true" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" aria-label="Saved chats">
        {chats.length === 0 ? (
          <div className="p-5 text-sm text-gray-500 text-center">
            No chats yet. Start a new conversation.
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center gap-2 px-4 py-3 border-b border-gray-100 ${
                currentChat === chat.id ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <button
                type="button"
                onClick={() => setCurrentChat(chat.id)}
                aria-current={currentChat === chat.id ? "page" : undefined}
                className="flex min-w-0 flex-1 items-center gap-2 text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <MessageSquare size={18} aria-hidden="true" className="shrink-0" />
                <span className="truncate">{chat.title || "Untitled chat"}</span>
              </button>

              <button
                type="button"
                aria-label={`Delete ${chat.title || "chat"}`}
                title="Delete chat"
                onClick={() => deleteChat(chat.id)}
                className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
