import { Model, Types } from "mongoose";
import { IProgress } from "../database/models/ProgressModel";
import { BaseRepository } from "./base.repository";
import { IProgressRepository } from "../../application/interface/IProgressRepository";
import { ICurriculum } from "../database/models/CarriculamModel";
import InstructorModal from "../database/models/InstructorModel";
import { ProgressEntity } from "../../domain/entities/Progress";

 const toEntity = function (progressDoc: IProgress): ProgressEntity {
    return new ProgressEntity(
      progressDoc._id.toString(),
      progressDoc.studentId.toString(),
      progressDoc.courseId.toString(),
      progressDoc.sections.map((sec) => ({
        sectionId: sec.sectionId.toString(),
        lectures: sec.lectures.map((lec) => ({
          lectureId: lec.lectureId.toString(),
          progress: lec.progress,
        })),
        completed: sec.completed,
      })),
      progressDoc.completed,
      progressDoc.createdAt,
      progressDoc.updatedAt
    );
  }

export class ProgressRepository
  extends BaseRepository<IProgress, ProgressEntity>
  implements IProgressRepository
{
  constructor(private _progressModel: Model<IProgress>) {
    super(_progressModel, toEntity);
  }

  async findByStudentAndCourse(
    studentId: string,
    courseId: string
  ): Promise<ProgressEntity | null> {
    console.log("studentid", studentId,courseId);
    const progressDoc = await this._progressModel.findOne({
      studentId: new Types.ObjectId(courseId),
      courseId: new Types.ObjectId(studentId),
      
    });
    return progressDoc ? toEntity(progressDoc) : null;
  }

  async saveProgress(progress: ProgressEntity): Promise<ProgressEntity> {
    const doc = await this._progressModel
      .findByIdAndUpdate(
        progress.id,
        {
          studentId: progress.studentId,
          courseId: progress.courseId,
          sections: progress.sections,
          completed: progress.completed,
        },
        { upsert: true, new: true }
      )
      .exec();

    // if (!doc) throw new Error("Failed to save progress");
    return toEntity(doc);
  }

  async findAllByStudent(studentId: string): Promise<ProgressEntity[]> {
    const docs = await this._progressModel
      .find({
        studentId: new Types.ObjectId(studentId),
      })
      .exec();
    return docs.map((doc) => toEntity(doc));
  }

  async findByStudentId(studentId: string): Promise<ProgressEntity[]> {
    const docs = await this._progressModel
      .find({ studentId })
      .populate({
        path: "courseId",
        model: "Course",
      })
      .lean();

    return docs.map(
      (doc: any) =>
        new ProgressEntity(
          doc._id.toString(),
          doc.studentId.toString(),
          doc.courseId,
          doc.sections.map((sec: any) => ({
            sectionId: sec.sectionId.toString(),
            lectures: sec.lectures.map((lec: any) => ({
              lectureId: lec.lectureId.toString(),
              progress: lec.progress,
            })),
            completed: sec.completed,
          })),
          doc.completed,
          doc.createdAt,
          doc.updatedAt
        )
    );
  }
}
