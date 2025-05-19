import mongoose, { Schema, Document } from "mongoose";
import { Chat } from "../../../domain/entities/Chat";

// Fix: omit `id` from the Chat type to avoid conflict with Mongoose
type ChatDoc = Omit<Chat, "id"> & Document;

const ChatSchema = new Schema<ChatDoc>(
  {
    userId: { type: String, required: true },
    instructorId: { type: String, required: true },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model<ChatDoc>("Chat", ChatSchema);
