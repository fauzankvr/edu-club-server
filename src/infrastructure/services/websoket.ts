import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid"; // For generating unique message IDs

interface Message {
  id: string;
  chatId: string;
  sender: string;
  text: string;
  createdAt: string;
}

interface RoomData {
  users: Set<string>;
  instructorId?: string;
}

interface CallRecord {
  callerId: string;
  callerName: string;
  timestamp: string;
  roomId: string;
}

export const setupSocket = (io: Server) => {
  const rooms: Map<string, RoomData> = new Map();
  const callHistory: Map<string, CallRecord[]> = new Map();

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    let userRole: string | undefined;

    socket.on("set-role", (role: string) => {
      userRole = role;
      console.log(`User ${socket.id} set role: ${role}`);
      socket.emit("role-set", role);
    });

    const joinRoom = (roomId: string) => {
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { users: new Set() });
      }
      const room = rooms.get(roomId)!;
      room.users.add(socket.id);
      if (userRole === "instructor") {
        room.instructorId = socket.id;
        if (callHistory.has(roomId)) {
          socket.emit("call-history", callHistory.get(roomId)!);
        }
      }
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    };

    const leaveRoom = (roomId: string) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId)!;
        room.users.delete(socket.id);
        if (room.instructorId === socket.id) {
          room.instructorId = undefined;
        }
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
        if (room.users.size === 0) {
          rooms.delete(roomId);
        }
      }
    };

    socket.on(
      "join-room",
      (callerName: string, roomId: string = "video-call-room") => {
        if (!userRole) {
          socket.emit("error", { error: "Role not set" });
          return;
        }

        joinRoom(roomId);

        if (userRole === "student") {
          const callRecord: CallRecord = {
            callerId: socket.id,
            callerName: callerName || `User-${socket.id}`,
            timestamp: new Date().toISOString(),
            roomId,
          };
          if (!callHistory.has(roomId)) {
            callHistory.set(roomId, []);
          }
          callHistory.get(roomId)!.push(callRecord);

          const room = rooms.get(roomId);
          if (room?.instructorId) {
            io.to(room.instructorId).emit(
              "call-history",
              callHistory.get(roomId)!
            );
          }
        }

        socket.to(roomId).emit("user-joined", socket.id);
      }
    );

    socket.on("leave-room", (roomId: string) => {
      leaveRoom(roomId);
      socket.to(roomId).emit("user-left", socket.id);
    });

    socket.on("offer", (offer: RTCSessionDescriptionInit, targetId: string) => {
      console.log(`Offer sent from ${socket.id} to ${targetId}`);
      io.to(targetId).emit("offer", offer, socket.id);
    });

    socket.on(
      "answer",
      (answer: RTCSessionDescriptionInit, targetId: string) => {
        console.log(`Answer sent from ${socket.id} to ${targetId}`);
        io.to(targetId).emit("answer", answer);
      }
    );

    socket.on(
      "ice-candidate",
      (candidate: RTCIceCandidateInit, targetId: string) => {
        console.log(`ICE candidate sent from ${socket.id} to ${targetId}`);
        io.to(targetId).emit("ice-candidate", candidate);
      }
    );

    socket.on("recall", (callerId: string) => {
      if (userRole !== "instructor") {
        socket.emit("error", { error: "Only instructors can recall" });
        return;
      }
      const roomId = Array.from(socket.rooms).find(
        (room) => room !== socket.id
      );
      if (!roomId) {
        socket.emit("error", { error: "Not in a room" });
        return;
      }
      io.to(callerId).emit("recall", roomId);
      console.log(
        `Instructor ${socket.id} recalled user ${callerId} in room ${roomId}`
      );
    });


              /// Chat functionality //


    socket.on("joinChat", (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on("sendMessage", (message: Message) => {
      try {
        if (!message.chatId || !message.sender || !message.text) {
          socket.emit("error", { error: "Invalid message data" });
          return;
        }

        // Create formatted message with unique ID
        const formattedMessage: Message = {
          id: uuidv4(), // Generate unique ID
          chatId: message.chatId,
          sender: message.sender,
          text: message.text,
          createdAt: new Date().toISOString(),
        };

        // Broadcast message to chat room
        io.to(message.chatId).emit("newMessage", formattedMessage);
        console.log(
          `Message sent from ${message.sender} in chat ${message.chatId}: ${message.text}`
        );
      } catch (error) {
        console.error("Error processing message:", error);
        socket.emit("error", { error: "Failed to send message" });
      }
    });

    socket.on("typing", (data: { chatId: string; sender: string }) => {
      if (!data.chatId || !data.sender) {
        socket.emit("error", { error: "Invalid typing data" });
        return;
      }
      socket.to(data.chatId).emit("typing", data);
      console.log(`User ${data.sender} is typing in chat ${data.chatId}`);
    });

    socket.on("stopTyping", (data: { chatId: string; sender: string }) => {
      if (!data.chatId || !data.sender) {
        socket.emit("error", { error: "Invalid typing data" });
        return;
      }
      socket.to(data.chatId).emit("stopTyping", data);
      console.log(`User ${data.sender} stopped typing in chat ${data.chatId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
      Array.from(socket.rooms)
        .filter((room) => room !== socket.id)
        .forEach((room) => leaveRoom(room));
    });
  });
};
