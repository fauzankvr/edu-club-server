import mongoose, { Document,Schema} from "mongoose";

export interface CategoryDoc extends Document{
    name: string,
    isBlocked:boolean
}

const CategorySchema = new Schema<CategoryDoc>({
    name: { type: String, require: true, unique: true },
    isBlocked: { type: Boolean, require: true, default: false },
})

export const CategoryModel = mongoose.model<CategoryDoc>("Category", CategorySchema);