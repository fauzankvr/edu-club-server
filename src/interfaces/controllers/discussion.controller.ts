import { Request, Response } from "express";
import { StatusCodes } from "../constants/statusCodes";
import { errorResponse, successResponse } from "../../infrastructure/utility/ResponseCreator";
import { FAILED_DISCUSSION_CREATE, FAILED_DISCUSSIONS_FETCH, FAILED_REPLIES_FETCH, FAILED_REPLY_ADD, INVALID_REACTION_TYPE, INVALID_TOKEN, MISSING_REPLY_TEXT, STUDENT_DATA_NOT_FOUND, SUCCESS_DISCUSSION_CREATED, SUCCESS_DISCUSSIONS_FETCH, SUCCESS_REPLIES_FETCH, SUCCESS_REPLY_ADDED } from "../constants/responseMessage";
import { IAuthanticatedRequest } from "../middlewares/ExtractUser";
import { IReply } from "../../application/interface/IDiscussion";
import { IStudentUseCase } from "../../application/interface/IStudentUseCase";
import { IDiscussionUseCase } from "../../application/interface/IDiscussionUseCase";


export class DiscussionController {
  constructor(
    private _discussionUseCase: IDiscussionUseCase,
    private _studentUseCase: IStudentUseCase
  ) {}

  async createDiscussion(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.id;
      const data = await this._discussionUseCase.createDiscussion(
        orderId,
        req.body.text
      );
      res
        .status(StatusCodes.CREATED)
        .json(successResponse(SUCCESS_DISCUSSION_CREATED, { data }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_DISCUSSION_CREATE));
    }
  }

  async getAllDiscussions(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.id;
      const discussions = await this._discussionUseCase.getAllDiscussions(
        orderId
      );
      res.status(StatusCodes.OK).json(
        successResponse(SUCCESS_DISCUSSIONS_FETCH, {
          data: discussions,
        })
      );
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_DISCUSSIONS_FETCH));
    }
  }

  async createReact(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.body;
      if (!["like", "dislike"].includes(type)) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse(INVALID_REACTION_TYPE));
        return;
      }
      const data = await this._discussionUseCase.createReact(
        req.params.id,
        type
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse("Reaction created successfully", { data }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || "Failed to create reaction"));
    }
  }

  async createReplay(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const studentData = await this._studentUseCase.getProfile(student.email);
      const userId = studentData._id;
      if (!studentData || !userId) {
        throw new Error(STUDENT_DATA_NOT_FOUND);
      }
      const discussionId = req.params.id;
      const { text } = req.body;
      if (!text) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse(MISSING_REPLY_TEXT));
        return;
      }
      const reply: IReply = {
        discussionId,
        userId,
        text,
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
        createdAt: new Date(),
      };
      const updatedDiscussion = await this._discussionUseCase.addReply(
        discussionId,
        reply
      );
      res.status(StatusCodes.OK).json(
        successResponse(SUCCESS_REPLY_ADDED, {
          data: updatedDiscussion,
        })
      );
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_REPLY_ADD));
    }
  }

  async getReplay(req: Request, res: Response): Promise<void> {
    try {
      const discussionId = req.params.id;
      const replies = await this._discussionUseCase.getReplay(discussionId);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_REPLIES_FETCH, { replies }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_REPLIES_FETCH));
    }
  }
}
