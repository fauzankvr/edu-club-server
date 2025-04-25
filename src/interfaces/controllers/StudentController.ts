import {StudentUseCase} from "../../application/useCase/StudentUseCase";
import { Request, Response } from "express";
import { IAuthanticatedRequest } from "../middlewares/ExtractUser";
import { generateAccessToken, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";
import { captureOrderService, createOrderService } from "../../infrastructure/services/PaypalIntigrataion";

class StudentController {
  constructor(private StudentUseCase: StudentUseCase) {}

  generateRefreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        return res.status(403).json({ message: "Invalid token" });
      }
      const accessToken = generateAccessToken({ email: payload.email });

      res.status(200).json({ success: true, accessToken });
    } catch (err: any) {
      res.status(403).json({ message: "Invalid or expired refresh token" });
    }
  };

  getStudent = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const studentEmail = req.student;
      if (
        !studentEmail ||
        typeof studentEmail === "string" ||
        !("email" in studentEmail)
      ) {
        throw new Error("Invalid token payload: Email not found");
      }

      if (!studentEmail) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const student = await this.StudentUseCase.getProfile(studentEmail.email);
      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }

      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

  loginStudent = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required.",
        });
      }

      const result = await this.StudentUseCase.loginStudent(email, password);
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

  signupStudent = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      console.log(req.body);
      const result = await this.StudentUseCase.signupAndSendOtp(email);
      res.status(200).json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  logOutStudent = async (req: Request, res: Response) => {
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
  resendOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      console.log(req.body);
      const result = await this.StudentUseCase.signupAndSendOtp(email);
      res.status(200).json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
  verifyOtp = async (req: Request, res: Response) => {
    try {
      const { email, otp, password } = req.body;
      const result = await this.StudentUseCase.verifyOtpAndSignup(
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
  getProfile = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      console.log("iam in profile");
      const student = req.student;

      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }

      console.log("My email:", student.email);
      const result = await this.StudentUseCase.getProfile(student.email);
      res.status(200).json({ profile: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };

  getAllCoureses = async (req: Request, res: Response) => {
    try {
      const courses = await this.StudentUseCase.getAllCourses();

      if (!courses || courses.length === 0) {
        return res.status(404).json({ message: "No courses found" });
      }

      return res.status(200).json({ courses });
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  };

  updateProfile = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      console.log("iam in update profile");
      const student = req.student;
      const updateData = req.body;
      if (req.file) {
        updateData.profileImage = req.file.filename;
      }
      console.log(req.body);
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }

      console.log("My email:", student.email);
      const result = this.StudentUseCase.updateProfile(
        student.email,
        updateData
      );
      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong updating" });
    }
  };

  createOrderController = async (req: Request, res: Response) => {
    try {
      console.log(" iama in craete order")
      const { cart } = req.body;
      const { jsonResponse, httpStatusCode } = await createOrderService(cart);
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to create order." });
    }
  };

  captureOrderController = async (req: Request, res: Response) => {
    try {
      console.log( 'i am in capurrte....')
      const { orderID } = req.params;
      const { jsonResponse, httpStatusCode } = await captureOrderService(
        orderID
      );
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to capture order:", error);
      res.status(500).json({ error: "Failed to capture order." });
    }
  };
};


export default StudentController