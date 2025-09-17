import mongoose, { Schema, Document } from "mongoose";

export interface IWishlist extends Document {
  student: string;
  course: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
        student: {
            type: String,
        },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { timestamps: true }
); 

export const WishlistModel = mongoose.model<IWishlist>(
  "Wishlist",
  WishlistSchema
);
