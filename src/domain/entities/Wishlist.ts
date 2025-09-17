import { CourseEntity } from "./Course";

export class WishlistEntity {
  constructor(
    public student: string,
    public course: CourseEntity | string, 
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
