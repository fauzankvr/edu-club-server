import { Server, Socket } from "socket.io";

export const setupSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Handle joining a chat room
    socket.on("joinChat", (chatId: string) => {
      if (!chatId) {
        socket.emit("error", { error: "Chat ID is required" });
        return;
      }
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    // Handle typing event
    socket.on("typing", (data: { chatId: string; sender: string }) => {
      if (!data.chatId || !data.sender) {
        socket.emit("error", { error: "Chat ID and sender are required" });
        return;
      }
      socket.to(data.chatId).emit("typing", {
        sender: data.sender,
        chatId: data.chatId,
      });
    });

    // Handle stop typing event
    socket.on("stopTyping", (data: { chatId: string; sender: string}) => {
      if (!data.chatId || !data.sender) {
        socket.emit("error", { error: "Chat ID and sender are required" });
        return;
      }
      socket.to(data.chatId).emit("stopTyping", {
        sender: data.sender,
        chatId: data.chatId,
      });
    });

    // Handle sending a message
    socket.on(
      "sendMessage",
      async (data: { chatId: string; sender: string; text: string }) => {
        if (!data.chatId || !data.sender || !data.text) {
          socket.emit("error", {
            error: "Chat ID, sender, and text are required",
          });
          return;
        }

        try {
          // Create message payload for broadcasting
          const message = {
            id: `temp-${Date.now()}`, // Temporary ID until saved
            chatId: data.chatId,
            sender: data.sender,
            text: data.text,
            createdAt: new Date().toISOString(),
          };

          // Broadcast the message to the chat room (including sender)
          io.to(data.chatId).emit("newMessage", message);

        } catch (error: any) {
          console.error("Error handling message:", error);
          socket.emit("error", { error: "Failed to process message" });
        }
      }
    );

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
    });

    // Handle reconnection
    socket.on("reconnect", (attempt) => {
      console.log(`User reconnected: ${socket.id}, Attempt: ${attempt}`);
    });

    // Handle reconnection errors
    socket.on("reconnect_error", (error) => {
      console.error(`Reconnection error for ${socket.id}:`, error);
    });
  });
};
