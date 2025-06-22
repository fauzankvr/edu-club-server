import IStudentRepo from "../interface/IStudentRepo";
import { generateOtp } from "../../infrastructure/utility/GenerateOtp";
import { sendOtpEmail } from "../../infrastructure/services/EmailService";
import OtpModel from "../../infrastructure/database/models/OtpModel";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";
import { Student } from "../../domain/entities/Student";
import bcrypt from "bcrypt"; 
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IDiscussion, IReply } from "../interface/IDiscussion";
import { IGoogleAuthService } from "../interface/IGoogleService";

export interface CreateUserDTO {
  email: string;
  password: string;
}

export class StudentUseCase {
  constructor(private studentRepo: IStudentRepo) { }

  async generateRefreshToken(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({
      email: decoded.email,
      id: decoded.id,
      role:decoded.role
    });
    return accessToken;
  }

  async signupAndSendOtp(email: string) {
    const existing = await this.studentRepo.findStudentByEmail(email);
    if (existing) throw new Error("User already exists");

    const lastOtp = await OtpModel.findOne({ email }).sort({ createdAt: -1 });
    if (lastOtp && Date.now() - lastOtp.createdAt.getTime() < 3000) {
      throw new Error("Please wait before resending OTP");
    }

    const otp = generateOtp();
    console.log(otp);
    await sendOtpEmail(email, otp);
    await OtpModel.create({ email, otp });

    return { message: "OTP sented successfully" };
  }
  async verifyOtpAndSignup(email: string, otp: string, password: string) {
    const validOtp = await OtpModel.findOne({ email, otp });
    if (!validOtp) throw new Error("Invalid OTP");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student(email, hashedPassword, false);
    const createdStudent = await this.studentRepo.create(newStudent);
    await OtpModel.deleteMany({ email });

    if (!createdStudent) {
      throw new Error("Issue faced while saving student in DB");
    }

    const payload = { email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { message: "Signup successful", accessToken, refreshToken };
  }

  async loginStudent(email: string, password: string) {
    const studentData = await this.studentRepo.findSafeStudentByEmail(email);
    console.log("std", studentData);
    if (!studentData) {
      throw new Error("Student not found");
    }
    const isMatch = await bcrypt.compare(password, studentData.password);
    if (!isMatch) {
      throw new Error("Invalid password");
    }
    if (studentData.isBlocked) {
      throw new Error("User is Blocked Please Contact to Admin");
    }
    const payload = { email: studentData.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      message: "Login successful",
      accessToken,
      refreshToken,
    };
  }

  async getProfile(email: any) {
    const studentData = await this.studentRepo.findStudentByEmail(email);
    if (!studentData) {
      throw new Error("Student not found");
    }
    return studentData;
  }

  async getAllCourses(
    search: string,
    skip: number,
    limit: number,
    sort?: string,
    category?: string,
    language?: string,
    rating?: string,
    priceMin?: string,
    priceMax?: string
  ) {
    const { courses, total, languages, categories } =
      await this.studentRepo.getAllCourses(
        search,
        skip,
        limit,
        sort,
        category,
        language,
        rating,
        priceMin,
        priceMax
      );
    return { courses, total, languages, categories };
  }

  async getCourseById(id: string) {
    const course = await this.studentRepo.getCourseById(id);
    if (!course) {
      throw new Error("Course not found");
    }
    return course;
  }
  async getCourseByOrderId(orderId: string) {
    const order = await this.studentRepo.getOrderById(orderId);
    console.log("order.....", order);
    if (!order) {
      throw new Error("Order not found");
    }

    const course = await this.studentRepo.getCourseById(
      order.courseId.toString()
    );
    if (!course) {
      throw new Error("Course not found for this order");
    }

    return course;
  }

  async getCarriculam(id: string) {
    const curriculum = await this.studentRepo.getCurriculumByCourseId(id);

    if (!curriculum) {
      throw new Error("Curriculum not found for this course");
    }

    return curriculum;
  }
  //only topics not content

  async getCarriculamTopics(courseId: string) {
    const curriculum = await this.studentRepo.getCarriculamTopics(courseId);
    if (!curriculum) {
      throw new Error("Curriculum not found for this course");
    }

    return curriculum;
  }

  async updateProfile(email: any, updateData: object) {
    console.log("update profiel usecase");
    const studentData = await this.studentRepo.updateProfileByEmail(
      email,
      updateData
    );
    if (!studentData) {
      throw new Error("Student updation is Faild");
    }
    return studentData;
  }



  async getEnrolledCourses(email: string) {
    const student = await this.studentRepo.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const courses = await this.studentRepo.findPaidCourses(studentId);
    return courses;
  }





  //Discussion
  
  
  googleLoginUseCase = async (
    token: string,
    authService: IGoogleAuthService,
  ) => {
    const googleUser = await authService.verifyToken(token);

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
      student = await this.studentRepo.createStudent(newStudent);
    }

    if (student?.isBlocked) {
      throw new Error("User is Blocked Please Contact to Admin");
    }
    const payload = { email: student?.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      message: "Login successful",
      accessToken,
      refreshToken,
    };

  };
}
