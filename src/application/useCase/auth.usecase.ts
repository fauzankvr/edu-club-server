import { generateRefreshToken, TokenPayload } from "../../infrastructure/utility/GenarateToken"; 
import { Student } from "../../domain/entities/Student";
import { sendOtpEmail } from "../../infrastructure/services/EmailService";
import { generateAccessToken, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";
import { generateOtp } from "../../infrastructure/utility/GenerateOtp";
import { INVALID_OTP, INVALID_PASSWORD, LOGIN_SUCCESS, OTP_SENT, OTP_WAIT, SIGNUP_FAILED, STUDENT_NOT_FOUND, SUCCESS_SIGNUP, USER_ALREADY_EXISTS, USER_BLOCKED } from "../../interfaces/constants/responseMessage";
import { IGoogleAuthService } from "../interface/IGoogleService";
import { IOtpRepo } from "../interface/IotpRepo";
import IStudentRepo from "../interface/IStudentRepo";
import bcrypt from "bcrypt"; 

export class AuthUseCase {
    constructor(public studentRepo: IStudentRepo, public otpRepo : IOtpRepo) {}
  
    async generateRefreshToken(refreshToken: string) {
      const decoded = verifyRefreshToken(refreshToken);
      const accessToken = generateAccessToken({
        email: decoded.email,
          id: decoded.id,
        role: decoded.role
      });
      return accessToken;
    }
  
    async signupAndSendOtp(email: string) {
      const existing = await this.studentRepo.findStudentByEmail(email);
      if (existing) throw new Error(USER_ALREADY_EXISTS);
  
        const lastOtp = await this.otpRepo.findOtp(email)
      if (lastOtp && Date.now() - lastOtp.createdAt.getTime() < 3000) {
        throw new Error(OTP_WAIT);
      }
  
      const otp = generateOtp();
      console.log(otp)
      await sendOtpEmail(email, otp);
      await this.otpRepo.createOtp(email, otp);

      return { message: OTP_SENT };
    }
  
    async verifyOtpAndSignup(email: string, otp: string, password: string) {
      const validOtp = await this.otpRepo.findOtp(email);
      otp = otp.trim().toString()
        if (!validOtp || otp !== validOtp.otp) throw new Error(INVALID_OTP);
  
        const hashedPassword = await bcrypt.hash(password, 10);

        const createdStudent = await this.studentRepo.create({
            email,
            password: hashedPassword,
            isBlocked: false,
          });
          
          console.log(createdStudent)
      
      await this.otpRepo.deleteOtp(email);
  
      if (!createdStudent) {
        throw new Error(SIGNUP_FAILED);
      }  
      return { message:SUCCESS_SIGNUP};
    }
  
    async loginStudent(email: string, password: string) {
      const studentData = await this.studentRepo.findSafeStudentByEmail(email);
      if (!studentData) {
        throw new Error(STUDENT_NOT_FOUND);
      }
      const isMatch = await bcrypt.compare(password, studentData.password);
      if (!isMatch) {
        throw new Error(INVALID_PASSWORD);
        }
        if (studentData.isBlocked) {
          throw new Error(USER_BLOCKED);
        }
      
        const payload:TokenPayload = {
          email: studentData.email,
          id: studentData._id.toString(),
          role: "student",
        };

        const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
  
      return { message: LOGIN_SUCCESS, accessToken, refreshToken };
    }
  
    async googleLoginUseCase(token: string, authService: IGoogleAuthService) {
      const googleUser = await authService.verifyToken(token);
      console.log('googleuser', googleUser)
      let student = await this.studentRepo.findStudentByEmail(googleUser.email);
      if (!student) {
        const newStudent = new Student(
          googleUser.email,
          "",
          false,
          googleUser.name,
          "",
          null,
          null,
          null,
          googleUser.googleId,
          googleUser.picture,
          new Date()
        );
        student = await this.studentRepo.create(newStudent);
      }
  
      if (student.isBlocked) {
        throw new Error(USER_BLOCKED);
      }
      const TokenPayload: TokenPayload = {
        email: student.email,
        id: student._id.toString(),
        role: "student",
      };
      const accessToken = generateAccessToken(TokenPayload);
      const refreshToken = generateRefreshToken(TokenPayload);
  
      return { message: LOGIN_SUCCESS, accessToken, refreshToken };
    }
  }
  