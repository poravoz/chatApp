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

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
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
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, messages } = get();
    const socket = useAuthStore.getState().socket;
  
    if (!selectedUser || !socket || !socket.connected) return;
  
    socket.off("newMessage");
    socket.off("messageUpdated");
    socket.off("messageDeleted");
  
    socket.on("newMessage", (newMessage) => {
      const isDuplicate = messages.some((msg) => msg._id === newMessage._id);
      const isRelevant = newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;

      if (!isRelevant) return;
     
     
      if (!isDuplicate) {
        set({ messages: [...messages, newMessage] });
      }
    });
  
    socket.on("messageUpdated", (updatedMessage) => {
      const updatedMessages = get().messages.map(msg =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      );
      set({ messages: updatedMessages });
    });
  
    socket.on("messageDeleted", (deletedMessageId) => {
      const filteredMessages = get().messages.filter(msg => msg._id !== deletedMessageId);
      set({ messages: filteredMessages });
    });
  },
  
  

  unsubscribeToMessages: () => {
    const { socket } = get();
    if (socket) {
      socket.off("newMessage");
    }
  },

  editMessage: async (messageId, text, image) => {
    try {
      const { messages } = get();
      const res = await axiosInstance.put(`/messages/${messageId}`, { text, image });

      const updatedMessages = messages.map(msg =>
        msg._id === messageId ? res.data : msg
      );

      set({ messages: updatedMessages });
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const { messages } = get();
      await axiosInstance.delete(`/messages/${messageId}`);

      const updatedMessages = messages.filter(msg => msg._id !== messageId);
      set({ messages: updatedMessages });
    } catch (error) {
      toast.error(error.response.data.message);
      throw error;
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
