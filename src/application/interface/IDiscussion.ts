import { Types } from "mongoose";

export interface IReply {
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
