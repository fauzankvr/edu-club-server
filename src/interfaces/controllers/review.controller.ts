import { Request, Response } from "express";
import { ReviewUseCase } from "../../application/useCase/review.usecase";
import { IAuthanticatedRequest } from "../middlewares/ExtractUser";
import { FAILED_MY_REVIEW_FETCH, FAILED_REVIEW_ADD, FAILED_REVIEW_FETCH, FAILED_REVIEW_REACTION, INVALID_REACTION_TYPE, INVALID_TOKEN, STUDENT_DATA_NOT_FOUND, SUCCESS_MY_REVIEW_FETCH, SUCCESS_REVIEW_ADD, SUCCESS_REVIEW_FETCH, SUCCESS_REVIEW_REACTION } from "../constants/responseMessage";
import { StatusCodes } from "../constants/statusCodes";
import { errorResponse, successResponse } from "../../infrastructure/utility/ResponseCreator";
import { StudentUseCase } from "../../application/useCase/student.usecase";

// Review Controller
export class ReviewController {
  constructor(
    private reviewUseCase: ReviewUseCase,
    private studentUseCase: StudentUseCase
  ) {}

  async addReview(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const { rating, comment } = req.body;
      const { courseId } = req.params;
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const studentData = await this.studentUseCase.getProfile(student.email);
      if (!studentData.email || !studentData.firstName) {
        throw new Error(STUDENT_DATA_NOT_FOUND);
      }
      const newReview = await this.reviewUseCase.addReview(
        studentData.email,
        studentData.firstName,
        courseId,
        rating,
        comment
      );
      res
        .status(StatusCodes.CREATED)
        .json(successResponse(SUCCESS_REVIEW_ADD, { review: newReview }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_REVIEW_ADD));
    }
  }

  async getReview(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const reviews = await this.reviewUseCase.getReview(courseId);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_REVIEW_FETCH, { reviews }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_REVIEW_FETCH));
    }
  }

  async addReaction(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const type = req.body.type;
      if (!["like", "dislike"].includes(type)) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse(INVALID_REACTION_TYPE));
        return;
      }
      const reviews = await this.reviewUseCase.handleReviewReaction(
        reviewId,
        student.email,
        type
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_REVIEW_REACTION, { reviews }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_REVIEW_REACTION));
    }
  }

  async getMyReview(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const myReview = await this.reviewUseCase.getMyReview(
        courseId,
        student.email
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_MY_REVIEW_FETCH, { myReview }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_MY_REVIEW_FETCH));
    }
  }
}
