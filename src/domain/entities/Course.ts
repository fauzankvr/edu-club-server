import { InstructorEntity } from "./Instructor";

export class CourseEntity {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly language: string,
    public readonly category: string,
    public readonly courseImageId: string,
    public readonly points: string[],
    public readonly price: number,
    public readonly discount: string | null,
    public readonly students: string[] | null,
    public readonly instructor: string | null,
    public  id?: string,
    public readonly isBlocked?: boolean,
    public averageRating?:number
  ) {}
}

