import { Request, Response } from "express";
import { IAuthenticatedRequest } from "../middlewares/ExtractInstructor";
import { InstructorUseCase } from "../../application/useCase/instructor.usecase"; 
import { generateAccessToken, TokenPayload, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";


export class InstructorController  {
    constructor(private InstructorUseCase: InstructorUseCase) { }

     getProfile = async (req: IAuthenticatedRequest, res: Response) => {
        try {
          const student = req.instructor;
    
          if (!student || typeof student === "string" || !("email" in student)) {
            throw new Error("Invalid token payload: Email not found");
          }
          const result = await this.InstructorUseCase.getProfile(student.email);
          res.status(200).json({ profile: result });
        } catch (error) {
          res.status(500).json({ message: "Something went wrong" });
        }
      };
      updateProfile = async (req: IAuthenticatedRequest, res: Response) => {
        try {
          const student = req.instructor;
          const updateData = req.body;
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
          res.status(500).json({ message: "Something went wrong updating" });
        }
    };
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
            const TokenPayload: TokenPayload = {
                email: payload.email,
                id: payload.id,
                role:payload.role
            }
          const accessToken = generateAccessToken(TokenPayload);
    
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
          const result = await this.InstructorUseCase.verifyOtpAndSignup(
            email,
            otp,
            password
          );
    
          res.status(200).json({
            success: true,
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
    
}