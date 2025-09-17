import { CourseEntity } from "../../domain/entities/Course";
import { CreateCourseDTO } from "./Dto/courseDto";

export interface FilteredCoursesResult {
  courses: CourseEntity[];
  total: number;
  languages: string[];
  categories: string[];
}

export default interface ICourseRepository {
  create(data: CourseEntity): Promise<CourseEntity>;
  findByTitle(
    title: string,
    instructor: string,
    excludeId?: string
  ): Promise<CourseEntity | null>;
  findById(id: string): Promise<CourseEntity | null>;
  findBlockedById(id: string): Promise<CourseEntity | null>;
  findByInstructor(email: string): Promise<CourseEntity[]>;
  update(id: string, data: Partial<CourseEntity>): Promise<CourseEntity | null>;
  filter(
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
  findAllByEmail(email: string): Promise<CourseEntity[]>;
  findAllAdmin(limit: number, skip: number): Promise<CourseEntity[]>;
  count(): Promise<number>;
}
