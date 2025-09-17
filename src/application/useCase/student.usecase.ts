import { StudentEntity } from "../../domain/entities/Student";
import { STUDENT_NOT_FOUND, STUDENT_UPDATE_FAILED, USER_BLOCKED } from "../../interfaces/constants/responseMessage";
import { StudentProfileUpdateDTO } from "../interface/Dto/StudentDto";
import IStudentRepository from "../interface/IStudentRepository";
import { IStudentUseCase } from "../interface/IStudentUseCase";
import { IWishlistRepository } from "../interface/IWishlistRepository";

export class StudentUseCase implements IStudentUseCase {
  constructor(
    private _studentRepository: IStudentRepository,
    private _wishlistRepository: IWishlistRepository
  ) {}

  async getProfile(email: string): Promise<StudentEntity> {
    const student = await this._studentRepository.findByEmail(email);
    if (!student) {
      throw new Error(STUDENT_NOT_FOUND);
    }
    if (student.isBlocked) {
      throw new Error(USER_BLOCKED);
    }
    return student;
  }

  async updateProfile(
    email: string,
    updateData: StudentProfileUpdateDTO
  ): Promise<StudentEntity> {
    const existingStudent = await this._studentRepository.findByEmail(email);
    if (!existingStudent) throw new Error(STUDENT_NOT_FOUND);
    if (existingStudent.isBlocked) throw new Error(USER_BLOCKED);

    // Merge DTO into existing entity
    const updatedEntity = new StudentEntity(
      existingStudent.id,
      existingStudent.email,
      existingStudent.password,
      existingStudent.isBlocked,
      updateData.firstName ?? existingStudent.firstName,
      updateData.lastName ?? existingStudent.lastName,
      updateData.phone ?? existingStudent.phone,
      updateData.linkedInId ?? existingStudent.linkedInId,
      updateData.githubId ?? existingStudent.githubId,
      existingStudent.googleId,
      updateData.profileImage ?? existingStudent.profileImage,
      existingStudent.createdAt,
      new Date()
    );

    // Send entity to repository
    const saved = await this._studentRepository.updateProfile(
      email,
      updatedEntity
    );
    if (!saved) throw new Error(STUDENT_UPDATE_FAILED);
    return saved;
  }

  // ✅ Fixed wishlist methods with proper ID handling
  async findWishlist(studentEmail: string, courseId: string) {
    const student = await this._studentRepository.findByEmail(studentEmail);
    if (!student) throw new Error(STUDENT_NOT_FOUND);
    if (!student?.id) throw new Error(STUDENT_NOT_FOUND);
    if (student.isBlocked) throw new Error(USER_BLOCKED);

    return this._wishlistRepository.find(student.id, courseId);
  }

  async addWishlist(studentEmail: string, courseId: string) {
    const student = await this._studentRepository.findByEmail(studentEmail);
    if (!student) throw new Error(STUDENT_NOT_FOUND);
    if (student.isBlocked) throw new Error(USER_BLOCKED);
    if (!student?.id) throw new Error(STUDENT_NOT_FOUND);
    const existing = await this._wishlistRepository.find(student.id, courseId);
    if (existing) throw new Error("ALREADY_IN_WISHLIST");

    return this._wishlistRepository.add(student.id, courseId);
  }

  async removeWishlist(studentEmail: string, courseId: string) {
    const student = await this._studentRepository.findByEmail(studentEmail);
    if (!student) throw new Error(STUDENT_NOT_FOUND);
    if (student.isBlocked) throw new Error(USER_BLOCKED);
    if (!student?.id) throw new Error(STUDENT_NOT_FOUND);
    return this._wishlistRepository.remove(student.id, courseId);
  }

  async getWishlist(studentEmail: string) {
    console.log("iam in get wishlist");
    const student = await this._studentRepository.findByEmail(studentEmail);
    if (!student) throw new Error(STUDENT_NOT_FOUND);
    if (student.isBlocked) throw new Error(USER_BLOCKED);
    if (!student?.id) throw new Error(STUDENT_NOT_FOUND);
    return this._wishlistRepository.getByStudentId(student.id); 
  }
}
