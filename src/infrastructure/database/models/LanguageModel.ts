import mongoose, { Document,Schema} from "mongoose";

export interface LanguageDoc extends Document{
    name: string,
    isBlocked:boolean
}

const LanguageSchema = new Schema<LanguageDoc>({
  name: { type: String, require: true, unique: true },
  isBlocked: { type: Boolean, require: true, default: false },
});

export const LanguageModel = mongoose.model<LanguageDoc>("Language", LanguageSchema);