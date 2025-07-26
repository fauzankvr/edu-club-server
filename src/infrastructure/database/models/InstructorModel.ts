import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IInstructor extends Document {
  _id: ObjectId;

  // Account Information
  email: string;
  password?: string;
  isBlocked: boolean;
  isApproved?: boolean;
  isEmailVerified?: boolean;
  isTempPassword?: boolean;
  loginType: "manual" | "google";
  googleId?: string;

  // Personal Details
  fullName?: string;
  dateOfBirth?: Date | null;
  phone?: number;
  profileImage?: string;
  Biography?: string;

  // Educational Details
  eduQulification?: string;
  expertise?: string[];
  experience?: number;
  teachingExperience?: number;
  languages?: string[];
  certifications?: string[];

  // Professional Details
  currentPosition?: string;
  workPlace?: string;
  linkedInProfile?: string;
  website?: string;

  // Contact & Location
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  paypalEmail?: string;

  // Social Media
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

const InstructorSchema: Schema = new Schema(
  {
    // ================================
    // ACCOUNT INFORMATION
    // ================================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String},
    isBlocked: { type: Boolean, required: true, default: false },
    isApproved: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isTempPassword: { type: Boolean, default: false },
    loginType: {
      type: String,
      enum: ["manual", "google"],
      default: "manual",
    },
    googleId: { type: String, default: null },

    // ================================
    // PERSONAL DETAILS
    // ================================
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date },
    phone: { type: Number },
    profileImage: { type: String },
    Biography: { type: String, maxlength: 1000 },

    // ================================
    // EDUCATIONAL DETAILS
    // ================================
    eduQulification: { type: String },
    expertise: [{ type: String }],
    experience: { type: Number, default: 0, min: 0 },
    teachingExperience: { type: Number, default: 0, min: 0 },
    languages: [{ type: String }],
    certifications: [{ type: String }],

    // ================================
    // PROFESSIONAL DETAILS
    // ================================
    currentPosition: { type: String },
    workPlace: { type: String },
    linkedInProfile: { type: String },
    website: { type: String },

    // ================================
    // CONTACT INFORMATION
    // ================================
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },

    paypalEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    // ================================
    // SOCIAL MEDIA
    // ================================
    socialMedia: {
      twitter: { type: String },
      facebook: { type: String },
      instagram: { type: String },
      youtube: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InstructorSchema.index({ email: 1 });


const InstructorModal = mongoose.model<IInstructor>(
  "Instructor",
  InstructorSchema
);

export default InstructorModal;
