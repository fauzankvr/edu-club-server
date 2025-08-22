import { Student } from "../../domain/entities/Student";
import { IStudent } from "../../infrastructure/database/models/StudentModel";
import { IBaseRepo } from "./IBaseRepository";

interface IStudentRepository extends IBaseRepo<IStudent> {
  findStudentByEmail(email: string): Promise<IStudent | null>;
  updateProfileByEmail(email: string, updateData: object): Promise<boolean>;
  getAllStudents(limit: number, skip: number): Promise<IStudent[]>;
  countAllStudents(): Promise<number>;
  findSafeStudentByEmail(email: string): Promise<IStudent | null>;
}

export default IStudentRepository;
