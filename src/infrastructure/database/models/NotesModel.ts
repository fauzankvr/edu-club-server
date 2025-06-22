import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface INotes extends Document {
  _id: ObjectId;
  title: String | null;
  notes: String[] | null;
  student_id: ObjectId | null;
  course_id: String | null;
}

const NotesSchema: Schema = new Schema<INotes>({
  title: { type: String },
  notes: [{ type: String,  }],
  student_id: { type: Schema.Types.ObjectId },
  course_id: { type: String },
});

const NotesModel = mongoose.model<INotes>('Notes', NotesSchema);

export default NotesModel;

