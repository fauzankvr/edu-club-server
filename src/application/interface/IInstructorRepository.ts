import { InstructorEntity } from "../../domain/entities/Instructor";
import { IBaseRepo } from "./IBaseRepository";

export default interface IInstructorRepository
  extends IBaseRepo<InstructorEntity> {
  createInstructor(instructor: InstructorEntity): Promise<InstructorEntity>;
  findById(id: string): Promise<InstructorEntity | null>;
  findInstructorByEmail(email: string): Promise<InstructorEntity | null>;
  findAllInstructors(): Promise<InstructorEntity[]>;
  findSafeInstructorByEmail(email: string): Promise<InstructorEntity | null>;
  updateProfileByEmail(
    email: string,
    updateData: Partial<InstructorEntity>
  ): Promise<InstructorEntity | null>;
  getAllStudents(): Promise<InstructorEntity[]>; 
  updatePaypalEmail(
    email: string,
    paypalEmail: string
  ): Promise<{ modifiedCount: number }>;
  count(): Promise<number>;
}
