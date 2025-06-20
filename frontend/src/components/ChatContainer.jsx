import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import { MessagesInput } from "./MessagesInput";
import MessageSkeleton from "./skeleton/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { toast } from "react-hot-toast";
import { Edit3, Trash2, Image as ImageIcon, Info } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    deleteMessage,
    editMessage,
    subscribeToMessages,
    unsubscribeToMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [confirmRemoveImageId, setConfirmRemoveImageId] = useState(null);
  const [confirmRemoveTextId, setConfirmRemoveTextId] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeToMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeToMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleEdit = (id, text) => {
    setEditingId(id);
    setEditedText(text || "");
  };

  const handleSave = async (id) => {
    const originalMessage = messages.find((msg) => msg._id === id);
    const trimmedText = editedText.trim();

    if (trimmedText === originalMessage?.text) {
      toast("No changes detected", { icon: <Info className="w-5 h-5" /> });
      setEditingId(null);
      setEditedText("");
      return;
    }

    if (trimmedText === "" && !originalMessage?.image) {
      await deleteMessage(id);
      toast.success("Message deleted!");
    } else {
      await editMessage(id, trimmedText, originalMessage?.image);
      toast.success("Message updated!");
    }
    setEditingId(null);
    setEditedText("");
  };

  const handleRemoveImage = async (message) => {
    if (confirmRemoveImageId === message._id) {
      try {
        if (!message.text?.trim()) {
          await deleteMessage(message._id);
          toast.success("Message deleted!");
        } else {
          await editMessage(message._id, message.text, null);
          toast.success("Image removed!");
        }
        setConfirmRemoveImageId(null);
      } catch {
        toast.error("Failed to remove image");
      }
    } else {
      setConfirmRemoveImageId(message._id);
      setTimeout(() => setConfirmRemoveImageId(null), 3000);
    }
  };

  const handleRemoveText = async (message) => {
    if (confirmRemoveTextId === message._id) {
      try {
        if (!message.image) {
          await deleteMessage(message._id);
          toast.success("Message deleted!");
        } else {
          await editMessage(message._id, "", message.image);
          toast.success("Text removed!");
        }
        setConfirmRemoveTextId(null);
      } catch {
        toast.error("Failed to remove text");
      }
    } else {
      setConfirmRemoveTextId(message._id);
      setTimeout(() => setConfirmRemoveTextId(null), 3000);
    }
  };

  const handleReplaceImage = async (message) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          if (file.name === message.imageFileName) {
            toast("Image is the same as the previous one.", { icon: <Info className="w-5 h-5" /> });
            return;
          }
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result;
            await editMessage(message._id, message.text || "", base64);
            toast.success("Image updated!");
          };
          reader.readAsDataURL(file);
        } catch {
          toast.error("Failed to update image");
        }
      }
    };
    fileInput.click();
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessagesInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto relative">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1 flex items-center gap-1">
              <time className="text-xs opacity-50">
                {formatMessageTime(message.createdAt)}
              </time>
              {message.updatedAt !== message.createdAt && (
                <span className="text-xs opacity-50">(edited)</span>
              )}
            </div>
            <div className="chat-bubble flex flex-col max-w-[80%] bg-base-200 break-words whitespace-pre-wrap">
              {message.image && (
                <div className="relative">
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                  {message.senderId === authUser._id && (
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        onClick={() => handleReplaceImage(message)}
                        className="btn btn-xs bg-base-100 text-base-content border hover:bg-base-300"
                      >
                        <ImageIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveImage(message)}
                        className="btn btn-xs bg-error text-white border-error hover:bg-error/80"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {confirmRemoveImageId === message._id && (
                        <div className="absolute right-0 mt-8 bg-base-200 p-2 rounded-lg shadow-md flex gap-2 transition-opacity duration-300">
                          <button
                            className="btn btn-error btn-xs"
                            onClick={() => handleRemoveImage(message)}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn btn-xs border border-base-content/50 text-base-content hover:bg-base-content/30"
                            onClick={() => setConfirmRemoveImageId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {editingId === message._id ? (
                <>
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="textarea text-area-bordered text-sm resize-none bg-base-200 text-base-content border-base-content/30 focus:border-base-content/50 p-2"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-1 text-xs">
                    <button
                      onClick={() => handleSave(message._id)}
                      className="btn btn-xs btn-primary"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn btn-xs border border-base-content/50 text-base-content hover:bg-base-content/30"
                    >
                      Cancel
                    </button>
                    {confirmRemoveTextId === message._id && (
                      <div className="absolute right-0 mt-8 bg-base-200 p-2 rounded-lg shadow-md flex gap-2 transition-opacity duration-300">
                        <button
                          className="btn btn-error btn-xs"
                          onClick={() => handleRemoveText(message)}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn btn-xs border border-base-content/50 text-base-content hover:bg-base-content/30"
                          onClick={() => setConfirmRemoveTextId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {message.text && (
                    <p className="text-base-content break-words whitespace-pre-wrap">
                      {message.text}
                    </p>
                  )}
                  {message.senderId === authUser._id && (
                    <div className="flex gap-2 mt-1 text-xs relative">
                      <button
                        onClick={() => handleEdit(message._id, message.text)}
                        className="btn btn-xs bg-base-100 text-base-content border hover:bg-base-300 px-2 sm:px-3"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      {message.text && (
                        <button
                          onClick={() => handleRemoveText(message)}
                          className="btn btn-xs bg-error text-white border-error hover:bg-error/80 px-2 sm:px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete Text</span>
                        </button>
                      )}
                      {confirmRemoveTextId === message._id && (
                        <div className="absolute right-0 mt-8 bg-base-200 p-2 rounded-lg shadow-md flex gap-2 transition-opacity duration-300">
                          <button
                            className="btn btn-error btn-xs"
                            onClick={() => handleRemoveText(message)}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn btn-xs border border-base-content/50 text-base-content hover:bg-base-content/30"
                            onClick={() => setConfirmRemoveTextId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <MessagesInput />
    </div>
  );
};

export default ChatContainer;