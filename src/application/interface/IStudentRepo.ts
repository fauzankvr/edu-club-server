import { Student } from "../../domain/entities/Student";
import { IStudent } from "../../infrastructure/database/models/StudentModel";
import { IBaseRepo } from "./IBaseRepo";

interface IStudentRepo extends IBaseRepo<IStudent> {
  findStudentByEmail(email: string): Promise<IStudent | null>;
  updateProfileByEmail(email: string, updateData: object): Promise<boolean>;
  getAllStudents(): Promise<IStudent[]>;
  findSafeStudentByEmail(email: string): Promise<IStudent | null>;
}

export default IStudentRepo;
