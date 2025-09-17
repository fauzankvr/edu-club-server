import { Types } from "mongoose";

export interface IReply {
  _id: Types.ObjectId;
  discussionId: string,
  userId:Types.ObjectId,
  text: string;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  createdAt: Date;
}

export interface IDiscussion extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: string;
    text: string;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  replies: IReply[];
  createdAt: Date;
}
