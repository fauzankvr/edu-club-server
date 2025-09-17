export class InstructorEntity {
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
    public readonly Biography?: string,

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
}
