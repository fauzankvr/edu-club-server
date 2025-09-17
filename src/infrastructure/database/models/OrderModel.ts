import mongoose, { Schema, Document } from "mongoose";
import { ObjectId } from "mongoose";

export interface IOrder extends Document {
  _id: ObjectId;
  userId: string;
  courseId: string;
  quantity: number;
  paypalOrderId: string;
  status: "PENDING" | "PAID" | "FAILED";
  priceUSD: number;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    paypalOrderId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    priceUSD: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
