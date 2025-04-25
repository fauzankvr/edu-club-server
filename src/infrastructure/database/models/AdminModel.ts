import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  password: string;
}

const AdminSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
