import { Instructor } from "../../domain/entities/Instructor";
import  { IInstructor } from "../../infrastructure/database/models/InstructorModel";
import { sendOtpEmail } from "../../infrastructure/services/EmailService";
import { generateAccessToken, generateRefreshToken, TokenPayload, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";
import { generateOtp } from "../../infrastructure/utility/GenerateOtp";
import { FAILED_RESET_PASSWORD, INVILED_CURR_PASSWORD, OTP_SENT, OTP_WAIT, SUCCESS_RESET_PASSWORD, USER_NOT_FOUND } from "../../interfaces/constants/responseMessage";
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

  async signupAndSendOtp(applicationData: IInstructor) {
    let email = applicationData.email;
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
    await this.instructorRepo.create(applicationData);

    return { message: "OTP sented successfully" };
  }

  async SendOtp(email: string) {
    const existing = await this.instructorRepo.findSafeInstructorByEmail(email);
    if (!existing) throw new Error(USER_NOT_FOUND);
    const lastOtp = await this.otpRepo.findOtp(email);
    if (lastOtp && Date.now() - lastOtp.createdAt.getTime() < 3000) {
      throw new Error(OTP_WAIT);
    }

    const otp = generateOtp();
    console.log(otp);
    await sendOtpEmail(email, otp);
    await this.otpRepo.createOtp(email, otp);

    return { message: OTP_SENT };
  }

  async resetPassword(email: string, password: string) {
    const existing = await this.instructorRepo.findSafeInstructorByEmail(email);
    if (!existing) throw new Error(USER_NOT_FOUND);

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdStudent = await this.instructorRepo.updateById(
      existing._id.toString(),
      { password: hashedPassword, isTempPassword: false }
    );
    if (!createdStudent) {
      throw new Error(FAILED_RESET_PASSWORD);
    }

    return { message: SUCCESS_RESET_PASSWORD };
  }
  async changePassword(email: string,currentPassword:string, password: string) {
    const existing = await this.instructorRepo.findSafeInstructorByEmail(email);
    if (!existing) throw new Error(USER_NOT_FOUND);
   if (existing.password) {
     const isMatch = await bcrypt.compare(currentPassword, existing.password);
     if (!isMatch) throw new Error(INVILED_CURR_PASSWORD);
   }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdStudent = await this.instructorRepo.updateById(
      existing._id.toString(),
      { password: hashedPassword}
    );
    if (!createdStudent) {
      throw new Error(FAILED_RESET_PASSWORD);
    }

    return { message: SUCCESS_RESET_PASSWORD };
  }

  async verifyOtpAndSignup(
    fullName: string,
    email: string,
    otp: string,
    password: string
  ) {
    const validOtp = await this.otpRepo.findOtp(email);
    otp = otp.trim().toString();

    if (!validOtp || validOtp.otp !== otp) throw new Error("Invalid OTP");

    // const hashedPassword = await bcrypt.hash(password, 10);

    // const newInstructor = new Instructor(
    //   email,
    //   hashedPassword,
    //   false,
    //   fullName
    // );
    // const createdInstructor = await this.instructorRepo.createInstructor(
    //   newInstructor
    // );
    const createdInstructor = await this.instructorRepo.updateProfileByEmail(
      email,
      { isEmailVerified: true }
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
    if (InstrucotrData.isBlocked) {
      throw new Error("Instructor is blocked");
    }
    if (InstrucotrData.isEmailVerified === false) {
      throw new Error("Email is not verified");
    }
    if (InstrucotrData.isApproved === false) {
      throw new Error("Please wait for admin approval to continue.");
    }
    if (InstrucotrData.password === null) {
      throw new Error("Password not found");
    }

    const isMatch = await bcrypt.compare(
      password,
      InstrucotrData.password as string
    );
    if (!isMatch) {
      throw new Error("Invalid password");
    }
    if (InstrucotrData.isTempPassword) {
      throw new Error("Please reset your password");
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