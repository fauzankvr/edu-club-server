import { IStudent } from "../../infrastructure/database/models/StudentModel";

export interface IStudentUseCase {
  // Profile management methods
  getProfile(email: string): Promise<IStudent>;
  updateProfile(email: string, updateData: StudentProfileUpdateDTO): Promise<boolean>;

  // Wishlist management methods
  findWishlist(studentId: string, courseId: string): Promise<any>;
  addWishlist(studentId: string, courseId: string): Promise<any>;
  removeWishlist(studentId: string, courseId: string): Promise<any>;
  getWishlist(studentEmail: string): Promise<any>;
}

// Supporting DTOs for better type safety
export interface StudentProfileUpdateDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
  linkedInId?: string;
  githubId?: string;
}
