import { Schema, model, Document, Types } from "mongoose";

export interface IAiChatMessage extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  text: string;
  reply: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IAiChatMessage>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    text: { type: String, required: true },
    reply: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AiChatMessageModel = model<IAiChatMessage>(
  "AiChatMessage",
  ChatMessageSchema
);
