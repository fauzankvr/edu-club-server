import { IGoogleAuthService } from "./IGoogleService";

export interface IAuthUseCase {
  // Token management
  generateRefreshToken(refreshToken: string): Promise<string>;

  // OTP operations
  signupAndSendOtp(email: string): Promise<{ message: string }>;
  SendOtp(email: string): Promise<{ message: string }>;
  verifyOtp(email: string, otp: string): Promise<{ message: string }>;

  // Registration
  verifyOtpAndSignup(
    firstName: string,
    lastName: string,
    email: string,
    otp: string,
    password: string
  ): Promise<{ message: string }>;

  // Password reset
  resetPassword(email: string, password: string): Promise<{ message: string }>;

  // Authentication
  loginStudent(email: string, password: string): Promise<any>;
  googleLoginUseCase(
    token: string,
    authService: IGoogleAuthService,
    role: string
  ): Promise<any>;
}
