import IStudentRepo from "../interface/IStudentRepo";
import { IWishlistRepo } from "../interface/IWishlistRepo";


export class StudentUseCase {
  constructor(private studentRepo: IStudentRepo,private wishlistRepo: IWishlistRepo) {}

  async getProfile(email: any) {
      const studentData = await this.studentRepo.findStudentByEmail(email);
    if (!studentData) {
      throw new Error("Student not found");
    }
    return studentData;
  }

  async updateProfile(email: any, updateData: object) {
    console.log("update profiel usecase");
    const studentData = await this.studentRepo.updateProfileByEmail(
      email,
      updateData
    );
    if (!studentData) {
      throw new Error("Student updation is Faild");
    }
    return studentData;
  }

  async findWishlist(studentId: string, courseId: string) {
    return this.wishlistRepo.findWishlist(studentId, courseId);
  }
  async addWishlist(studentId: string, courseId: string) {
    return this.wishlistRepo.addCourseToWishlist(studentId, courseId);
  }
  async removeWishlist(studentId: string, courseId: string) {
    return this.wishlistRepo.removeCourseFromWishlist(studentId, courseId);
  }
  async getWishlist(studentEmail: string) {
    return this.wishlistRepo.getWishlist(studentEmail);
    }
    
}