import IStudentRepository from "../interface/IStudentRepository";
import { IStudentUseCase } from "../interface/IStudentUseCase";
import { IWishlistRepository } from "../interface/IWishlistRepository";

export class StudentUseCase implements IStudentUseCase {
  constructor(
    private _studentRepository: IStudentRepository,
    private _wishlistRepository: IWishlistRepository
  ) {}

  async getProfile(email: any) {
    const studentData = await this._studentRepository.findStudentByEmail(email);
    if (!studentData) {
      throw new Error("Student not found");
    }
    return studentData;
  }

  async updateProfile(email: any, updateData: object) {
    const studentData = await this._studentRepository.updateProfileByEmail(
      email,
      updateData
    );
    if (!studentData) {
      throw new Error("Student updation is Faild");
    }
    return studentData;
  }

  async findWishlist(studentId: string, courseId: string) {
    return this._wishlistRepository.findWishlist(studentId, courseId);
  }
  async addWishlist(studentId: string, courseId: string) {
    return this._wishlistRepository.addCourseToWishlist(studentId, courseId);
  }
  async removeWishlist(studentId: string, courseId: string) {
    return this._wishlistRepository.removeCourseFromWishlist(
      studentId,
      courseId
    );
  }
  async getWishlist(studentEmail: string) {
    return this._wishlistRepository.getWishlist(studentEmail);
  }
}
