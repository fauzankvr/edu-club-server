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
      email: decoded.email,
      id: decoded.id,
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
    console.log("created instructor", createdInstructor);
    console.log("id", id);
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
  async createNewCourse(data: CreateCourseDTO): Promise<object> {
    const course = new Course(
      data.title,
      data.description,
      data.language,
      data.category,
      data.courseImageId,
      data.points,
      data.price,
      data.discount,
      data.students,
      data.instructor
    );

    if (!course.isValid()) throw new Error("Invalid course data");
    console.log(course);
    const res = await this.instructorRepo.createCourse(course);
    return res;
  }

  async saveCurriculum(
    courseId: string,
    instructor: string,
    sections: ISection[],
    videoFiles: Express.Multer.File[],
    pdfFiles: Express.Multer.File[]
  ): Promise<boolean> {
    try {
      // Assign video and pdf file paths to their corresponding lectures
      sections.forEach((section, sIndex) => {
        section.lectures.forEach((lecture, lIndex) => {
          // Match video files
          const videoFile = videoFiles.find(
            (file) => file.originalname === `video_s${sIndex}_l${lIndex}.mp4`
          );
          const pdfFile = pdfFiles.find(
            (file) => file.originalname === `pdf_s${sIndex}_l${lIndex}.pdf`
          );

          if (videoFile) {
            lecture.videoPath = videoFile.path;
          } else if (pdfFile) {
            lecture.pdfPath = pdfFile.path;
          }
        });
      });

      // Now call the CurriculumRepo to save it
      await this.instructorRepo.saveCurriculum(courseId, instructor, sections);

      return true;
    } catch (error) {
      console.error("Error saving curriculum:", error);
      throw new Error("Failed to save curriculum");
    }
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
  async getAllCourses(email: any) {
    console.log("Getting all courses from usecase");
    const courses = await this.instructorRepo.getAllCourses(email);

    if (!courses) {
      throw new Error("Failed to retrieve courses");
    }

    return courses;
  }
  async getCourseById(id: string) {
    const res = await this.instructorRepo.getCoureById(id);
    if (!res) {
      throw new Error("Faild to retrive course");
    }
    return res;
  }

  async updateCourse(id: string, updateData: any) {
    const course = await this.instructorRepo.getCoureById(id);

    if (!course) {
      throw new Error("Course not found");
    }

    const updated = await this.instructorRepo.updateCourseById(id, updateData);

    if (!updated) {
      throw new Error("Failed to update course");
    }

    return updated;
  }
  async getCurriculam(id: string) {
    const curriculum = await this.instructorRepo.getCurriculamByCourseId(id);

    if (!curriculum) {
      throw new Error("Failed to retrieve curriculum");
    }

    return curriculum;
  }
  async getAllChats(id: string) {
    const chats = await this.instructorRepo.getAllChats(id);
    if (!chats) {
      throw new Error("Failed to retrieve chats");
    }
    return chats;
  }
  async getAllMessages(id: string) {
    const messages = this.instructorRepo.getAllMessages(id);
    if (!messages) {
      throw new Error("Failed to retrieve messages");
    }
    return messages;
  }
  postMessage(chatId: string, text: string, id: string) {
    const data = {
      text,
      sender: id,
      chatId,
    };
    const chat = this.instructorRepo.postMessage(data);
    if (!chat) {
      throw new Error("Failed to post message");
    }
    return chat;
  }
}