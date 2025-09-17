import {
  generateRefreshToken,
  TokenPayload,
} from "../../infrastructure/utility/GenarateToken";
import { StudentEntity } from "../../domain/entities/Student";
import { sendOtpEmail } from "../../infrastructure/services/EmailService";
import {
  generateAccessToken,
  verifyRefreshToken,
} from "../../infrastructure/utility/GenarateToken";
import { generateOtp } from "../../infrastructure/utility/GenerateOtp";
import {
  FAILED_RESET_PASSWORD,
  INVALID_OTP,
  INVALID_PASSWORD,
  LOGIN_SUCCESS,
  OTP_SENT,
  OTP_WAIT,
  SIGNUP_FAILED,
  STUDENT_NOT_FOUND,
  SUCCESS_RESET_PASSWORD,
  SUCCESS_SIGNUP,
  USER_ALREADY_EXISTS,
  USER_BLOCKED,
  VALID_OTP,
} from "../../interfaces/constants/responseMessage";
import { IGoogleAuthService } from "../interface/IGoogleService";
import { IOtpRepository } from "../interface/IotpRepository";
import bcrypt from "bcrypt";

import { IAuthUseCase } from "../interface/IAuthUseCase";
import IStudentRepository from "../interface/IStudentRepository";
import IInstructorRepository from "../interface/IInstructorRepository";
import { InstructorEntity } from "../../domain/entities/Instructor";

export class AuthUseCase implements IAuthUseCase {
  constructor(
    private _studentRepository: IStudentRepository,
    private _otpRepository: IOtpRepository,
    private _instructorRepository: IInstructorRepository
  ) {}

  async generateRefreshToken(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({
      email: decoded.email,
      id: decoded.id,
      role: decoded.role,
    });
    return accessToken;
  }

  async signupAndSendOtp(email: string) {
    const existing = await this._studentRepository.findByEmail(email);
    if (existing) throw new Error(USER_ALREADY_EXISTS);

    const lastOtp = await this._otpRepository.findByEmail(email);
    if (lastOtp && Date.now() - lastOtp.createdAt.getTime() < 3000) {
      throw new Error(OTP_WAIT);
    }

    const otp = generateOtp();
    console.log(otp);
    await sendOtpEmail(email, otp);
    await this._otpRepository.create(email, otp);

    return { message: OTP_SENT };
  }

  async SendOtp(email: string) {
    const existing = await this._studentRepository.findByEmail(email);
    if (!existing) throw new Error(STUDENT_NOT_FOUND);
    const lastOtp = await this._otpRepository.findByEmail(email);
    if (lastOtp && Date.now() - lastOtp.createdAt.getTime() < 3000) {
      throw new Error(OTP_WAIT);
    }

    const otp = generateOtp();
    console.log(otp);
    await sendOtpEmail(email, otp);
    await this._otpRepository.create(email, otp);

    return { message: OTP_SENT };
  }

  async resetPassword(email: string, password: string) {
    const existing = await this._studentRepository.findByEmail(email);
    if (!existing) throw new Error(STUDENT_NOT_FOUND);
    if (!existing?.id) throw new Error(STUDENT_NOT_FOUND);
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdStudent = await this._studentRepository.updateById(
      existing.id,
      { password: hashedPassword }
    );
    if (!createdStudent) {
      throw new Error(FAILED_RESET_PASSWORD);
    }

    return { message: SUCCESS_RESET_PASSWORD };
  }

  async verifyOtpAndSignup(
    firstName: string,
    lastName: string,
    email: string,
    otp: string,
    password: string
  ) {
    const validOtp = await this._otpRepository.findByEmail(email);
    otp = otp.trim().toString();
    if (!validOtp || otp !== validOtp.otp) throw new Error(INVALID_OTP);

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdStudent = await this._studentRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isBlocked: false,
    });

    await this._otpRepository.deleteByEmail(email);

    if (!createdStudent) {
      throw new Error(SIGNUP_FAILED);
    }
    return { message: SUCCESS_SIGNUP };
  }

  async verifyOtp(email: string, otp: string) {
    const validOtp = await this._otpRepository.findByEmail(email);
    otp = otp.trim().toString();
    if (!validOtp || otp !== validOtp.otp) throw new Error(INVALID_OTP);
    await this._otpRepository.deleteByEmail(email);
    return { message: VALID_OTP };
  }

  async loginStudent(email: string, password: string) {
    const studentData = await this._studentRepository.findByEmail(
      email
    );
    console.log(studentData)
    if (!studentData) {
      throw new Error(STUDENT_NOT_FOUND);
    }
     if (!studentData?.password) {
       throw new Error(STUDENT_NOT_FOUND);
     }
    const isMatch = await bcrypt.compare(password, studentData.password);

    if (!isMatch) {
      throw new Error(INVALID_PASSWORD);
    }
    if (studentData.isBlocked) {
      throw new Error(USER_BLOCKED);
    }
    if (!studentData.id) throw new Error(STUDENT_NOT_FOUND);
    const payload: TokenPayload = {
      email: studentData.email,
      id: studentData.id.toString(),
      role: "student",
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { message: LOGIN_SUCCESS, accessToken, refreshToken };
  }

  async googleLoginUseCase(
    token: string,
    authService: IGoogleAuthService,
    role: string
  ) {
    const googleUser = await authService.verifyToken(token);
    let TokenPayload: TokenPayload | undefined;

    if (role === "student") {
      let student = await this._studentRepository.findByEmail(
        googleUser.email
      );
      if (!student) {
        const newStudent = new StudentEntity(
          "",
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
        student = await this._studentRepository.create(newStudent);
      }

      if (student.isBlocked) {
        throw new Error(USER_BLOCKED);
      }
      if (!student.id) throw new Error(STUDENT_NOT_FOUND);
      TokenPayload = {
        email: student.email,
        id: student.id.toString(),
        role: "student",
      };
    } else if (role === "instructor") {
      let instructor = await this._instructorRepository.findInstructorByEmail(
        googleUser.email
      );
      if (!instructor) {
        const newInstructor = new InstructorEntity(
          googleUser.email,
          "",
          false,
          googleUser.name,
          undefined,
          undefined,
          undefined,
          undefined,
          googleUser.picture,
          ""
        );
        console.log(newInstructor);
        instructor = await this._instructorRepository.create(newInstructor);
      }
      console.log(instructor);

      if (instructor.isBlocked) {
        throw new Error(USER_BLOCKED);
      }

      TokenPayload = {
        email: instructor.email,
        id: instructor.id,
        role: "instructor",
      };
    }

    if (!TokenPayload) {
      throw new Error("Invalid role or failed to create user.");
    }

    const accessToken = generateAccessToken(TokenPayload);
    const refreshToken = generateRefreshToken(TokenPayload);

    return { message: LOGIN_SUCCESS, accessToken, refreshToken };
  }
}
