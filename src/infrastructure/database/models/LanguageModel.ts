import mongoose, { Document,Schema} from "mongoose";

export interface ILanguage extends Document{
    _id:mongoose.Types.ObjectId,
    name: string,
    isBlocked:boolean
}

const LanguageSchema = new Schema<ILanguage>({
  name: { type: String, require: true, unique: true },
  isBlocked: { type: Boolean, require: true, default: false },
});

export const LanguageModel = mongoose.model<ILanguage>("Language", LanguageSchema);