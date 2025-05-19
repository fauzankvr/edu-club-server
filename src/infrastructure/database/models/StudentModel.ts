import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStudents extends Document {
  email: string;
  password: string;
  isBlocked: boolean;
  firstName?: string;
  lastName?: string;
  phone?: number | null;
  linkedInId?: string | null;
  githubId?: string | null;
  googleId?: string | null;
  profileImage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  _id: Types.ObjectId;
}

const StudentsSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, 
    isBlocked: { type: Boolean, default: false },
    firstName: { type: String, required: true, default: "unknown" },
    lastName: { type: String },
    phone: { type: String, default: null },
    linkedInId: { type: String, default: null },
    githubId: { type: String, default: null },
    googleId: { type: String, default: null },
    profileImage: { type: String, default: null },
  },
  {
    timestamps: true, 
  }
);

const StudentModel = mongoose.model<IStudents>("Students", StudentsSchema);

export default StudentModel;
