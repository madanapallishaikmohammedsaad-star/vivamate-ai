import { Plus, MessageSquare, Trash2 } from "lucide-react";

export default function ChatSidebar({
  chats,
  currentChat,
  setCurrentChat,
  createNewChat,
  deleteChat,
}) {
  return (
    <div className="w-72 bg-white border-r flex flex-col">

      {/* Header */}
      <div className="p-4 border-b">
        <button
          onClick={createNewChat}
          className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">

        {chats.map((chat) => (

          <div
            key={chat.id}
            className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 ${
              currentChat === chat.id ? "bg-blue-100" : ""
            }`}
            onClick={() => setCurrentChat(chat.id)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <MessageSquare size={18} />
              <span className="truncate">
                {chat.title}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat.id);
              }}
            >
              <Trash2
                size={16}
                className="text-red-500 hover:text-red-700"
              />
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}
