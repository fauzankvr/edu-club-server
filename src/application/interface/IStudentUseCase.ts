import { StudentEntity } from "../../domain/entities/Student";
import { StudentProfileUpdateDTO } from "./Dto/StudentDto";

export interface IStudentUseCase {
  // Profile management methods
  getProfile(email: string): Promise<StudentEntity>;
  updateProfile(
    email: string,
    updateData: StudentProfileUpdateDTO
  ): Promise<StudentEntity>;

  // Wishlist management methods
  findWishlist(studentId: string, courseId: string): Promise<any>;
  addWishlist(studentId: string, courseId: string): Promise<any>;
  removeWishlist(studentId: string, courseId: string): Promise<any>;
  getWishlist(studentEmail: string): Promise<any>;
}

