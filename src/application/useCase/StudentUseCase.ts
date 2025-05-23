import IStudentRepo from "../interface/IStudentRepo";
import { generateOtp } from "../../infrastructure/utility/GenerateOtp";
import { sendOtpEmail } from "../../infrastructure/services/EmailService";
import OtpModel from "../../infrastructure/database/models/OtpModel";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";
import { Student } from "../../domain/entities/Student";
import bcrypt from "bcrypt"; 
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IDiscussion, IReply } from "../interface/IDiscussion";

export interface CreateUserDTO {
  email: string;
  password: string;
}

export class StudentUseCase {
  private studentRepo: IStudentRepo;
  constructor(studentRepo: IStudentRepo) {
    this.studentRepo = studentRepo;
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
    const createdStudent = await this.studentRepo.createStudent(newStudent);
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
      await this.studentRepo.getAllCourses(search, skip, limit, sort, category, language, rating, priceMin, priceMax);
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

  async addReview(
    userEmail: string,
    userName: string,
    courseId: string,
    rating: number,
    comment: string
  ) {
    console.log("Adding review usecase...");
    const newReview = await this.studentRepo.addReview(
      userEmail,
      userName,
      courseId,
      rating,
      comment
    );

    if (!newReview) {
      throw new Error("Failed to add review");
    }
    return newReview;
  }

  async getMyReview(courseId: string, studentEmail: string) {
    const reviews = await this.studentRepo.getMyReviewsByCourseId(
      courseId,
      studentEmail
    );

    if (!reviews) {
      throw new Error("No reviews found for this course");
    }
    return reviews;
  }

  async getReview(courseId: string) {
    const reviews = await this.studentRepo.getReviewsByCourseId(courseId);

    if (!reviews) {
      throw new Error("No reviews found for this course");
    }
    return reviews;
  }

  async handleReviewReaction(
    reviewId: string,
    userEmail: string,
    type: "like" | "dislike"
  ) {
    const review = await this.studentRepo.findReviewById(reviewId);
    if (!review) throw new Error("Review not found");

    const liked = review.likedBy.includes(userEmail);
    const disliked = review.dislikedBy.includes(userEmail);

    if (type === "like") {
      if (liked) {
        review.likedBy.pull(userEmail);
      } else {
        review.likedBy.push(userEmail);
        if (disliked) review.dislikedBy.pull(userEmail);
      }
    } else if (type === "dislike") {
      if (disliked) {
        review.dislikedBy.pull(userEmail);
      } else {
        review.dislikedBy.push(userEmail);
        if (liked) review.likedBy.pull(userEmail);
      }
    }

    review.likes = review.likedBy.length;
    review.dislikes = review.dislikedBy.length;

    return await this.studentRepo.saveReview(review);
  }

  async findWishlist(studentId: string, courseId: string) {
    return this.studentRepo.findWishlist(studentId, courseId);
  }
  async addWishlist(studentId: string, courseId: string) {
    return this.studentRepo.addCourseToWishlist(studentId, courseId);
  }
  async removeWishlist(studentId: string, courseId: string) {
    return this.studentRepo.removeCourseFromWishlist(studentId, courseId);
  }
  async getWishlist(studentEmail: string) {
    return this.studentRepo.getWishlist(studentEmail);
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

  async runChat(message: string) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const result = await chat.sendMessage(
      `${message} Respond in plain text only (no formatting, no markdown) and peragraph vice  `
    );
    const response = result.response.text();
    return response;
  }

  //Discussion
  async createDiscussion(id: string, data: Partial<IDiscussion>) {
    return await this.studentRepo.createDiscussion(id, data);
  }

  async getAllDiscussions(orderId: string): Promise<IDiscussion[]> {
    try {
      return await this.studentRepo.getAllDiscussions(orderId);
    } catch (error) {
      console.error("Error in getAllDiscussions:", error);
      throw new Error("Failed to fetch discussions");
    }
  }
  async createReact(id: string, type: "like" | "dislike") {
    const discussion = await this.studentRepo.findByIdDicussion(id);
    let usersId = discussion.studentId;
    let userId = usersId.toString();
    // Remove existing reaction
    discussion.likedBy = discussion.likedBy.filter((id) => id !== userId);
    discussion.dislikedBy = discussion.dislikedBy.filter((id) => id !== userId);

    if (type === "like") {
      discussion.likedBy.push(userId);
    } else {
      discussion.dislikedBy.push(userId);
    }

    discussion.likes = discussion.likedBy.length;
    discussion.dislikes = discussion.dislikedBy.length;

    return await this.studentRepo.updateReaction(id, discussion);
  }

  async addReply(
    discussionId: string,
    reply: IReply
  ): Promise<IDiscussion | null> {
    const discussion = await this.studentRepo.findByIdDicussion(discussionId);
    if (!discussion) throw new Error("Discussion not found");

    discussion.replies.push(reply);
    return await this.studentRepo.updateReplay(discussionId, discussion);
  }

  async getReplay(discussionId: string) {
    const discussion = await this.studentRepo.findReplayById(discussionId);

    if (!discussion) {
      throw new Error("Discussion not found");
    }

    return discussion;
  }
}
