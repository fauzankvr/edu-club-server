import { JwtPayload } from "jsonwebtoken";
import { Course } from "../../domain/entities/Course";
import { Instructor } from "../../domain/entities/Instructor";
import { ICourse } from "../../infrastructure/database/models/CourseModel";
import { sendOtpEmail } from "../../infrastructure/services/EmailService";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";
import { generateOtp } from "../../infrastructure/utility/GenerateOtp";
import IInstructorRepo from "../interface/IInstructorRepo";
import bcrypt from 'bcrypt'
import { ISection } from "../../infrastructure/database/models/CarriculamModel";
import { IInstructor } from "../../infrastructure/database/models/InstructorModel";
import { requestPayoutService } from "../../infrastructure/services/PayoutService";


export interface CreateCourseDTO {
  title: string;
  description: string;
  language: string;
  category: string;
  courseImageId: string;
  price: number;
  discount: string | null;
  points: string[];
  students: string[];
  instructor: any
}

export class InstructorUseCase {
  private instructorRepo: IInstructorRepo;
  constructor(instructorRepo: IInstructorRepo) {
    this.instructorRepo = instructorRepo;
  }

  async generateRefreshToken(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({
      {
        email: decoded.email,
        id: decoded.id,
        role: "instructor"
      }
    });
    return accessToken;
  }

  async signupAndSendOtp(email: string) {
    const existing = await this.instructorRepo.findInstrucotrByEmail(email);
    if (existing) throw new Error("User already exists");

    const lastOtp = await this.instructorRepo.findOtp(email);
    console.log(lastOtp);
    if (lastOtp && Date.now() - lastOtp.createdAt.getTime() < 3000) {
      throw new Error("Please wait before resending OTP");
    }

    const otp = generateOtp();
    console.log(otp);
    await sendOtpEmail(email, otp);
    await this.instructorRepo.saveOtp(email, otp);

    return { message: "OTP sented successfully" };
  }

  async verifyOtpAndSignup(email: string, otp: string, password: string) {
    const validOtp = await this.instructorRepo.findOtp(email);
    if (!validOtp) throw new Error("Invalid OTP");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newInstructor = new Instructor(email, hashedPassword, false);
    const createdInstructor = (await this.instructorRepo.crateInstructor(
      newInstructor
    )) as IInstructor;
    await this.instructorRepo.deleteOtp(email);

    if (!createdInstructor) {
      throw new Error("Issue faced while saving student in DB");
    }

    const id = createdInstructor?._id?.toString();

    // Generate tokens
    const payload = { email, id };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { message: "Signup successful", accessToken, refreshToken };
  }

  async loginInstructor(email: string, password: string) {
    const InstrucotrData = await this.instructorRepo.findSafeInstructorByEmail(
      email
    );
    if (!InstrucotrData) {
      throw new Error("Instructor not found");
    }
    if (InstrucotrData.IsBlocked) {
      throw new Error("Instructor is blocked");
    }
    const isMatch = await bcrypt.compare(password, InstrucotrData.password);
    if (!isMatch) {
      throw new Error("Invalid password");
    }
    const payload = { email: InstrucotrData.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      message: "Login successful",
      accessToken,
      refreshToken,
    };
  }
  
  async getProfile(email: any): Promise<IInstructor> {
    const instructorData = await this.instructorRepo.findInstrucotrByEmail(
      email
    );
    if (!instructorData) {
      throw new Error("Student not found");
    }
    return instructorData;
  }
  async updateProfile(email: any, updateData: object) {
    console.log("update profiel usecase");
    const instructorData = await this.instructorRepo.updateProfileByEmail(
      email,
      updateData
    );
    if (!instructorData) {
      throw new Error("Student updation is Faild");
    }
    return instructorData;
  }
  

  
}