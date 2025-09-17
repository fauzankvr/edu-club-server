import mongoose, { Schema, Document } from "mongoose";

export interface ICallHistory extends Document {
  _id: mongoose.Types.ObjectId;
  roomId: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  startedAt: Date;
  endedAt?: Date;
}

const CallHistorySchema = new Schema<ICallHistory>(
  {
    roomId: { type: String, required: true },
    callerId: { type: String, required: true },
    callerName: { type: String, required: true },
    receiverId: { type: String, required: true },
    receiverName: { type: String, required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date }, // optional, update on disconnect or end
  },
  { timestamps: true }
);

export const CallHistoryModel = mongoose.model<ICallHistory>(
  "CallHistory",
  CallHistorySchema
);
