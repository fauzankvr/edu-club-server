import { Schema, model, Types, Document } from "mongoose";

export interface IPayoutRequest extends Document {
  _id: Types.ObjectId;
  instructor: string;
  amount: number;
  paypalEmail: string;
  requestStatus: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  payoutId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutRequestSchema = new Schema<IPayoutRequest>(
  {
    instructor: {
      type: String,
      required: true,
    },
    amount: { type: Number, required: true },
    paypalEmail: { type: String, required: true },
    requestStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
      default: "PENDING",
      required: true,
    },
    payoutId: { type: String },
  },
  {
    timestamps: true, 
  }
);

const PayoutRequestModel = model<IPayoutRequest>(
  "Payout",
  PayoutRequestSchema
);
export default PayoutRequestModel;
