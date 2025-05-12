import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import clodinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async(req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne:loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers);
    } catch(error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async(req, res) => {
    try {
        const { id:userToChatId } = req.params
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
        })

        res.status(200).json(messages)
    } catch(error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl = null;

        if (image) {
            // Upload base64 image to cloudinary
            const uploadResponse = await clodinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const editMessage = async (req, res) => {
    try {
      const { messageId } = req.params;
      const { text, image } = req.body;
  
      let imageUrl = image || null;
  
      if (image && image !== "") {
        const uploadResponse = await clodinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }
  
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { text, image: imageUrl },
        { new: true }
      );
  
      if (!updatedMessage) {
        return res.status(404).json({ error: "Message not found" });
      }
  
      res.status(200).json(updatedMessage);
    } catch (error) {
      console.log("Error in editMessage controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
      const { messageId } = req.params;
  
      const deletedMessage = await Message.findByIdAndDelete(messageId);
  
      if (!deletedMessage) {
        return res.status(404).json({ error: "Message not found" });
      }
  
      res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
      console.log("Error in deleteMessage controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
};
  
export const replaceImage = async (req, res) => {
    try {
      const { messageId } = req.params;
      const { image } = req.body;
  
      const uploadResponse = await clodinary.uploader.upload(image);
      const imageUrl = uploadResponse.secure_url;
  
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { image: imageUrl },
        { new: true }
      );
  
      if (!updatedMessage) {
        return res.status(404).json({ error: "Message not found" });
      }
  
      res.status(200).json(updatedMessage);
    } catch (error) {
      console.log("Error in replaceImage controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
};
  
export const removeImage = async (req, res) => {
    try {
      const { messageId } = req.params;
  
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { image: "" },
        { new: true }
      );
  
      if (!updatedMessage) {
        return res.status(404).json({ error: "Message not found" });
      }
  
      res.status(200).json(updatedMessage);
    } catch (error) {
      console.log("Error in removeImage controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
};