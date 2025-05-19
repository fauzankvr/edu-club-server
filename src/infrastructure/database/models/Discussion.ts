import mongoose, { Document, Schema, Types } from "mongoose";
import { IDiscussion, IReply } from "../../../application/interface/IDiscussion";


// ---------- Reply Schema ----------
const ReplySchema = new Schema<IReply>({
  discussionId: { type: String, require: true },
  userId: { type: Schema.Types.ObjectId, ref: "Students", required: true },
  text: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  dislikedBy: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

// ---------- Discussion Schema ----------
const DiscussionSchema = new Schema<IDiscussion>({
  studentId: { type: Schema.Types.ObjectId, ref: "Students", required: true },
  courseId: { type: String, require: true },
  text: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  dislikedBy: [{ type: String }],
  replies: [ReplySchema],
  createdAt: { type: Date, default: Date.now },
});


// ---------- Model ----------
const DiscussionModel = mongoose.model<IDiscussion>(
  "Discussion",
  DiscussionSchema
);
export default DiscussionModel;
