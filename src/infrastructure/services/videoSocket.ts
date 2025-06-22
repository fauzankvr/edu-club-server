// server/videoSocket.ts
import { Server, Socket } from "socket.io";
import { CallHistoryModel } from "../database/models/CallHistoryModel";
import {
  registerUserSocket,
  unregisterUserSocket,
  getSocketIdByUserId,
  getUserIdBySocketId,
} from "./socketManager";

export const setupVideoSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    let userRole: string | undefined;
    let userId: string | undefined;

    socket.on(
      "set-role",
      ({ role, userId: id }: { role: string; userId: string }) => {
        if (!registerUserSocket(socket.id, id)) {
          socket.emit("error", { error: "Another connection already exists" });
          socket.disconnect();
          return;
        }
        userRole = role;
        userId = id;
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
      async ({ callerName, callerId, receiverUserId, chatId, roomId }) => {
        if (userRole !== "student") {
          socket.emit("error", { error: "Only students can start calls" });
          return;
        }
        const receiverSocketId = getSocketIdByUserId(receiverUserId);
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

    socket.on("signal", ({ type, data, targetUserId, roomId }) => {
      const senderUserId = getUserIdBySocketId(socket.id);
      if (!senderUserId) {
        socket.emit("error", { error: "Invalid sender" });
        return;
      }
      const targetSocketId = getSocketIdByUserId(targetUserId);
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
    });

    socket.on("call-accepted", ({ toUserId, roomId }) => {
      const targetSocketId = getSocketIdByUserId(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-accepted", { roomId });
        socket.join(roomId);
        console.log(
          `Call accepted by ${userId} for ${toUserId} in room ${roomId}`
        );
      }
    });

    socket.on("reject-call", ({ toUserId }) => {
      const targetSocketId = getSocketIdByUserId(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-rejected", {
          message: "Call rejected by instructor",
        });
        console.log(`Call rejected for ${toUserId}`);
      }
    });

    socket.on("recall", ({ targetUserId, roomId }) => {
      if (userRole !== "instructor") {
        socket.emit("error", { error: "Only instructors can recall" });
        return;
      }
      const targetSocketId = getSocketIdByUserId(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("recall", { fromUserId: userId, roomId });
        console.log(`Recall sent to ${targetUserId} for room ${roomId}`);
      }
    });

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      socket.broadcast.to(roomId).emit("user-left");
      console.log(`${socket.id} left room ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);
      unregisterUserSocket(socket.id);
    });
  });
};
