import { Model } from "mongoose";
import IInstructorRepo from "../../application/interface/IInstructorRepository";
import { InstructorEntity } from "../../domain/entities/Instructor";
import { IInstructor } from "../database/models/InstructorModel";
import { BaseRepository } from "./base.repository";

// ---------------- Mappers ----------------
const toEntity = (doc: IInstructor): InstructorEntity => {
  if (!doc) throw new Error("Instructor not found");

  return new InstructorEntity(
    doc._id.toString(),
    doc.email,
    doc.isBlocked,
    doc.password,
    doc.isApproved,
    doc.isEmailVerified,
    doc.isTempPassword,
    doc.loginType,
    doc.googleId ?? null,
    doc.fullName,
    doc.dateOfBirth ?? null,
    doc.phone,
    doc.profileImage,
    doc.Biography,
    doc.eduQulification,
    doc.expertise ?? [],
    doc.experience ?? 0,
    doc.teachingExperience ?? 0,
    doc.languages ?? [],
    doc.certifications ?? [],
    doc.currentPosition,
    doc.workPlace,
    doc.linkedInProfile,
    doc.website,
    doc.address,
    doc.paypalEmail,
    doc.socialMedia,
    doc.createdAt,
    doc.updatedAt
  );
};

const toDocument = (entity: InstructorEntity): Partial<IInstructor> => ({
  email: entity.email,
  // password: entity.password,
  isBlocked: entity.isBlocked,
  fullName: entity.fullName,
  phone: entity.phone,
  dateOfBirth: entity.dateOfBirth,
  eduQulification: entity.eduQulification,
  profileImage: entity.profileImage,
  expertise: entity.expertise,
  experience: entity.experience,
  teachingExperience: entity.teachingExperience,
  languages: entity.languages,
  certifications: entity.certifications,
  currentPosition: entity.currentPosition,
  workPlace: entity.workPlace,
  linkedInProfile: entity.linkedInProfile,
  website: entity.website,
  address: entity.address,
  paypalEmail: entity.paypalEmail,
  socialMedia: entity.socialMedia,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
});

// ---------------- Repository ----------------
export class InstructorRepository
  extends BaseRepository<IInstructor, InstructorEntity>
  implements IInstructorRepo
{
  constructor(private _instructorModel: Model<IInstructor>) {
    super(_instructorModel, toEntity);
  }

  async createInstructor(
    instructor: InstructorEntity
  ): Promise<InstructorEntity> {
    const doc = await this._instructorModel.create(toDocument(instructor));
    return toEntity(doc);
  }

  async findById(id: string): Promise<InstructorEntity | null> {
    const doc = await this._instructorModel.findById(id);
    return doc ? toEntity(doc) : null;
  }

  async findInstructorByEmail(email: string): Promise<InstructorEntity | null> {
    const doc = await this._instructorModel.findOne({ email });
    return doc ? toEntity(doc) : null;
  }

  async findAllInstructors(): Promise<InstructorEntity[]> {
    const docs = await this._instructorModel.find().sort({ createdAt: -1 });
    return docs.map(toEntity);
  }

  async findSafeInstructorByEmail(
    email: string
  ): Promise<InstructorEntity | null> {
    const doc = await this._instructorModel.findOne({ email });
    return doc ? toEntity(doc) : null;
  }

  async updateProfileByEmail(
    email: string,
    updateData: Partial<InstructorEntity>
  ): Promise<InstructorEntity | null> {
    const doc = await this._instructorModel.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, projection: "-password" }
    );
    return doc ? toEntity(doc) : null;
  }

  async getAllStudents(): Promise<InstructorEntity[]> {
    const docs = await this._instructorModel.find();
    return docs.map(toEntity);
  }

  async updatePaypalEmail(
    email: string,
    paypalEmail: string
  ): Promise<{ modifiedCount: number }> {
    return this._instructorModel.updateOne({ email }, { paypalEmail });
  }
  count(): Promise<number> {
    return this._instructorModel.countDocuments();
  }
}
