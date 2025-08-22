import { Request, Response } from "express";
import { IAuthanticatedRequest } from "../middlewares/ExtractUser";
import { generateAccessToken, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";
import { GoogleAuthServiceImpl } from "../../infrastructure/services/googleAuthServiceImpl";
import { ALREADY_IN_WISHLIST, FAILED_WISHLIST_ADD, FAILED_WISHLIST_FETCH, FAILED_WISHLIST_REMOVE, INVALID_TOKEN, SUCCESS_WISHLIST_ADD, SUCCESS_WISHLIST_FETCH, SUCCESS_WISHLIST_REMOVE } from "../constants/responseMessage";
import { errorResponse, successResponse } from "../../infrastructure/utility/ResponseCreator";
import { StatusCodes } from "../constants/statusCodes";
import { IStudentUseCase } from "../../application/interface/IStudentUseCase";


export class StudentController {
  constructor(private _studentUseCase: IStudentUseCase) {}

  getProfile = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const student = req.student;

      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }

      console.log("My email:", student.email);
      const result = await this._studentUseCase.getProfile(student.email);
      res.status(200).json({ profile: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
  updateProfile = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      console.log("iam in update profile");
      const student = req.student;
      const updateData = req.body;
      const imageUrl = req.file?.path;
      if (req.file) {
        // updateData.profileImage = req.file.filename;
        updateData.profileImage = imageUrl;
      }
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }

      console.log("My email:", student.email);
      const result = this._studentUseCase.updateProfile(
        student.email,
        updateData
      );
      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong updating" });
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

      const student = await this._studentUseCase.getProfile(studentEmail.email);
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

  async addWishlist(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const isAdded = await this._studentUseCase.findWishlist(
        student.email,
        courseId
      );
      if (isAdded) {
        throw new Error(ALREADY_IN_WISHLIST);
      }
      const result = await this._studentUseCase.addWishlist(
        student.email,
        courseId
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_WISHLIST_ADD, { data: result }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_WISHLIST_ADD));
    }
  }

  async removeWishlist(
    req: IAuthanticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { courseId } = req.params;
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const result = await this._studentUseCase.removeWishlist(
        student.email,
        courseId
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_WISHLIST_REMOVE, { data: result }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_WISHLIST_REMOVE));
    }
  }

  async getWishlist(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const wishlist = await this._studentUseCase.getWishlist(student.email);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_WISHLIST_FETCH, { wishlist }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_WISHLIST_FETCH));
    }
  }
}