import { ICurriculum } from "../../infrastructure/database/models/CarriculamModel";
import { ISection } from "../../infrastructure/database/models/CarriculamModel"; 

export default interface ICurriculumRepo {
  saveCurriculum(
    courseId: string,
    instructor: string,
    sections: ISection[]
  ): Promise<boolean>;

  getCurriculumByCourseId(courseId: string): Promise<ICurriculum | null>;
  getCarriculamTopics(courseId: string): Promise<ICurriculum|null>;
}
