import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  userId: string;
  instructorId: string;
  userLastSeen?: Date;
  instructorLastSeen?: Date;
  lastMessage?:  string ;
  lastMessageTime?: Date ;
}

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: String, required: true },
    instructorId: { type: String, required: true },
    userLastSeen: { type: Date },
    instructorLastSeen: { type: Date },
    lastMessage: { type: String },
    lastMessageTime: { type: Date },
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model<IChat>("Chat", ChatSchema);
