import mongoose, { Schema, Document, ObjectId, Types } from "mongoose";

  export interface ICourse extends Document {
    _id: Types.ObjectId;
    title: string;
    description: string;
    language: string;
    category: string;
    courseImageId: string;
    points: string[];
    price: number;
    discount: string | null;
    students: ObjectId[] | null;
    instructor: string | null
    isBlocked?: boolean;
  }

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true },
  category: { type: String, required: true },
  courseImageId: { type: String },
  points: [{ type: String, required: true }],
  price: { type: Number, required: true },
  discount: { type: String },
  students: [{ type: Schema.Types.ObjectId }],
  instructor: { type: String },
  isBlocked: { type: Boolean, default: false },
});

const CourseModel = mongoose.model<ICourse>("Course", CourseSchema);

export default CourseModel;
