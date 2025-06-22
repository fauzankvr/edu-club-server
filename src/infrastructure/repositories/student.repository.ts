import  { Model } from "mongoose";
import  { IStudent } from "../database/models/StudentModel";
import { BaseRepository } from "./base.repository"; 
import IStudentRepo from "../../application/interface/IStudentRepo";

export class StudentRepository
  extends BaseRepository<IStudent>
  implements IStudentRepo
{
  constructor(private studentModel: Model<IStudent>) {
    super(studentModel);
  }

  async findStudentByEmail(email: string): Promise<IStudent | null> {
    return await this.studentModel
      .findOne({ email })
      .select(
        "email isBlocked firstName lastName phone linkedInId githubId googleId profileImage createdAt updatedAt"
      );
  }

  async findSafeStudentByEmail(email: string): Promise<IStudent | null> {
    return await this.studentModel
      .findOne({ email })
      .select("email password isBlocked");
  }

  async updateProfileByEmail(
    email: string,
    updateData: object
  ): Promise<boolean> {
    const updated = await this.studentModel.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, projection: "-password" }
    );
    return !!updated;
  }

  async getAllStudents(): Promise<IStudent[]> {
    return await this.studentModel.find({});
  }

  async blockStudent(email: string): Promise<boolean> {
    const student = await this.studentModel.findOne({ email });
    if (student) {
      student.isBlocked = !student.isBlocked;
      await student.save();
      return student.isBlocked;
    }
    return false;
  }
}

