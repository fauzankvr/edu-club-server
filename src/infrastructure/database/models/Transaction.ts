import { Schema, model, Types, Document } from "mongoose";

export interface ITransaction extends Document {
  studentId: Types.ObjectId;
  instructor: string;
  courseId: Types.ObjectId;
  totalAmount: number;
  adminShare: number;
  instructorShare: number;
  paymentStatus: string;
  paypalTransactionId: string;
  payoutStatus: "PENDING" | "REQUESTED" | "COMPLETED" | "FAILED";
  payoutId?: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    instructor: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },

    totalAmount: { type: Number, required: true },
    adminShare: { type: Number, required: true },
    instructorShare: { type: Number, required: true },
    paymentStatus: { type: String, required: true },
    paypalTransactionId: { type: String, required: true },

    payoutStatus: {
      type: String,
      enum: ["PENDING", "REQUESTED", "COMPLETED", "FAILED"],
      default: "PENDING",
      required: true,
    },
    payoutId: { type: String },

    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const TransactionModel = model<ITransaction>("Transaction", TransactionSchema);
export default TransactionModel;
