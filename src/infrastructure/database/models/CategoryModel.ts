import mongoose, { Document,ObjectId,Schema} from "mongoose";

export interface ICategory extends Document {
    _id:ObjectId,
    name: string,
    isBlocked:boolean
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, require: true, unique: true },
  isBlocked: { type: Boolean, require: true, default: false },
});

export const CategoryModel = mongoose.model<ICategory>("Category", CategorySchema);