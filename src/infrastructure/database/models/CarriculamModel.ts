// models/Curriculum.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ILecture {
  title: string;
  videoPath?: string; 
  pdfPath?: string; 
}

export interface ISection {
  title: string;
  lectures: ILecture[];
}

export interface ICurriculum extends Document {
  courseId: mongoose.Types.ObjectId; 
  instructor: string; 
  sections: ISection[];
}

const LectureSchema: Schema = new Schema({
  title: { type: String, required: true },
  videoPath: { type: String },
  pdfPath: { type: String },
});

const SectionSchema: Schema = new Schema({
  title: { type: String, required: true },
  lectures: [LectureSchema],
});

const CurriculumSchema: Schema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    instructor: { type: String, required: true },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ICurriculum>("Curriculum", CurriculumSchema);
