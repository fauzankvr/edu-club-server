import mongoose, { Schema, Document } from "mongoose";

export interface ILectureProgress {
  lectureId: mongoose.Types.ObjectId;
  progress: string; // Percentage as string (e.g., "15", "50", "95")
}

export interface ISectionProgress {
  sectionId: mongoose.Types.ObjectId;
  lectures: ILectureProgress[];
  completed: boolean; // True if all lectures in section are >= 95%
}

export interface IProgress extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  sections: ISectionProgress[];
  completed: boolean;
  createdAt: Date;
  updatedAt: Date; 
}

const LectureProgressSchema: Schema = new Schema({
  lectureId: { type: Schema.Types.ObjectId, required: true },
  progress: { type: String, default: "0" },
});

const SectionProgressSchema: Schema = new Schema({
  sectionId: { type: Schema.Types.ObjectId, required: true },
  lectures: [LectureProgressSchema],
  completed: { type: Boolean, default: false },
});

const ProgressSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Students", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    sections: [SectionProgressSchema], 
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProgressModel = mongoose.model<IProgress>("Progress", ProgressSchema);

export default ProgressModel;
