import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  socket: null,
  newMessages: {},

  setNewMessageFlag: (userId) => {
    set((state) => ({
      newMessages: {
        ...state.newMessages,
        [userId]: (state.newMessages[userId] || 0) + 1,
      },
    }));
  },

  clearNewMessageFlag: (userId) => {
    set((state) => {
      const updatedFlags = { ...state.newMessages };
      delete updatedFlags[userId];
      return { newMessages: updatedFlags };
    });
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || !socket.connected) return;

    socket.off("newMessage");
    socket.off("messageUpdated");
    socket.off("messageDeleted");

    socket.on("newMessage", (newMessage) => {
      const currentMessages = get().messages;
      const { selectedUser, setNewMessageFlag } = get();
      const isDuplicate = currentMessages.some((msg) => msg._id === newMessage._id);

      if (!selectedUser) {
        setNewMessageFlag(newMessage.senderId);
        return;
      }

      if (selectedUser._id !== newMessage.senderId) {
        setNewMessageFlag(newMessage.senderId);
        return;
      }

      if (!isDuplicate) {
        set({ messages: [...currentMessages, newMessage] });
      }
    });

    socket.on("messageUpdated", (updatedMessage) => {
      const updatedMessages = get().messages.map((msg) =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      );
      set({ messages: updatedMessages });
    });

    socket.on("messageDeleted", (deletedMessageId) => {
      const filteredMessages = get().messages.filter((msg) => msg._id !== deletedMessageId);
      set({ messages: filteredMessages });
    });
  },

  unsubscribeToMessages: () => {
    const { socket } = get();
    if (socket) {
      socket.off("newMessage");
      socket.off("messageUpdated");
      socket.off("messageDeleted");
    }
  },

  editMessage: async (messageId, text, image) => {
    try {
      const { messages } = get();
      const res = await axiosInstance.put(`/messages/${messageId}`, { text, image });

      const updatedMessages = messages.map((msg) =>
        msg._id === messageId ? res.data : msg
      );

      set({ messages: updatedMessages });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit message");
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const { messages } = get();
      await axiosInstance.delete(`/messages/${messageId}`);

      const updatedMessages = messages.filter((msg) => msg._id !== messageId);
      set({ messages: updatedMessages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
      throw error;
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      get().clearNewMessageFlag(selectedUser._id);
    }
  },

  setNewMessages: (messages) => {
    set({ newMessages: messages });
  },
}));
