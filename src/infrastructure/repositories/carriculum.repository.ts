import mongoose, { Model } from "mongoose";
import { ICurriculum, ISection } from "../database/models/CarriculamModel";
import ICurriculumRepo from "../../application/interface/ICurriculamRepository";
import { CurriculumEntity, LectureEntity, SectionEntity } from "../../domain/entities/Curriculam";

export class CurriculumRepository implements ICurriculumRepo {
  constructor(private readonly _curriculumModel: Model<ICurriculum>) {}

  // ---------------- Mappers ----------------
  private toEntity(curriculum: ICurriculum): CurriculumEntity {
    const sections: SectionEntity[] = curriculum.sections.map((section) => ({
      id: section._id.toString(),
      title: section.title,
      lectures: section.lectures.map((lec) => ({
        id: lec._id.toString(),
        title: lec.title,
        videoPath: lec.videoPath,
        pdfPath: lec.pdfPath,
      })) as LectureEntity[],
    }));

    return new CurriculumEntity(
      curriculum._id.toString(),
      curriculum.courseId.toString(),
      curriculum.instructor,
      sections,
      curriculum.createdAt,
      curriculum.updatedAt
    );
  }

  // ---------------- Repository Methods ----------------
  async save(
    courseId: string,
    instructor: string,
    sections: ISection[]
  ): Promise<CurriculumEntity> {
    let doc = await this._curriculumModel.findOne({ courseId });
    if (doc) {
      doc.sections = sections;
      doc.instructor = instructor;
      await doc.save();
    } else {
      doc = new this._curriculumModel({
        courseId,
        instructor,
        sections,
      });
      await doc.save();
    }
    return this.toEntity(doc);
  }

  async findByCourseId(courseId: string): Promise<CurriculumEntity | null> {
    const doc = await this._curriculumModel.findOne({ courseId });
    return doc ? this.toEntity(doc) : null;
  }

  async findTopics(
    id: string
  ): Promise<Pick<CurriculumEntity, "sections"> | null> {
    const courseObjectId = new mongoose.Types.ObjectId(id);
    const doc = await this._curriculumModel
      .findOne(
        { courseId: courseObjectId },
        { "sections.title": 1, "sections.lectures.title": 1 }
      )
      .lean();

    if (!doc) return null;

    // Map only sections + lectures titles
    const sections: SectionEntity[] = doc.sections.map((section: any) => ({
      id: section._id?.toString() || "",
      title: section.title,
      lectures: section.lectures.map((lec: any) => ({
        id: lec._id?.toString() || "",
        title: lec.title,
      })) as LectureEntity[],
    }));

    return { sections };
  }

  async getCarriculamTopics(
    courseId: string
  ): Promise<CurriculumEntity | null> {
    const doc = await this._curriculumModel.findOne({ courseId });
    return doc ? this.toEntity(doc) : null;
  }
}
