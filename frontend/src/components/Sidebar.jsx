import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users } from "lucide-react";
import SidebarSkeleton from "./skeleton/SidebarSkeleton";

const LOCAL_STORAGE_KEY = "chat_newMessages";

const Sidebar = () => {
  const {
    getUsers,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    users,
    newMessages,
    clearNewMessageFlag,
    setNewMessages,
  } = useChatStore();

  const { onlineUsers = [] } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    clearNewMessageFlag(user._id);
  };

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Загрузка newMessages из localStorage при монтировании
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setNewMessages(parsed);
        }
      } catch (error) {
        // silent catch
      }
    }
  }, [setNewMessages]);

  // Сохранение newMessages в localStorage при их изменении
  useEffect(() => {
    if (newMessages && Object.keys(newMessages).length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newMessages));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [newMessages]);

  const filteredUsers = showOnlineOnly
    ? users?.filter((user) => onlineUsers.includes(user._id)) || []
    : users || [];

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
      <div className="flex items-center gap-2">
      <button
        className={`
        lg:hidden w-9 h-9 flex items-center justify-center
        transition-colors rounded-lg
        ${showOnlineOnly ? "bg-green-500 text-white" : "hover:bg-base-200"}
        `}
        onClick={() => setShowOnlineOnly(!showOnlineOnly)}
        aria-label="Toggle show online only"
      >
        <Users className="size-5" />
      </button>

        <div className="hidden lg:flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium">Contacts</span>
        </div>
      </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => handleSelectUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900"
                />
              )}
              {Number(newMessages[user._id]) > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px]
                  px-1.5 py-0.5 rounded-full z-10"
                >
                  {newMessages[user._id]}
                </span>
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0 truncate">
              <div className="font-semibold truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
