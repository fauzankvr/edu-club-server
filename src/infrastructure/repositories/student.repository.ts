  import { Model } from "mongoose";
  import { BaseRepository } from "./base.repository";
  import { IStudent } from "../database/models/StudentModel";
  import { StudentEntity } from "../../domain/entities/Student";
  import IStudentRepository from "../../application/interface/IStudentRepository";

  export class StudentRepository
    extends BaseRepository<IStudent, StudentEntity>
    implements IStudentRepository
  {
    constructor(private _studentModel: Model<IStudent>) {
      super(_studentModel, StudentRepository.toEntity);
    }

    // DB doc -> Entity mapper
    private static toEntity(student: IStudent): StudentEntity {
      return new StudentEntity(
        student._id.toString(),
        student.email,
        student.password,
        student.isBlocked,
        student.firstName ?? "unknown",
        student.lastName,
        student.phone,
        student.linkedInId,
        student.githubId,
        student.googleId,
        student.profileImage,
        student.createdAt,
        student.updatedAt
      );
    }


    async findByEmail(email: string): Promise<StudentEntity | null> {
      const student = await this._studentModel.findOne({ email });
      return student ? StudentRepository.toEntity(student) : null;
    }

    async updateProfile(
      email: string,
      updateData: Partial<StudentEntity>
    ): Promise<StudentEntity | null> {
      const updated = await this._studentModel.findOneAndUpdate(
        { email },
        { $set: updateData },
        { new: true }
      );
      return updated ? StudentRepository.toEntity(updated) : null;
    }

    async list(limit: number, skip: number): Promise<StudentEntity[]> {
      const students = await this._studentModel
        .find({})
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      return students.map(StudentRepository.toEntity);
    }

    async count(): Promise<number> {
      return this._studentModel.countDocuments();
    }

  }
