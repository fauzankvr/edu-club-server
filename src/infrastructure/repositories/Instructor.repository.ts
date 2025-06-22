import { Model } from "mongoose";
import IInstructorRepo from "../../application/interface/IInstructorRepo";
import { Instructor } from "../../domain/entities/Instructor";
import {IInstructor} from "../database/models/InstructorModel";
import { BaseRepository } from "./base.repository";

export class InstructorRepository
  extends BaseRepository<IInstructor>
  implements IInstructorRepo
{
  constructor(private InstructorModal: Model<IInstructor>) {
    super(InstructorModal)
  }

  async createInstructor(instructor: Instructor): Promise<IInstructor> {
    return this.InstructorModal.create({
      email: instructor.email,
      password: instructor.password,
      isBlocked: false,
      fullName: instructor.fullName || "Anonymous",
      phone: instructor.phone,
      nationality: instructor.nationality,
      dateOfBirth: instructor.dateOfBirth,
      eduQulification: instructor.eduQulification,
      profileImage: instructor.profileImage,
    });
  }

  async findById(id: string): Promise<IInstructor | null> {
    return this.InstructorModal.findById(id);
  }

  async findInstructorByEmail(email: string): Promise<IInstructor | null> {
    return this.InstructorModal.findOne({ email });
  }

  async findAllInstructors(): Promise<IInstructor[]> {
    return this.InstructorModal.find();
  }

  async findSafeInstructorByEmail(email: string): Promise<IInstructor | null> {
    return this.InstructorModal.findOne({ email });
  }

  async updateProfileByEmail(
    email: string,
    updateData: Partial<IInstructor>
  ): Promise<IInstructor | null> {
    return this.InstructorModal.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, projection: "-password" }
    );
  }

  async getAllStudents(): Promise<IInstructor[]> {
    return this.InstructorModal.find();
  }

  async updatePaypalEmail(
    email: string,
    paypalEmail: string
  ): Promise<{ modifiedCount: number }> {
    return this.InstructorModal.updateOne({ email }, { paypalEmail });
  }
}
