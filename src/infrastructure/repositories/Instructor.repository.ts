import { Model } from "mongoose";
import IInstructorRepo from "../../application/interface/IInstructorRepository";
import { Instructor } from "../../domain/entities/Instructor";
import {IInstructor} from "../database/models/InstructorModel";
import { BaseRepository } from "./base.repository";

export class InstructorRepository
  extends BaseRepository<IInstructor>
  implements IInstructorRepo
{
  constructor(private _instructorModal: Model<IInstructor>) {
    super(_instructorModal);
  }

  async createInstructor(instructor: Instructor): Promise<IInstructor> {
    return this._instructorModal.create({
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
    return this._instructorModal.findById(id);
  }

  async findInstructorByEmail(email: string): Promise<IInstructor | null> {
    return this._instructorModal.findOne({ email });
  }

  async findAllInstructors(): Promise<IInstructor[]> {
    return this._instructorModal.find().sort({ createdAt: -1 });
  }

  async findSafeInstructorByEmail(email: string): Promise<IInstructor | null> {
    return this._instructorModal.findOne({ email });
  }

  async updateProfileByEmail(
    email: string,
    updateData: Partial<IInstructor>
  ): Promise<IInstructor | null> {
    return this._instructorModal.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, projection: "-password" }
    );
  }

  async getAllStudents(): Promise<IInstructor[]> {
    return this._instructorModal.find();
  }

  async updatePaypalEmail(
    email: string,
    paypalEmail: string
  ): Promise<{ modifiedCount: number }> {
    return this._instructorModal.updateOne({ email }, { paypalEmail });
  }
}
