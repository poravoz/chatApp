import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
           const res = await axiosInstance.post("/auth/signup", data);
           set({ authUser: res.data });
           toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },
    
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            if (res && res.data) {
                set({ authUser: res.data });
                toast.success("Logged in successfully");
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error.response ? error.response.data.message : error.message;
            toast.error(errorMessage || "An error occurred during login");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({ authUser: null });
          toast.success("Logged out successfully");  
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/update-profile", data);
          const updatedUser = { ...get().authUser, ...res.data };
          set({ authUser: updatedUser });
          return true;
        } catch (error) {
          if (error.response?.data?.message === "NEW_PASSWORD_SAME_AS_CURRENT") {
            throw new Error("NEW_PASSWORD_SAME_AS_CURRENT");
          }
          throw new Error(error.response?.data?.message || "Update failed");
        } finally {
          set({ isUpdatingProfile: false });
        }
    },
}));