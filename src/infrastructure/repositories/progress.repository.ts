import { Model, Types } from "mongoose";
import { IProgress } from "../database/models/ProgressModel";
import { BaseRepository } from "./base.repository";
import { IProgressRepo } from "../../application/interface/IProgressRepo";
import { ICurriculum } from "../database/models/CarriculamModel";
import InstructorModal from "../database/models/InstructorModel";

export class ProgressRepository
  extends BaseRepository<IProgress>
  implements IProgressRepo
{
  constructor(
    private ProgressModel: Model<IProgress>,
    private CurriculumModel: Model<ICurriculum>
  ) {
    super(ProgressModel);
  }

  async findByStudentAndCourse(
    studentId: string,
    courseId: string
  ): Promise<IProgress> {
    const studentObjectId = Types.ObjectId.isValid(studentId)
      ? new Types.ObjectId(studentId)
      : studentId;

    const courseObjectId = Types.ObjectId.isValid(courseId)
      ? new Types.ObjectId(courseId)
      : courseId;

    let progressDoc = await this.ProgressModel.findOne({
      studentId: studentObjectId,
      courseId: courseObjectId,
    }).exec();
    if (!progressDoc) {
      const curriculum = await this.CurriculumModel.findOne({
        courseId: courseObjectId,
      });
      if (!curriculum) {
        throw new Error(`Curriculum not found for course ID: ${courseId}`);
      }

      const sections = curriculum.sections.map((section) => ({
        sectionId: section._id,
        lectures: section.lectures.map((lecture) => ({
          lectureId: lecture._id,
          progress: "0",
        })),
        completed: false,
      }));

      progressDoc = new this.ProgressModel({
        studentId: studentObjectId,
        courseId: courseObjectId,
        sections,
        completed: false,
      });

      await progressDoc.save();
    }

    return progressDoc;
  }

  async createOrUpdateProgress(
    studentId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    progress: string
  ): Promise<IProgress> {
    if (!studentId || !courseId || !sectionId || !lectureId || !progress) {
      throw new Error("Missing required parameters for progress update");
    }

    const progressDoc = await this.findByStudentAndCourse(studentId, courseId);

    const section = progressDoc.sections.find((sec) =>
      sec.sectionId.equals(sectionId)
    );
    if (!section) {
      throw new Error(`Section not found for section ID: ${sectionId}`);
    }

    const lecture = section.lectures.find((lec) =>
      lec.lectureId.equals(lectureId)
    );
    if (!lecture) {
      throw new Error(`Lecture not found for lecture ID: ${lectureId}`);
    }

    lecture.progress = progress;

    section.completed = section.lectures.every(
      (lec) => parseInt(lec.progress) >= 95
    );

    progressDoc.completed = progressDoc.sections.every((sec) => sec.completed);

    await progressDoc.save();
    return progressDoc;
  }

  async findAllByStudent(studentId: string): Promise<IProgress[]> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new Error("Invalid studentId provided");
    }
    return this.ProgressModel.find({ studentId }).exec();
  }

  async findByStudentId(studentId: string): Promise<IProgress[] | null> {
    const progresses = await this.ProgressModel.find({ studentId })
      .populate({
        path: "courseId",
        select: "title instructor",
        model: "Course",
      })
      .populate({
        path: "studentId",
        select: "firstName lastName email",
      })
      .lean();

    for (const progress of progresses) {
      const course = progress.courseId as any;
      if (course && typeof course === "object" && "instructor" in course && course.instructor) {
        const instructorData = await InstructorModal.findOne({
          email: course.instructor,
        }).select("email fullName");

        course.instructor = instructorData
          ? {
              fullName: instructorData.fullName,
              email: instructorData.email,
            }
          : { email: course.instructor };
      }
    }

    return progresses;
  }
  
}
