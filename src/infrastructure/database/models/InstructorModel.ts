import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IInstructor extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  IsBlocked: boolean;
  fullName?: string;
  nationality?: string | null;
  dateOfBirth?: Date | null;
  eduQulification?: string | null;
  phone?: number;
  profileImage?: string;
  paypalEmail?: string;
  Biography?:string
}

const InstructorSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  password: { type: String },
  IsBlocked: { type: Boolean, required: true, default: false },
  phone: { type: Number },
  profileImage: { type: String },
  nationality: { type: String },
  dateOfBirth: { type: Date },
  eduQulification: { type: String },
  email: { type: String, required: true, unique: true },
  paypalEmail: { type: String, default: "" },
  Biography:{type:String}
});

const InstructorModal = mongoose.model<IInstructor>("Instructor", InstructorSchema);

export default InstructorModal;
