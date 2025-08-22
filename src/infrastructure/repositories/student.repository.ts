import  { Model } from "mongoose";
import  { IStudent } from "../database/models/StudentModel";
import { BaseRepository } from "./base.repository"; 
import IStudentRepository from "../../application/interface/IStudentRepository";

export class StudentRepository
  extends BaseRepository<IStudent>
  implements IStudentRepository
{
  constructor(private _studentModel: Model<IStudent>) {
    super(_studentModel);
  }

  async findStudentByEmail(email: string): Promise<IStudent | null> {
    return await this._studentModel
      .findOne({ email })
      .select(
        "email isBlocked firstName lastName phone linkedInId githubId googleId profileImage createdAt updatedAt"
      );
  }

  async findSafeStudentByEmail(email: string): Promise<IStudent | null> {
    return await this._studentModel
      .findOne({ email })
      .select("email password isBlocked");
  }

  async updateProfileByEmail(
    email: string,
    updateData: object
  ): Promise<boolean> {
    const updated = await this._studentModel.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, projection: "-password" }
    );
    return !!updated;
  }

  async getAllStudents(limit:number,skip:number): Promise<IStudent[]> {
    return await this._studentModel.find({}).limit(limit).skip(skip).sort({ createdAt: -1 });
  }
  countAllStudents(): Promise<number> {
    return this._studentModel.countDocuments();
  }

  async blockStudent(email: string): Promise<boolean> {
    const student = await this._studentModel.findOne({ email });
    if (student) {
      student.isBlocked = !student.isBlocked;
      await student.save();
      return student.isBlocked;
    }
    return false;
  }
}

