import { Request, Response } from "express";
import { StatusCodes } from "../constants/statusCodes";
import { FAILED_GOOGLE_LOGIN, FAILED_LOGIN, FAILED_LOGOUT, FAILED_SIGNUP, FAILED_TOKEN_REFRESH, INVALID_CREDENTIALS, INVALID_GOOGLE_TOKEN, SUCCESS_LOGIN, SUCCESS_LOGOUT, SUCCESS_SIGNUP, SUCCESS_TOKEN_REFRESH, UNAUTHORIZED } from "../constants/responseMessage";
import { errorResponse, successResponse } from "../../infrastructure/utility/ResponseCreator";
import { generateAccessToken, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";
import { GoogleAuthServiceImpl } from "../../infrastructure/services/googleAuthServiceImpl";
import { StudentUseCase } from "../../application/useCase/student.usecase"; 
import { AuthUseCase } from "../../application/useCase/auth.usecase";


class AuthController {
  constructor(
    private studentUseCase: StudentUseCase,
    private authUseCase: AuthUseCase
  ) {}

  async generateRefreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(StatusCodes.UNAUTHORIZED).json(errorResponse(UNAUTHORIZED));
      return;
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse(FAILED_TOKEN_REFRESH));
        return;
      }
      const accessToken = generateAccessToken(payload);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_TOKEN_REFRESH, { accessToken }));
    } catch (err: any) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json(errorResponse(FAILED_TOKEN_REFRESH));
    }
  }

  async loginStudent(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse(INVALID_CREDENTIALS));
        return;
      }

      const result = await this.authUseCase.loginStudent(email, password);
      res.cookie("refreshToken", result.refreshToken, {
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(StatusCodes.OK).json(
        successResponse(SUCCESS_LOGIN, {
          accessToken: result.accessToken,
        })
      );
    } catch (error: any) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse(error.message || FAILED_LOGIN));
    }
  }

  async googleLoginController(req: Request, res: Response): Promise<void> {
    const { token } = req.body;
    if (!token) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse(INVALID_GOOGLE_TOKEN));
      return;
    }
    const authService = new GoogleAuthServiceImpl();
    try {
      const { message, accessToken, refreshToken } =
        await this.authUseCase.googleLoginUseCase(token, authService);
      res
        .status(StatusCodes.OK)
        .json(successResponse(message, { accessToken, refreshToken }));
    } catch (err) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse(FAILED_GOOGLE_LOGIN));
    }
  }

  async signupStudent(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await this.authUseCase.signupAndSendOtp(email);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_SIGNUP, { result }));
    } catch (err: any) {
      console.log(err);
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse(err.message || FAILED_SIGNUP));
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await this.authUseCase.signupAndSendOtp(email);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_SIGNUP, { result }));
    } catch (err: any) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse(err.message || FAILED_SIGNUP));
    }
  }
  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await this.authUseCase.SendOtp(email);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_SIGNUP, { result }));
    } catch (err: any) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse(err.message || FAILED_SIGNUP));
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email , newPassword } = req.body;
      const result = await this.authUseCase.resetPassword(email, newPassword);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_SIGNUP, { result }));
    } catch (err: any) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse(err.message || FAILED_SIGNUP));
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, password } = req.body;
      const result = await this.authUseCase.verifyOtpAndSignup(
        email,
        otp,
        password
      );

      res.status(StatusCodes.OK).json(successResponse(SUCCESS_SIGNUP));
    } catch (err: any) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse(err.message || FAILED_SIGNUP));
    }
  }

  async forgotVerifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      const result = await this.authUseCase.verifyOtp(email, otp);

      res.status(StatusCodes.OK).json(successResponse(SUCCESS_SIGNUP));
    } catch (err: any) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse(err.message || FAILED_SIGNUP));
    }
  }

  async logOutStudent(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.status(StatusCodes.OK).json(successResponse(SUCCESS_LOGOUT, {}));
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json(errorResponse(FAILED_LOGOUT));
    }
  }
}

export default AuthController;
