import { Request, Response } from "express";
import { IAuthenticatedRequest } from "../middlewares/ExtractInstructor";
import { generateAccessToken, TokenPayload, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";
import { errorResponse, successResponse } from "../../infrastructure/utility/ResponseCreator";
import { StatusCodes } from "../constants/statusCodes";
import { APPLICATION_SUCCESS_WAIT_FOR_UPPROVAL, EMAIL_REQUIRE, FAILED_OTP_SENT, FAILED_RESET_PASSWORD, INVALID_TOKEN, lOGOUT_FAILED, LOGOUT_SUCCESS, NEWPASSWORD_MUST_DIFF, NO_EMAIL_PASSWORD_ERROR, OTP_SENT, PAYPAL_EMAIL_REQUIRE, PROFILE_UPDATE_SUCCESS, PROFILE_UPDATED_FAILED, SOMETHING_WRONG, SUCCESS_RESET_PASSWORD, SUCCESS_SIGNUP, UNAUTHORIZED } from "../constants/responseMessage";
import { IInstructor } from "../../infrastructure/database/models/InstructorModel";
import { changePasswordSchema, instructorValidationSchema } from "../../infrastructure/utility/Instructor.validation";
import z from "zod";
import { IInstructorUseCase } from "../../application/interface/IInstructorUseCase";


export class InstructorController {
  constructor(private _instructorUseCase: IInstructorUseCase) {}

  getProfile = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      const student = req.instructor;

      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const result = await this._instructorUseCase.getProfile(student.email);
      res.status(StatusCodes.OK).json({ profile: result });
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: SOMETHING_WRONG });
    }
  };
  updateProfile = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      const instructor = req.instructor;
      const updateData = req.body as Partial<IInstructor>;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (
        !instructor ||
        typeof instructor === "string" ||
        !("email" in instructor)
      ) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ success: false, error: INVALID_TOKEN });
      }

      // Parse JSON strings for arrays or nested objects
      if (updateData.expertise && typeof updateData.expertise === "string") {
        updateData.expertise = JSON.parse(updateData.expertise as string);
      }

      if (updateData.languages && typeof updateData.languages === "string") {
        updateData.languages = JSON.parse(updateData.languages as string);
      }

      if (updateData.address && typeof updateData.address === "string") {
        updateData.address = JSON.parse(updateData.address as string);
      }
            if (
              updateData.socialMedia &&
              typeof updateData.socialMedia === "string"
            ) {
              updateData.socialMedia = JSON.parse(
                updateData.socialMedia as string
              );
            }

      if (
        updateData.certifications &&
        typeof updateData.certifications == "string"
      ) {
        updateData.certifications = JSON.parse(
        updateData.certifications as string
        );
      }
      if (updateData.experience) {
        updateData.experience = Number(updateData.experience);
      }
 if (updateData.teachingExperience) {
   updateData.teachingExperience = Number(updateData.teachingExperience);
      }
    if (files?.profileImage?.[0]) {
      updateData.profileImage = files.profileImage[0].path;
    }
      
    const parsed = instructorValidationSchema.safeParse(updateData);

    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: parsed.error.issues.map((e) => e.message).join(", "),
      });
    }

      const result = await this._instructorUseCase.updateProfile(
        instructor.email,
        updateData
      );

      return res.status(StatusCodes.OK).json({
        success: true,
        message: PROFILE_UPDATE_SUCCESS,
        result,
      });
    } catch (err: any) {
      console.error("Profile update error:", err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message || PROFILE_UPDATED_FAILED,
      });
    }
  };

  generateRefreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: UNAUTHORIZED });
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: INVALID_TOKEN });
      }
      const TokenPayload: TokenPayload = {
        email: payload.email,
        id: payload.id,
        role: payload.role,
      };
      const accessToken = generateAccessToken(TokenPayload);

      res.status(StatusCodes.OK).json({ success: true, accessToken });
    } catch (err: any) {
      res.status(StatusCodes.FORBIDDEN).json({ message: INVALID_TOKEN });
    }
  };

  loginInstructor = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: NO_EMAIL_PASSWORD_ERROR,
        });
      }

      const result = await this._instructorUseCase.loginInstructor(
        email,
        password
      );
      res.cookie("refreshToken", result.refreshToken, {
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(StatusCodes.OK).json({
        success: true,
        accessToken: result.accessToken,
        message: result.message,
      });
    } catch (error: any) {
      console.log("Login error:", error);
      res
        .status(StatusCodes.CREATED)
        .json({ success: false, message: error.message || "Login failed" });
    }
  };

  signupInstructor = async (req: Request, res: Response) => {
    try {
      let applicationData = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Parse JSON fields
      if (typeof applicationData.expertise === "string") {
        applicationData.expertise = JSON.parse(applicationData.expertise);
      }
      if (typeof applicationData.languages === "string") {
        applicationData.languages = JSON.parse(applicationData.languages);
      }
      if (typeof applicationData.address === "string") {
        applicationData.address = JSON.parse(applicationData.address);
      }

      // Handle files
      if (files?.profileImage?.[0]) {
        applicationData.profileImage = files.profileImage[0].path;
      }
      if (files?.certificates?.length) {
        applicationData.certifications = files.certificates.map((f) => f.path);
      }
         if (
           applicationData.socialMedia &&
           typeof applicationData.socialMedia === "string"
         ) {
           applicationData.socialMedia = JSON.parse(
             applicationData.socialMedia as string
           );
         }
      
            if (applicationData.experience) {
              applicationData.experience = Number(applicationData.experience);
            }
            if (applicationData.teachingExperience) {
              applicationData.teachingExperience = Number(
                applicationData.teachingExperience
              );
      }

      const parsed = instructorValidationSchema.safeParse(applicationData);
      if (!parsed.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: parsed.error.issues.map((e) => e.message).join(", "),
        });
      }

      const validatedData = parsed.data;
      const result = await this._instructorUseCase.signupAndSendOtp(
        validatedData
      );

      res.status(StatusCodes.OK).json({
        success: true,
        result,
        message: APPLICATION_SUCCESS_WAIT_FOR_UPPROVAL,
      });
    } catch (err: any) {
      console.error("Application submission error:", err);
      res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: err.message });
    }
  };

  logOutInstructor = async (req: Request, res: Response) => {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      res.status(StatusCodes.OK).json({ message: LOGOUT_SUCCESS});
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: lOGOUT_FAILED, error });
    }
  };

  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await this._instructorUseCase.SendOtp(email);
      res.status(StatusCodes.OK).json(successResponse(OTP_SENT, { result }));
    } catch (err: any) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse(err.message || FAILED_OTP_SENT));
    }
  }
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, newPassword } = req.body;
      const result = await this._instructorUseCase.resetPassword(
        email,
        newPassword
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_RESET_PASSWORD, { result }));
    } catch (err: any) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse(err.message || FAILED_RESET_PASSWORD));
    }
  }
  async chagePassword(
    req: IAuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const instructor = req.instructor;
      if (
        !instructor ||
        typeof instructor === "string" ||
        !("email" in instructor)
      ) {
        throw new Error(INVALID_TOKEN);
      }

      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: parsed.error.issues.map((e) => e.message).join(", "),
        });
        return; 
      }

      const { currentPassword, newPassword } = parsed.data;

      if (currentPassword === newPassword) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: NEWPASSWORD_MUST_DIFF
        });
        return;
      }

      const result = await this._instructorUseCase.changePassword(
        instructor.email,
        currentPassword,
        newPassword
      );

      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_RESET_PASSWORD, { result }));
      return; 
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: err.issues.map((e) => e.message).join(", "),
        });
        return;
      }

      res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse(err.message || FAILED_RESET_PASSWORD));
    }
  }

  verifyOtp = async (req: Request, res: Response) => {
    try {
      const { fullName, email, otp, password } = req.body;
      const result = await this._instructorUseCase.verifyOtpAndSignup(
        fullName,
        email,
        otp,
        password
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: SUCCESS_SIGNUP,
      });
    } catch (err: any) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: err.message, token: "" });
    }
  };
  resendOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: EMAIL_REQUIRE });
      }
      const result = await this._instructorUseCase.signupAndSendOtp(email);

      res
        .status(StatusCodes.OK)
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
          message: PAYPAL_EMAIL_REQUIRE,
        });
      }
      const updated = await this._instructorUseCase.updatePaypalEmail(
        email,
        paypalEmail
      );
      res.status(StatusCodes.OK).json({ success: true, data: updated });
    } catch (error) {
      console.log(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Failed to update PayPal email" });
    }
  };
}