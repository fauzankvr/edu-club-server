import { StudentEntity } from "../../domain/entities/Student";
import { IBaseRepo } from "./IBaseRepository";

interface IStudentRepository extends IBaseRepo<StudentEntity> {
  findByEmail(email: string): Promise<StudentEntity | null>; 
  updateProfile(
    email: string,
    updateData: Partial<StudentEntity>
  ): Promise<StudentEntity | null>; 
  list(limit: number, skip: number): Promise<StudentEntity[]>;
  count(): Promise<number>; 
}


export default IStudentRepository;
