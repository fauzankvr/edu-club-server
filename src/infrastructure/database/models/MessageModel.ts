import mongoose, { Schema, Document } from "mongoose";
import { Message } from "../../../domain/entities/Message";

// Define the IMessage interface
export interface IMessage extends Document {
  text: string;
  sender: string;
  chatId: string;
  createdAt: Date;
  updatedAt: Date;
  seenBy: [{ type: String }];
}

// Define the Message schema
const MessageSchema = new Schema<IMessage>(
  {
    text: { type: String, required: true },
    sender: { type: String, required: true },
    chatId: { type: String, required: true },
    seenBy: [{ type: String }],
  },
  { timestamps: true }
);


export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);