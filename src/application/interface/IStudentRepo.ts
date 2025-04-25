import { SafeStudent } from "../../domain/entities/SafeStudent";
import { Student } from "../../domain/entities/Student";
import { IStudents } from "../../infrastructure/database/models/StudentModel";
import { LoginData } from "../../infrastructure/repositories/StudentRepositorie";

interface IStudentRepo {
  createStudent(student: Student): Promise<Student>;
  findStudentByEmail(email: string): Promise<Student | null>;
  updateProfileByEmail(email: string, updateData: object): Promise<boolean>;
  getAllStudents(): Promise<any[]>;
  blockStudent(email: string): Promise<boolean>;
  findSafeStudentByEmail(email: string): Promise<IStudents | null>;

  getAllCourses():Promise<any>
}

export default IStudentRepo;
