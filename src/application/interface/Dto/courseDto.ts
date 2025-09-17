import { CourseEntity } from "../../../domain/entities/Course";
import { InstructorEntity } from "../../../domain/entities/Instructor";

export interface CreateCourseDTO {
  title: string;
  description: string;
  language: string;
  category: string;
  courseImageId: string;
  price: number;
  discount: string | null;
  points: string[];
  students: string[];
  instructor: any
}


export class CourseDto {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly language: string,
    public readonly category: string,
    public readonly courseImageId: string,
    public readonly points: string[],
    public readonly price: number,
    public readonly discount: string | null,
    public readonly instructor: string | null,
    public readonly isBlocked: boolean,
    public readonly students?: string[],
    public averageRating?:number
  ) {}

  static fromEntity(entity: CourseEntity): CourseDto {
    return new CourseDto(
      entity.id!,
      entity.title,
      entity.description,
      entity.language,
      entity.category,
      entity.courseImageId,
      entity.points,
      entity.price,
      entity.discount,
      entity.instructor,
      entity.isBlocked ?? false,
      entity.students?.map((item) => item?.toString()) ?? [],
      entity.averageRating
    );
  }
}
