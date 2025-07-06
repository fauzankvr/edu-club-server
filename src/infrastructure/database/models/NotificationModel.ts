import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  studentId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  type: "course_update" | "quiz_reminder" | "message" | "achievement";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: "Instructor",
    required: true,
  },
  type: {
    type: String,
    enum: ["course_update", "quiz_reminder", "message", "achievement"],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
