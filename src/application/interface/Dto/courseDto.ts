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
