import { Server, Socket } from "socket.io";
import { MessageModel } from "../database/models/MessageModel";
import { ChatModel } from "../database/models/ChatModel";
import mongoose from "mongoose";
import {
  registerUserSocket,
  unregisterUserSocket,
  getSocketIdByUserId,
} from "./socketManager";
import { INotification } from "../database/models/NotificationModel";

interface Message {
    id?: string;
  chatId: string;
  sender: string;
  text: string;
  createdAt: string;
  seenBy: string[];
  deleted?: boolean; // Added
  reactions?: { userId: string; reaction: string }[]; // Added
}

export const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    let userId: string | undefined;
    let role: string | undefined;
    const joinedChats = new Set<string>();

    socket.on(
      "set-role",
      async ({
        role: userRole,
        userId: id,
      }: {
        role: string;
        userId: string;
      }) => {
        if (!registerUserSocket(socket.id, id)) {
          socket.emit("error", { error: "Another connection exists" });
          socket.disconnect();
          return;
        }
        userId = id;
        role = userRole;
        socket.emit("role-set");
        console.log(`${socket.id} set role: ${userRole}, userId: ${id}`);

        const updateField =
          role === "student" ? "userLastSeen" : "instructorLastSeen";
        await ChatModel.updateMany(
          { $or: [{ userId: id }, { instructorId: id }] },
          { $set: { [updateField]: new Date() } }
        );

        const chats = await ChatModel.find({
          $or: [{ userId: id }, { instructorId: id }],
        });
        for (const chat of chats) {
          const recipientId =
            chat.userId.toString() === id
              ? chat.instructorId.toString()
              : chat.userId.toString();
          const recipientSocketId = getSocketIdByUserId(recipientId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("userStatus", {
              userId: id,
              status: "online",
              lastSeen: new Date().toISOString(),
            });
          }
        }
      }
    );

    const updateUnseenCount = async (chatId: string) => {
      if (!mongoose.Types.ObjectId.isValid(chatId)) return;
      const chat = await ChatModel.findById(chatId);
      if (!chat) return;
      const messages = await MessageModel.find({ chatId });
      const userIds = [chat.userId.toString(), chat.instructorId.toString()];
      for (const uid of userIds) {
        const unseenCount = messages.filter(
          (msg) =>
            msg.sender.toString() !== uid &&
            !msg.seenBy.map((id: any) => id.toString()).includes(uid)
        ).length;
        const socketId = getSocketIdByUserId(uid);
        if (socketId) {
          io.to(socketId).emit("unseenCount", { chatId, count: unseenCount });
        }
      }
    };

    socket.on("joinChat", async (chatId: string) => {
      if (joinedChats.has(chatId)) return;
      socket.join(chatId);
      joinedChats.add(chatId);
      console.log(`${socket.id} joined chat ${chatId}`);
      const messages = await MessageModel.find({ chatId }).sort({
        createdAt: 1,
      });
      socket.emit(
        "initialMessages",
        messages.map((msg) => ({
          id: msg.id.toString(),
          chatId: msg.chatId.toString(),
          text: msg.text,
          sender: msg.sender.toString(),
          createdAt: msg.createdAt.toISOString(),
          seenBy: msg.seenBy.map((id: any) => id.toString()),
          deleted: msg.deleted, // Added
          reactions: msg.reactions.map((r) => ({
            userId: r.userId.toString(),
            reaction: r.reaction,
          })), // Added
        }))
      );
      await updateUnseenCount(chatId);
    });

    socket.on(
      "sendMessage",
      async ({
        chatId,
        sender,
        text,
      }: {
        chatId: string;
        sender: string;
        text: string;
      }) => {
        try {
          if (!chatId || !sender || !text) {
            socket.emit("error", { error: "Invalid message data" });
            return;
          }
          const savedMessage = await MessageModel.create({
            chatId,
            sender,
            text,
            seenBy: [sender],
            deleted: false, // Added
            reactions: [], // Added
          });
          await ChatModel.findByIdAndUpdate(chatId, {
            lastMessage: text,
            lastMessageTime: new Date(),
          });

          const contactUpdate = {
            chatId,
            lastMessage: text,
            lastMessageTime: new Date().toISOString(),
          };
          const chat = await ChatModel.findById(chatId)
            .populate("userId")
            .populate("instructorId");
          if (!chat) return;
          const userIds = [
            chat?.userId.toString(),
            chat?.instructorId.toString(),
          ];
          userIds.forEach((uid) => {
            const socketId = getSocketIdByUserId(uid);
            if (socketId) {
              io.to(socketId).emit("chatUpdated", contactUpdate);
            }
          });

          const messageToSend: Message = {
            id: savedMessage.id.toString(),
            chatId: savedMessage.chatId.toString(),
            sender: savedMessage.sender.toString(),
            text: savedMessage.text,
            createdAt: savedMessage.createdAt.toISOString(),
            seenBy: savedMessage.seenBy.map((id: any) => id.toString()),
            deleted: savedMessage.deleted, // Added
            reactions: savedMessage.reactions.map((r) => ({
              userId: r.userId.toString(),
              reaction: r.reaction,
            })), // Added
          };
          io.to(chatId).emit("newMessage", messageToSend);
          await updateUnseenCount(chatId);
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", { error: "Failed to send message" });
        }
      }
    );

    socket.on(
      "messageSeen",
      async ({
        chatId,
        userId,
        messageId,
      }: {
        chatId: string;
        userId: string;
        messageId: string;
      }) => {
        try {
          if (!mongoose.Types.ObjectId.isValid(messageId)) {
            socket.emit("error", { error: "Invalid message ID" });
            return;
          }
          const message = await MessageModel.findById(messageId);
          if (
            !message ||
            message.seenBy.map((id: any) => id.toString()).includes(userId)
          )
            return;
          await MessageModel.updateOne(
            { _id: messageId },
            { $addToSet: { seenBy: userId } }
          );
          const updatedMessage: Message = {
            id: message.id.toString(),
            chatId: message.chatId.toString(),
            text: message.text,
            sender: message.sender.toString(),
            createdAt: message.createdAt.toISOString(),
            seenBy: [...message.seenBy.map((id: any) => id.toString()), userId],
            deleted: message.deleted, // Added
            reactions: message.reactions.map((r) => ({
              userId: r.userId.toString(),
              reaction: r.reaction,
            })),  
          };
          console.log("updatedd...", updatedMessage);
          io.to(chatId).emit("messageUpdated", updatedMessage);
          await updateUnseenCount(chatId);
        } catch (error) {
          console.error("Error marking message as seen:", error);
          socket.emit("error", { error: "Failed to mark message as seen" });
        }
      }
    );

    // New: Delete message (soft delete)
    socket.on(
      "deleteMessage",
      async ({
        chatId,
        messageId,
        userId,
      }: {
        chatId: string;
        messageId: string;
        userId: string;
      }) => {
        try {
          if (!mongoose.Types.ObjectId.isValid(messageId)) {
            socket.emit("error", { error: "Invalid message ID" });
            return;
          }
          const message = await MessageModel.findById(messageId);
          if (!message || message.sender.toString() !== userId) {
            socket.emit("error", {
              error: "You can only delete your own messages",
            });
            return;
          }
          if (message.deleted) return; // Already deleted

          await MessageModel.updateOne(
            { _id: messageId },
            { deleted: true, text: "This message was deleted" }
          );

          io.to(chatId).emit("messageDeleted", { messageId, chatId });
        } catch (error) {
          console.error("Error deleting message:", error);
          socket.emit("error", { error: "Failed to delete message" });
        }
      }
    );

    // New: Add/Update reaction
    socket.on(
      "addReaction",
      async ({
        chatId,
        messageId,
        userId,
        reaction,
      }: {
        chatId: string;
        messageId: string;
        userId: string;
        reaction: string;
      }) => {
        try {
          console.log("reactd....")
          console.log(userId,chatId,messageId,reaction)
          const message = await MessageModel.findById(messageId);
          if (!message) return;

          // Remove existing reaction from this user if any
          message.reactions = message.reactions.filter(
            (r) => r.userId.toString() !== userId
          );
          // Add new reaction
          message.reactions.push({ userId, reaction });
          await message.save();

          const updatedMessage: Message = {
            id: message.id.toString(),
            chatId: message.chatId.toString(),
            text: message.text,
            sender: message.sender.toString(),
            createdAt: message.createdAt.toISOString(),
            seenBy: message.seenBy.map((id: any) => id.toString()),
            deleted: message.deleted,
            reactions: message.reactions.map((r) => ({
              userId: r.userId.toString(),
              reaction: r.reaction,
            })),
          };
          console.log("update",updatedMessage)
          io.to(chatId).emit("messageUpdated", updatedMessage);
        } catch (error) {
          console.error("Error adding reaction:", error);
          socket.emit("error", { error: "Failed to add reaction" });
        }
      }
    );

    socket.on(
      "typing",
      ({ chatId, sender }: { chatId: string; sender: string }) => {
        if (chatId && sender)
          socket.to(chatId).emit("typing", { chatId, sender });
      }
    );

    socket.on(
      "stopTyping",
      ({ chatId, sender }: { chatId: string; sender: string }) => {
        if (chatId && sender)
          socket.to(chatId).emit("stopTyping", { chatId, sender });
      }
    );

    socket.on("newNotification", async (notification: INotification) => {
      try {
        console.log("calling notification");
        const studetnSoket = getSocketIdByUserId(
          notification.studentId.toString()
        );
        if (!studetnSoket) return;
        io.to(studetnSoket).emit("newNotification", notification);
      } catch (error) {
        console.error("Error sending notification:", error);
        socket.emit("error", { error: "Failed to send notification" });
      }
    });

    socket.on("disconnect", async () => {
      console.log(`${socket.id} disconnected`);
      if (userId && role) {
        const lastSeen = new Date();
        const updateField =
          role === "student" ? "userLastSeen" : "instructorLastSeen";
        await ChatModel.updateMany(
          { $or: [{ userId }, { instructorId: userId }] },
          { $set: { [updateField]: lastSeen } }
        );
        const chats = await ChatModel.find({
          $or: [{ userId }, { instructorId: userId }],
        });
        for (const chat of chats) {
          const recipientId =
            chat.userId.toString() === userId
              ? chat.instructorId.toString()
              : chat.userId.toString();
          const recipientSocketId = getSocketIdByUserId(recipientId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("userStatus", {
              userId,
              status: "offline",
              lastSeen: lastSeen.toISOString(),
            });
          }
        }
        unregisterUserSocket(socket.id);
      }
    });
  });
};
