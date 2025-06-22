import { Schema, model, Document, Types } from "mongoose";



export interface IPlanCheckout extends Document {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  amount: number;
  currency: string;
  paymentMethod: "paypal" | "free";
  transactionId?: string;
  startDate: Date;
  endDate?: Date;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  createdAt: Date;
  updatedAt: Date;
}


const planCheckoutSchema = new Schema<IPlanCheckout>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["paypal", "free"],
    },
    transactionId: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    paypalOrderId: {
      type: String,
    },
    paypalCaptureId: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, 
  }
);

const PlanCheckoutModel = model<IPlanCheckout>(
  "PlanCheckout",
  planCheckoutSchema
);
export default PlanCheckoutModel;
