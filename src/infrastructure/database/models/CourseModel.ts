import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  language: string;
  category: string;
  courseImageId: string;
  points: string[];
  price: number;
  discount: string | null;
  students: ObjectId[] | null;
  instructor:string|null
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
  instructor: { type: String},
});

const Course = mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
