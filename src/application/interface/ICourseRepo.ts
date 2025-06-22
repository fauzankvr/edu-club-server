import { Course } from "../../domain/entities/Course";
import { ICourse } from "../../infrastructure/database/models/CourseModel";
import { CreateCourseDTO } from "./Dto/courseDto"; 

export interface FilteredCoursesResult {
  courses: Course[]; // make sure you have a Course interface defined
  total: number;
  languages: string[];
  categories: string[];
}

export default interface ICourseRepo {
  createCourse(courseData: CreateCourseDTO): Promise<ICourse>;
  findCourseByTitle(
    title: string,
    instructor: string,
    excludeId?: string
  ): Promise<ICourse | null>;
  getCourseById(id: string): Promise<ICourse | null>;
  getAllInstructorCourses(email: string): Promise<ICourse[]>;
  updateCourseById(
    id: string,
    updateData: Partial<ICourse>
  ): Promise<ICourse | null>;
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
  ): Promise<FilteredCoursesResult>;
  getAllCourses(email: string): Promise<ICourse[]>;
}
