import mongoose, { Schema, Document } from "mongoose";

// Define the IReaction sub-interface (for reactions array)
interface IReaction {
  userId: string;
  reaction: string; 
}

// Define the IMessage interface
export interface IMessage extends Document {
  _id: string;
  text: string;
  sender: string;
  chatId: string;
  createdAt: Date;
  updatedAt: Date;
  seenBy: string[]; // Fixed syntax: array of strings
  deleted: boolean; // Added for soft delete
  reactions: IReaction[]; // Added for reactions
}

// Define the Reaction sub-schema
const ReactionSchema = new Schema<IReaction>({
  userId: { type: String, required: true },
  reaction: { type: String, required: true },
});

// Define the Message schema
const MessageSchema = new Schema<IMessage>(
  {
    text: { type: String, required: true },
    sender: { type: String, required: true },
    chatId: { type: String, required: true },
    seenBy: [{ type: String }],
    deleted: { type: Boolean, default: false }, // Added for soft delete
    reactions: [ReactionSchema], // Added for reactions (array of sub-documents)
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
