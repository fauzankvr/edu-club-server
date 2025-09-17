import { CurriculumEntity } from "../../domain/entities/Curriculam";
import { ISection } from "../../infrastructure/database/models/CarriculamModel"; 

export default interface ICurriculumRepository {
  save(
    courseId: string,
    instructor: string,
    sections: ISection[]
  ): Promise<CurriculumEntity>;

  findByCourseId(courseId: string): Promise<CurriculumEntity | null>;
  findTopics(
    courseId: string
  ): Promise<Pick<CurriculumEntity, "sections"> | null>;
}
