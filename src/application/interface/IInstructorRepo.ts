import { Instructor } from "../../domain/entities/Instructor";
import { IInstructor } from "../../infrastructure/database/models/InstructorModel";
import { IBaseRepo } from "./IBaseRepo";

export default interface IInstructorRepo extends IBaseRepo<IInstructor> {
  createInstructor(instructor: Instructor): Promise<IInstructor>;
  findById(id: string): Promise<IInstructor | null>;
  findInstructorByEmail(email: string): Promise<IInstructor | null>;
  findAllInstructors(): Promise<IInstructor[]>;
  findSafeInstructorByEmail(email: string): Promise<IInstructor | null>;
  updateProfileByEmail(
    email: string,
    updateData: Partial<IInstructor>
  ): Promise<IInstructor | null>;
  getAllStudents(): Promise<IInstructor[]>;
  updatePaypalEmail(
    email: string,
    paypalEmail: string
  ): Promise<{ modifiedCount: number }>;
}
