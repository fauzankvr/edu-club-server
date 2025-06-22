// server/socket.ts
import { Server, Socket } from "socket.io";
import { MessageModel } from "../database/models/MessageModel";
import { ChatModel } from "../database/models/ChatModel";
import { CallHistoryModel } from "../database/models/CallHistoryModel";
import mongoose from "mongoose";

const userSocketMap = new Map<string, string>(); // userId -> socketId
const socketUserMap = new Map<string, string>(); // socketId -> userId

interface Message {
  id: string;
  chatId: string;
  sender: string;
  text: string;
  createdAt: string;
  seenBy: string[];
}

export const setupSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    let userRole: string | undefined;
    let userId: string | undefined;

    socket.on(
      "set-role",
      ({ role, userId: id }: { role: string; userId: string }) => {
        userRole = role;
        userId = id;
        userSocketMap.set(id, socket.id);
        socketUserMap.set(socket.id, id);
        socket.emit("role-set");
        console.log(`${socket.id} set role: ${role}, userId: ${id}`);
      }
    );

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`${socket.id} joined room ${roomId}`);
    });

    socket.on(
      "start-call",
      async ({ callerName, callerId, receiverUserId, chatId, roomId }: {
        callerName: string;
        callerId: string;
        receiverUserId: string;
        chatId: string;
        roomId: string;
      }) => {
        if (userRole !== "student") {
          socket.emit("error", { error: "Only students can start calls" });
          return;
        }

        const receiverSocketId = userSocketMap.get(receiverUserId);
        if (!receiverSocketId) {
          socket.emit("instructor-offline");
          return;
        }

        try {
          await CallHistoryModel.findOneAndUpdate(
            {
              callerId,
              receiverId: receiverUserId,
              startedAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) },
            },
            {
              $setOnInsert: {
                roomId,
                callerId,
                callerName: callerName || `User-${callerId}`,
                receiverId: receiverUserId,
                receiverName: `Instructor-${receiverUserId}`,
                startedAt: new Date(),
                chatId,
              },
            },
            { upsert: true }
          );
        } catch (err) {
          console.error("Error saving call history:", err);
        }

        socket.join(roomId);
        io.to(receiverSocketId).emit("incoming-call", {
          fromUserId: callerId,
          name: callerName,
          chatId,
          roomId,
        });
        console.log(
          `Call from ${callerId} to ${receiverUserId} in room ${roomId}`
        );
      }
    );

    socket.on(
      "signal",
      ({
        type,
        data,
        targetUserId,
        roomId,
      }: {
        type: string;
        data: any;
        targetUserId: string;
        roomId: string;
      }) => {
        const senderUserId = socketUserMap.get(socket.id);
        if (!senderUserId) {
          socket.emit("error", { error: "Invalid sender" });
          return;
        }

        const targetSocketId = userSocketMap.get(targetUserId);
        if (targetSocketId) {
          io.to(targetSocketId).emit("signal", {
            type,
            data,
            fromUserId: senderUserId,
            roomId,
          });
          console.log(
            `Signal ${type} from ${senderUserId} to ${targetUserId} in room ${roomId}`
          );
        } else {
          socket.emit("error", { error: "Target user not online" });
        }
      }
    );

    socket.on(
      "call-accepted",
      ({ toUserId, roomId }: { toUserId: string; roomId: string }) => {
        const targetSocketId = userSocketMap.get(toUserId);
        if (targetSocketId) {
          io.to(targetSocketId).emit("call-accepted", { roomId });
          socket.join(roomId);
          console.log(
            `Call accepted by ${userId} for ${toUserId} in room ${roomId}`
          );
        }
      }
    );

    socket.on("reject-call", ({ toUserId }: { toUserId: string }) => {
      const targetSocketId = userSocketMap.get(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-rejected", {
          message: "Call rejected by instructor",
        });
        console.log(`Call rejected for ${toUserId}`);
      }
    });

    socket.on(
      "recall",
      ({ targetUserId, roomId }: { targetUserId: string; roomId: string }) => {
        if (userRole !== "instructor") {
          socket.emit("error", { error: "Only instructors can recall" });
          return;
        }
        const targetSocketId = userSocketMap.get(targetUserId);
        if (targetSocketId) {
          io.to(targetSocketId).emit("recall", {
            fromUserId: userId,
            roomId,
          });
          console.log(`Recall sent to ${targetUserId} for room ${roomId}`);
        }
      }
    );

    const updateUnseenCount = async (chatId: string) => {
      if (!mongoose.Types.ObjectId.isValid(chatId)) return;
      const messages = await MessageModel.find({ chatId });
      const chat = await ChatModel.findById(chatId);
      if (chat) {
        const userIds = [chat.userId, chat.instructorId];
        for (const userId of userIds) {
          const unseenCount = messages.filter(
            (msg) => !msg.seenBy.includes(userId)
          ).length;
          io.to(chatId).emit("unseenCount", { chatId, count: unseenCount });
        }
      }
    };

    socket.on("joinChat", async (chatId: string) => {
      socket.join(chatId);
      console.log(`${socket.id} joined chat ${chatId}`);
      const messages = await MessageModel.find({ chatId }).sort({
        createdAt: 1,
      });
      const formattedMessages = messages.map((msg) => ({
        id: msg.id.toString(),
        chatId: msg.chatId,
        text: msg.text,
        sender: msg.sender,
        createdAt: msg.createdAt.toISOString(),
        seenBy: msg.seenBy,
      }));
      socket.emit("initialMessages", formattedMessages);
      await updateUnseenCount(chatId);
    });

    socket.on("sendMessage", async (message: Message) => {
      try {
        if (!message.chatId || !message.sender || !message.text) {
          socket.emit("error", { error: "Invalid message data" });
          return;
        }
        const savedMessage = await MessageModel.create({
          chatId: message.chatId,
          sender: message.sender,
          text: message.text,
          seenBy: [],
        });
        const messageToSend = {
          id: savedMessage.id.toString(),
          chatId: savedMessage.chatId,
          sender: savedMessage.sender,
          text: savedMessage.text,
          createdAt: savedMessage.createdAt.toISOString(),
          seenBy: savedMessage.seenBy,
        };
        io.to(message.chatId).emit("newMessage", messageToSend);
        await updateUnseenCount(message.chatId);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { error: "Failed to send message" });
      }
    });

    socket.on(
      "messageSeen",
      async ({ chatId, userId }: { chatId: string; userId: string }) => {
        try {
          const updatedMessages = await MessageModel.updateMany(
            { chatId, seenBy: { $ne: userId } },
            { $addToSet: { seenBy: userId } }
          );

          // Fetch updated messages to send to clients
          const messages = await MessageModel.find({ chatId }).sort({
            createdAt: 1,
          });
          const formattedMessages = messages.map((msg) => ({
            id: msg.id.toString(),
            chatId: msg.chatId,
            text: msg.text,
            sender: msg.sender,
            createdAt: msg.createdAt.toISOString(),
            seenBy: msg.seenBy,
          }));

          // Emit updated messages to all clients in the chat room
          io.to(chatId).emit("messagesUpdated", formattedMessages);
          await updateUnseenCount(chatId);
        } catch (error) {
          console.error("Error marking messages as seen:", error);
        }
      }
    );

    socket.on(
      "typing",
      ({ chatId, sender }: { chatId: string; sender: string }) => {
        if (!chatId || !sender) return;
        socket.to(chatId).emit("typing", { chatId, sender });
      }
    );

    socket.on(
      "stopTyping",
      ({ chatId, sender }: { chatId: string; sender: string }) => {
        if (!chatId || !sender) return;
        socket.to(chatId).emit("stopTyping", { chatId, sender });
      }
    );

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      socket.broadcast.to(roomId).emit("user-left");
      console.log(`${socket.id} left room ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);
      if (userId) {
        userSocketMap.delete(userId);
        socketUserMap.delete(socket.id);
      }
    });
  });
 
}
