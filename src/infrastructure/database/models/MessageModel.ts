import mongoose, { Schema, Document } from "mongoose";
import { Message } from "../../../domain/entities/Message";

type MessageDoc = Omit<Message, "id"> & Document;

const MessageSchema = new Schema<MessageDoc>(
  {
    text: { type: String, required: true },
    sender: { type: String, required: true },
    chatId: { type: String, required: true },
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model<MessageDoc>(
  "Message",
  MessageSchema
);
