// import { ICourse } from "../../infrastructure/database/models/CourseModel";
import { ICurriculum, ISection } from "../../infrastructure/database/models/CarriculamModel";
import { CourseDto, CreateCourseDTO } from "../interface/Dto/courseDto";
import { IProgress } from "../../infrastructure/database/models/ProgressModel";
import { ProgressEntity } from "../../domain/entities/Progress";
import { CurriculumDto } from "./Dto/CurriculamDto";
import { CurriculumTopicsDto } from "./Dto/CurriculamTopic";

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
    courses: CourseDto[];
    total: number;
    languages: string[];
    categories: string[];
  }>;

  createNewCourse(data: CreateCourseDTO): Promise<CourseDto>;

  getAllCourses(email: string): Promise<CourseDto[]>;

  getAdminAllCourses(limit: number, skip: number): Promise<CourseDto[]>;
  getAdminCourseCount(): Promise<number>;

  getCourseById(id: string): Promise<CourseDto>;

  updateCourse(id: string, updateData: Partial<CourseDto>): Promise<CourseDto>;

  getCurriculam(id: string): Promise<CurriculumDto>;

  saveCurriculum(
    courseId: string,
    instructor: string,
    sections: ISection[],
    videoFiles: Express.Multer.File[],
    pdfFiles: Express.Multer.File[]
  ): Promise<boolean>;

  toggleCourseBlock(id: string): Promise<CourseDto | null>;

  getInstructorAllCourses(email: string): Promise<CourseDto[]>;

  getCourseByOrderId(orderId: string): Promise<CourseDto>;

  getCurriculum(id: string): Promise<CurriculumDto>;

  getCurriculumTopics(courseId: string): Promise<CurriculumTopicsDto>;

  getAllProgress(studentId: string): Promise<ProgressEntity[] | null>;

  getLessonProgress(
    studentId: string,
    courseId: string
  ): Promise<ProgressEntity>;

  updateLessonProgress(
    studentId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    progress: number
  ): Promise<ProgressEntity>;

  getEnrolledCourses(email: string): Promise<any>;
}