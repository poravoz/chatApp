import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, editMessage, deleteMessage, replaceImage, removeImage } from "../controllers/message.controller.js";
const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.put("/:messageId", protectRoute, editMessage);
router.delete("/:messageId", protectRoute, deleteMessage); 
router.put("/image/:messageId", protectRoute, replaceImage); 
router.delete("/image/:messageId", protectRoute, removeImage);

export default router;