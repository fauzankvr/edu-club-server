import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  user: string;
  name: string;
  rating: number;
  comment: string;
  likes: number;
  dislikes: number;
  likedBy: string[]; 
  dislikedBy: string[];
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    user: { type: String, required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [{ type: String }], 
    dislikedBy: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IReview>("Review", reviewSchema);
