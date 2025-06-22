import { Model } from "mongoose";
import { ICurriculum } from "../database/models/CarriculamModel";
import { ISection } from "../database/models/CarriculamModel"; 
import ICurriculumRepo
    from "../../application/interface/ICurriculamRepo"; 
import mongoose from "mongoose";
import { threeDSecureAuthenticationResponseSchema } from "@paypal/paypal-server-sdk/dist/types/models/threeDSecureAuthenticationResponse";

export class CurriculumRepository implements ICurriculumRepo {
  constructor(public CurriculumModel: Model<ICurriculum>) {}

  async saveCurriculum(
    courseId: string,
    instructor: string,
    sections: ISection[]
  ): Promise<boolean> {
    const existing = await this.CurriculumModel.findOne({ courseId });
    if (existing) {
      existing.sections = sections;
      existing.instructor = instructor;
      await existing.save();
    } else {
      const newCurriculum = new this.CurriculumModel({
        courseId,
        instructor,
        sections,
      });
      await newCurriculum.save();
    }
    return true;
  }

  async getCurriculumByCourseId(courseId: string): Promise<ICurriculum | null> {
    return this.CurriculumModel.findOne({ courseId });
  }


  async getCurriculumTopics(id: string): Promise<any> {
    const courseObjectId = new mongoose.Types.ObjectId(id);
    return await this.CurriculumModel.findOne(
      { courseId: courseObjectId },
      { "sections.title": 1, "sections.lectures.title": 1, _id: 0 }
    ).lean();
    }
    getCarriculamTopics(courseId: string): Promise<ICurriculum|null> {
        return this.CurriculumModel.findOne({ courseId });
    }
}
