import { Instructor } from "../../domain/entities/Instructor";
import  { IInstructor } from "../../infrastructure/database/models/InstructorModel";
import { sendOtpEmail } from "../../infrastructure/services/EmailService";
import { generateAccessToken, generateRefreshToken, TokenPayload, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";
import { generateOtp } from "../../infrastructure/utility/GenerateOtp";
import IInstructorRepo from "../interface/IInstructorRepo";
import { IOtpRepo } from "../interface/IotpRepo";
import bcrypt from "bcrypt";

export class InstructorUseCase {
  constructor(
    private instructorRepo: IInstructorRepo,
    private otpRepo: IOtpRepo
  ) {}

  async generateRefreshToken(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const TokenPayload: TokenPayload = {
      email: decoded.email,
      id: decoded.id,
      role: "instructor",
    };
    const accessToken = generateAccessToken(TokenPayload);
    return accessToken;
  }

  async signupAndSendOtp(email: string) {
    const existing = await this.instructorRepo.findInstructorByEmail(email);
    if (existing) throw new Error("User already exists");

    const lastOtp = await this.otpRepo.findOtp(email);
    console.log(lastOtp);
    if (lastOtp && Date.now() - lastOtp.createdAt.getTime() < 3000) {
      throw new Error("Please wait before resending OTP");
    }

    const otp = generateOtp();
    console.log(otp);
    await sendOtpEmail(email, otp);
    await this.otpRepo.createOtp(email, otp);

    return { message: "OTP sented successfully" };
  }

  async verifyOtpAndSignup(email: string, otp: string, password: string) {
    const validOtp = await this.otpRepo.findOtp(email);
    if (!validOtp) throw new Error("Invalid OTP");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newInstructor = new Instructor(email, hashedPassword, false);
    const createdInstructor = await this.instructorRepo.createInstructor(
      newInstructor
    );

    await this.otpRepo.deleteOtp(email);

    return createdInstructor;
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
    const TokenPayload: TokenPayload = {
      email: InstrucotrData.email,
      id: InstrucotrData.id,
      role: "instructor",
    };
    const accessToken = generateAccessToken(TokenPayload);
    const refreshToken = generateRefreshToken(TokenPayload);

    return {
      message: "Login successful",
      accessToken,
      refreshToken,
    };
  }

  async getProfile(email: any): Promise<IInstructor> {
    const instructorData = await this.instructorRepo.findInstructorByEmail(
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
  updatePaypalEmail(email: string, paypalEmail: string) {
    const updated = this.instructorRepo.updateProfileByEmail(email, {
      paypalEmail,
    });
    if (!updated) {
      throw new Error("Failed to update PayPal email");
    }
    return updated;
  }
}  