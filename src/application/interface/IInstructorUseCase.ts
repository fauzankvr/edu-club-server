import { IInstructor } from "../../infrastructure/database/models/InstructorModel";
import { InstructorSignupDTO } from "../useCase/instructor.usecase"; 

export interface IInstructorUseCase {
  generateRefreshToken(refreshToken: string): Promise<string>;

  signupAndSendOtp(
    applicationData: InstructorSignupDTO
  ): Promise<{ message: string }>;

  SendOtp(email: string): Promise<{ message: string }>;

  resetPassword(email: string, password: string): Promise<{ message: string }>;

  changePassword(
    email: string,
    currentPassword: string,
    password: string
  ): Promise<{ message: string }>;

  verifyOtpAndSignup(
    fullName: string,
    email: string,
    otp: string,
    password: string
  ): Promise<IInstructor|null>;

  loginInstructor(
    email: string,
    password: string
  ): Promise<{
    message: string;
    accessToken: string;
    refreshToken: string;
  }>;

  getProfile(email: string): Promise<IInstructor>;

  updateProfile(email: string, updateData: object): Promise<IInstructor>;

  updatePaypalEmail(email: string, paypalEmail: string): Promise<IInstructor|null>;
}
