import { InstructorEntity } from "../../../domain/entities/Instructor";
import { IInstructor } from "../../../infrastructure/database/models/InstructorModel";

export class InstructorDto {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly isBlocked: boolean,
    public readonly password?: string,
    public readonly isApproved?: boolean,
    public readonly isEmailVerified?: boolean,
    public readonly isTempPassword?: boolean,
    public readonly loginType?: "manual" | "google",
    public readonly googleId?: string | null,

    public readonly fullName?: string,
    public readonly dateOfBirth?: Date | null,
    public readonly phone?: number,
    public readonly profileImage?: string,
    public readonly biography?: string,

    public readonly eduQulification?: string,
    public readonly expertise?: string[],
    public readonly experience?: number,
    public readonly teachingExperience?: number,
    public readonly languages?: string[],
    public readonly certifications?: string[],

    public readonly currentPosition?: string,
    public readonly workPlace?: string,
    public readonly linkedInProfile?: string,
    public readonly website?: string,

    public readonly address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    },

    public readonly paypalEmail?: string,

    public readonly socialMedia?: {
      twitter?: string;
      facebook?: string;
      instagram?: string;
      youtube?: string;
    },

    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  // ---------- Map Entity → DTO ----------
  static fromEntity(entity: InstructorEntity): InstructorDto {
    return new InstructorDto(
      entity.id,
      entity.email,
      entity.isBlocked,
      entity.password,
      entity.isApproved,
      entity.isEmailVerified,
      entity.isTempPassword,
      entity.loginType,
      entity.googleId,

      entity.fullName,
      entity.dateOfBirth,
      entity.phone,
      entity.profileImage,
      entity.Biography, // note: Biography → biography

      entity.eduQulification,
      entity.expertise,
      entity.experience,
      entity.teachingExperience,
      entity.languages,
      entity.certifications,

      entity.currentPosition,
      entity.workPlace,
      entity.linkedInProfile,
      entity.website,

      entity.address,
      entity.paypalEmail,
      entity.socialMedia,

      entity.createdAt,
      entity.updatedAt
    );
  }

  // ---------- Map Persistence (Mongoose doc) → DTO ----------
  static fromPersistence(doc: IInstructor): InstructorDto {
    return new InstructorDto(
      doc._id.toString(),
      doc.email,
      doc.isBlocked,
      doc.password,
      doc.isApproved,
      doc.isEmailVerified,
      doc.isTempPassword,
      doc.loginType,
      doc.googleId,

      doc.fullName,
      doc.dateOfBirth,
      doc.phone,
      doc.profileImage,
      doc.Biography,

      doc.eduQulification,
      doc.expertise,
      doc.experience,
      doc.teachingExperience,
      doc.languages,
      doc.certifications,

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
  }
}
