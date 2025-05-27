import { Request, Response } from "express";
import { InstructorUseCase } from "../../application/useCase/InstructorUseCase";
import { generateAccessToken, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";
import { JwtPayload } from "jsonwebtoken";
import { IAuthenticatedRequest } from "../middlewares/ExtractInstructor";
import { IInstructor } from "../../infrastructure/database/models/InstructorModel";



class InstructorController {
  constructor(private InstructorUseCase: InstructorUseCase) {}
  generateRefreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    console.log("refresh token,,,", refreshToken);
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      console.log(payload, "vrify");
      if (!payload) {
        return res.status(403).json({ message: "Invalid token" });
      }
      const accessToken = generateAccessToken({ email: payload.email });

      res.status(200).json({ success: true, accessToken });
    } catch (err: any) {
      res.status(403).json({ message: "Invalid or expired refresh token" });
    }
  };

  loginInstructor = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(req.body);
    try {
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required.",
        });
      }

      const result = await this.InstructorUseCase.loginInstructor(
        email,
        password
      );
      console.log("res", result);
      res.cookie("refreshToken", result.refreshToken, {
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        message: result.message,
      });
    } catch (error: any) {
      console.log("Login error:", error);
      res
        .status(401)
        .json({ success: false, message: error.message || "Login failed" });
    }
  };
  signupInstructor = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      console.log(req.body, "instructor signup");
      const result = await this.InstructorUseCase.signupAndSendOtp(email);
      res.status(200).json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  logOutInstructor = async (req: Request, res: Response) => {
    console.log("in log out");
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(400).json({ message: "Logout failed", error });
    }
  };

  verifyOtp = async (req: Request, res: Response) => {
    try {
      const { email, otp, password } = req.body;
      console.log(req.body);
      const result = await this.InstructorUseCase.verifyOtpAndSignup(
        email,
        otp,
        password
      );
      console.log(result);
      res.cookie("refreshToken", result.refreshToken, {
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        message: "Signup successful",
      });
    } catch (err: any) {
      console.log("error in verify otp", err.message);
      res.status(401).json({ message: err.message, token: "" });
    }
  };
  resendOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      console.log("Resending OTP to:", email);

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const result = await this.InstructorUseCase.signupAndSendOtp(email);

      res
        .status(200)
        .json({ success: true, message: "OTP resent successfully", result });
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ error: "Failed to resend OTP" });
    }
  };

  createCourse = async (req: IAuthenticatedRequest, res: Response) => {
    const instructor = (req.instructor as JwtPayload)?.email;
    console.log(instructor);
    console.log("i am in create couser");
    try {
      const {
        title,
        description,
        language,
        category,
        price,
        discount,
        points,
      } = req.body;

      // const courseImageId = req.file?.filename || "";
      const courseImageId = req.file?.path || "";

      const students: [] = [];
      const course = await this.InstructorUseCase.createNewCourse({
        title,
        description,
        language,
        category,
        courseImageId,
        price: Number(price),
        discount: discount || null,
        points,
        students,
        instructor: instructor || null,
      });

      return res
        .status(201)
        .json({ message: "Course created successfully", course });
    } catch (err: any) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Failed to create course", error: err.message });
    }
  };

  uploadCurriculum = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      const instructor = (req.instructor as JwtPayload)?.email;
      const courseId = req.params.courseId;

      const sections = JSON.parse(req.body.sections || "[]");

      const files = req.files as {
        videos?: Express.Multer.File[];
        pdfs?: Express.Multer.File[];
      };

      const videoFiles = files.videos || [];
      const pdfFiles = files.pdfs || [];

      // Now you can pass them to your use case or save in DB
      const curriculum = await this.InstructorUseCase.saveCurriculum(
        courseId,
        instructor,
        sections,
        videoFiles,
        pdfFiles
      );

      return res
        .status(200)
        .json({ message: "Curriculum uploaded successfully", curriculum });
    } catch (error: any) {
      console.error("Upload Curriculum Error:", error);
      return res
        .status(500)
        .json({ message: "Failed to upload curriculum", error: error.message });
    }
  };

  updateCurriculum = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      const instructor = (req.instructor as JwtPayload)?.email;
      const courseId = req.params.id;
      const sections = JSON.parse(req.body.sections || "[]");
      const files = req.files as {
        videos?: Express.Multer.File[];
        pdfs?: Express.Multer.File[];
      };

      const videoFiles = files?.videos || [];
      const pdfFiles = files?.pdfs || [];

      const result = await this.InstructorUseCase.saveCurriculum(
        courseId,
        instructor,
        sections,
        videoFiles,
        pdfFiles
      );

      if (!result) {
        return res.status(400).json({ message: "Failed to update curriculum" });
      }

      return res.status(200).json({
        message: "Curriculum updated successfully",
      });
    } catch (error: any) {
      console.error("Error in updateCurriculum:", error);
      return res.status(500).json({
        message: "Failed to update curriculum",
        error: error.message,
      });
    }
  };

  getProfile = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      console.log("iam in profile");
      const student = req.instructor;

      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }
      const result = await this.InstructorUseCase.getProfile(student.email);
      res.status(200).json({ profile: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
  updateProfile = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      console.log("iam in update profile");
      const student = req.instructor;
      const updateData = req.body;
      console.log(req.body);
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }
      if (req.file) {
        updateData.profileImage = req.file.path;
      }

      const result = this.InstructorUseCase.updateProfile(
        student.email,
        updateData
      );
      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong updating" });
    }
  };
  getCourseById = async (req: Request, res: Response) => {
    try {
      console.log("I am in getCourse");
      const course = await this.InstructorUseCase.getCourseById(req.params.id);
      return res.status(200).json(course);
    } catch (error: any) {
      console.error("Error in getCourseById:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch course", error: error.message });
    }
  };
  updateCourse = async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;
      const updateData = req.body;
      if (req.file) {
        updateData.courseImageId = req.file.path;
      }
      const updatedCourse = await this.InstructorUseCase.updateCourse(
        courseId,
        updateData
      );
      return res.status(200).json({
        message: "Course updated successfully",
        course: updatedCourse,
      });
    } catch (error: any) {
      console.error("Error in updateCourse:", error);
      return res.status(500).json({
        message: "Failed to update course",
        error: error.message,
      });
    }
  };
  getAllCoureses = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      const instructor = req.instructor;
      console.log("i am in get alll coursss");

      if (
        !instructor ||
        typeof instructor === "string" ||
        !("email" in instructor)
      ) {
        throw new Error("Invalid token payload: Email not found");
      }

      const email = instructor.email; // ✅ Safe to access now

      const courses = await this.InstructorUseCase.getAllCourses(email);
      res.status(200).json({ success: true, data: courses });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch courses" });
    }
  };
  getCurriculam = async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;
      const curriculum = await this.InstructorUseCase.getCurriculam(courseId);
      return res.status(200).json(curriculum);
    } catch (error: any) {
      console.error("Error in getCurriculam:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch curriculum", error: error.message });
    }
  };
  getAllChats = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      const instructor = req.instructor;
      console.log("i am in get all chats");

      if (
        !instructor ||
        typeof instructor === "string" ||
        !("email" in instructor)
      ) {
        throw new Error("Invalid token payload: Email not found");
      }

      const email = instructor.email;
      const InstructorData = this.InstructorUseCase.getProfile(email);
      if (!InstructorData) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      const id = (await InstructorData)._id.toString();
      const chats = await this.InstructorUseCase.getAllChats(id);
      res.status(200).json({ success: true, data: chats });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch chats" });
    }
  };
  getAllMessage = async (req: Request, res: Response) => {
    try {
      const chatId = req.params.id;
      const messages = await this.InstructorUseCase.getAllMessages(chatId);
      return res.status(200).json(messages);
    } catch (error: any) {
      console.error("Error in getAllMessage:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch messages", error: error.message });
    }
  };
  postMessage = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      console.log("in post message");
      const { chatId, text } = req.body;
      const instructor = req.instructor;

      if (
        !instructor ||
        typeof instructor === "string" ||
        !("email" in instructor)
      ) {
        throw new Error("Invalid token payload: Email not found");
      }

      const email = instructor.email;
      const InstructorData = this.InstructorUseCase.getProfile(email);
      if (!InstructorData) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      const id = (await InstructorData)._id.toString();
      if (!instructor || typeof instructor === "string") {
        throw new Error("Invalid token payload: Email not found");
      }
      const message = await this.InstructorUseCase.postMessage(
        chatId,
        text,
        id
      );
      return res.status(200).json(message);
    } catch (error: any) {
      console.error("Error in postMessage:", error);
      return res
        .status(500)
        .json({ message: "Failed to send message", error: error.message });
    }
  };
  getPendingPayment = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      const instructor = req.instructor;

      if (
        !instructor ||
        typeof instructor === "string" ||
        !("email" in instructor)
      ) {
        throw new Error("Invalid token payload: Email not found");
      }

      const email = instructor.email; // ✅ Safe to access now

      const pendingPayments = await this.InstructorUseCase.getPendingPayment(
        email
      );
      res.status(200).json({ success: true, data: pendingPayments });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch pending payments" });
    }
  };
  updatePaypalEmail = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      const instructor = req.instructor;
      if (
        !instructor ||
        typeof instructor === "string" ||
        !("email" in instructor)
      ) {
        throw new Error("Invalid token payload: Email not found");
      }

      const email = instructor.email;
      const { paypalEmail } = req.body;
      if (!paypalEmail) {
        return res.status(400).json({
          success: false,
          message: "PayPal email is required",
        });
      }
      const updated = await this.InstructorUseCase.updatePaypalEmail(
        email,
        paypalEmail
      );
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update PayPal email" });
    }
  };

  requestPayout = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      const instructor = req.instructor;

      if (
        !instructor ||
        typeof instructor === "string" ||
        !("email" in instructor)
      ) {
        throw new Error("Invalid token payload: Email not found");
      }

      const instructorMail = instructor.email;

      const instructordata = await this.InstructorUseCase.getProfile(instructorMail);
      if (!instructordata || !instructordata.paypalEmail) {
        return res.status(400).json({
          success: false,
          message: "PayPal email is not set. Please update your profile.",
        });
      }

      const paypalEmail = instructordata.paypalEmail;
      const payoutData = await this.InstructorUseCase.requestPayout(
        instructorMail,
        paypalEmail
      );
      res.status(200).json({ success: true, data: payoutData });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to request payout" });
    }
  };
}


export default InstructorController