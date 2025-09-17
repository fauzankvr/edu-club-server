import { ProgressEntity } from "../../domain/entities/Progress";
import { IBaseRepo } from "./IBaseRepository";

export interface IProgressRepository extends IBaseRepo<ProgressEntity> {
  findByStudentAndCourse(
    studentId: string,
    courseId: string
  ): Promise<ProgressEntity | null>;
  saveProgress(progress: ProgressEntity): Promise<ProgressEntity>

  // save(
  //   studentId: string,
  //   courseId: string,
  //   sectionId: string,
  //   lectureId: string,
  //   progress: string
  // ): Promise<ProgressEntity>;

  findAllByStudent(studentId: string): Promise<ProgressEntity[]>;

  findByStudentId(studentId: string): Promise<ProgressEntity[] | null>;
}
