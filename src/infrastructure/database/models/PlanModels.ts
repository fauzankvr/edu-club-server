import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFeature {
  description: string;
  icon: string;
  isAvailable?: boolean;
}

export interface IPlan extends Document {
  _id: Types.ObjectId;
  name: string;
  price: number;
  billingPeriod: "forever" | "year" | "month";
  features: IFeature[];
  isFeatured: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose schema
const PlanSchema = new Schema<IPlan>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  billingPeriod: {
    type: String,
    required: true,
    enum: ["forever", "year", "month"],
  },
  features: [
    {
      description: { type: String, required: true },
      icon: { type: String, required: true },
      isAvailable: { type: Boolean, default: true },
    },
  ],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const PlanModel = mongoose.model<IPlan>("Plan", PlanSchema);

export default PlanModel;
