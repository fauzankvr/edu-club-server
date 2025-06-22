import mongoose, { Document,Schema} from "mongoose";

export interface ICategory extends Document{
    name: string,
    isBlocked:boolean
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, require: true, unique: true },
  isBlocked: { type: Boolean, require: true, default: false },
});

export const CategoryModel = mongoose.model<ICategory>("Category", CategorySchema);