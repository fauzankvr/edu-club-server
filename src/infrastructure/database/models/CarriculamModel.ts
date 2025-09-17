// models/Curriculum.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ILecture {
  _id: string;
  title: string;
  videoPath?: string; 
  pdfPath?: string; 
}

export interface ISection {
  _id: string;
  title: string;
  lectures: ILecture[];
}

export interface ICurriculum extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  instructor: string;
  sections: ISection[];
  createdAt: Date;
  updatedAt: Date;
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

const CurriculumModel = mongoose.model<ICurriculum>("Curriculum", CurriculumSchema);

export default CurriculumModel;