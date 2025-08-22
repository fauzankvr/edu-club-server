import { ICourse } from "../../infrastructure/database/models/CourseModel";
import { ICurriculum, ISection } from "../../infrastructure/database/models/CarriculamModel";
import { CreateCourseDTO } from "../interface/Dto/courseDto";
import { IProgress } from "../../infrastructure/database/models/ProgressModel";

export interface ICourseUseCase {
  getFilterdCourses(
    search: string,
    skip: number,
    limit: number,
    sort?: string,
    category?: string,
    language?: string,
    rating?: string,
    priceMin?: string,
    priceMax?: string
  ): Promise<{
    courses: ICourse[];
    total: number;
    languages: string[];
    categories: string[];
  }>;

  createNewCourse(data: CreateCourseDTO): Promise<ICourse>;

  getAllCourses(email: string): Promise<ICourse[]>;

  getAdminAllCourses(limit: number, skip: number): Promise<ICourse[]>;
  getAdminCourseCount(): Promise<number>;

  getCourseById(id: string): Promise<ICourse>;

  updateCourse(id: string, updateData: Partial<ICourse>): Promise<ICourse>;

  getCurriculam(id: string): Promise<ICurriculum>;

  saveCurriculum(
    courseId: string,
    instructor: string,
    sections: ISection[],
    videoFiles: Express.Multer.File[],
    pdfFiles: Express.Multer.File[]
  ): Promise<boolean>;

  toggleCourseBlock(id: string): Promise<ICourse|null>;

  getInstructorAllCourses(email: string): Promise<ICourse[]>;

  getCourseByOrderId(orderId: string): Promise<ICourse>;

  getCurriculum(id: string): Promise<ICurriculum>;

  getCurriculumTopics(courseId: string): Promise<ICurriculum>;

  getAllProgress(studentId: string): Promise<IProgress[] | null>;

  getLessonProgress(
    courseId: string,
    studentId: string
  ): Promise<IProgress | null>;

  updateLessonProgress(
    courseId: string,
    studentId: string,
    sectionId: string,
    lectureId: string,
    progress: number
  ): Promise<IProgress>;

  getEnrolledCourses(email: string): Promise<any>;
}