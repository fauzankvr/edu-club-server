import { Request, Response } from "express";
import { ChatUseCase } from "../../application/useCase/chat.usecase";
import { CreateChatDTO } from "../types/ChatDto";
import { SendMessageDTO } from "../types/MessageDto";
import { StatusCodes } from "../constants/statusCodes";
import { errorResponse, successResponse } from "../../infrastructure/utility/ResponseCreator";
import { CHAT_CREATE_FAILED, CHAT_CREATE_SUCCESS, FAILED_CHAT, FAILED_FEATCH_CHATS, FAILED_FEATCH_MESSAGE, FAILED_MESSAGE_CREATE, INVALID_TOKEN, MISSING_MESSAGE, SUCCESS_CHAT_FEATCH, SUCCESS_CHAT_RESPONSE, SUCCESS_MESSAGE_CREATE, SUCCESS_MESSAGE_FEATCH } from "../constants/responseMessage";
import { StudentUseCase } from "../../application/useCase/student.usecase"; 
import { IAuthenticatedRequest } from "../middlewares/ExtractInstructor";
import { InstructorUseCase } from "../../application/useCase/instructor.usecase";
import { IAuthanticatedRequest } from "../middlewares/ExtractUser";
import { AiChatMessageModel } from "../../infrastructure/database/models/GeminiChatModel";

export class ChatController {
  constructor(
    private chatUseCase: ChatUseCase,
    private studentUsecase: StudentUseCase,
    private InstructorUseCase: InstructorUseCase
  ) {}

  async createChat(req: Request, res: Response): Promise<void> {
    try {
      const chatData: CreateChatDTO = req.body;
      const chat = await this.chatUseCase.createChat(chatData);
      res
        .status(StatusCodes.CREATED)
        .json(successResponse(CHAT_CREATE_SUCCESS, chat));
    } catch (error: unknown) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          errorResponse(
            error instanceof Error ? error.message : CHAT_CREATE_FAILED
          )
        );
    }
  }

  async getUserChats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const chats = await this.chatUseCase.getUserChats(userId);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_CHAT_FEATCH, chats));
    } catch (error: unknown) {
      res
        .status(400)
        .json(
          errorResponse(
            error instanceof Error ? error.message : FAILED_FEATCH_CHATS
          )
        );
    }
  }

  async getInstructorChats(req: Request, res: Response): Promise<void> {
    try {
      const { instructorId } = req.params;
      const chats = await this.chatUseCase.getInstructorChats(instructorId);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_CHAT_FEATCH, chats));
    } catch (error: unknown) {
      res
        .status(StatusCodes.OK)
        .json(
          errorResponse(
            error instanceof Error ? error.message : FAILED_FEATCH_CHATS
          )
        );
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const messageData: SendMessageDTO = req.body;
      const message = await this.chatUseCase.sendMessage(messageData);
      res
        .status(StatusCodes.CREATED)
        .json(successResponse(SUCCESS_MESSAGE_CREATE, message));
    } catch (error: any) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse(FAILED_MESSAGE_CREATE));
    }
  }

  async getChatMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const messages = await this.chatUseCase.getChatMessages(chatId);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_MESSAGE_FEATCH, messages));
    } catch (error: any) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse(FAILED_FEATCH_MESSAGE));
    }
  }

  // gemini chat

  async geminiChat(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const student = req.student;
      const courseId = req.params.courseId;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const studentId = student.id.toString();
      const { message } = req.body;
      if (!message) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse(MISSING_MESSAGE));
        return;
      }
      const response = await this.chatUseCase.runChat(
        message,
        studentId,
        courseId
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_CHAT_RESPONSE, { response }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_CHAT));
    }
  }

  getAiChatById = async (req: IAuthanticatedRequest, res: Response): Promise<void> => {
    try {
      const student = req.student;
      const courseId = req.params.courseId;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const studentId = student.id.toString();

      const chat = await AiChatMessageModel.find({ courseId, studentId }).lean();
      res.status(StatusCodes.OK).json(successResponse(SUCCESS_CHAT_FEATCH, chat));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_CHAT));
    }
  }

  getAllChats = async (req: IAuthenticatedRequest, res: Response) => {
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
      const InstructorData = this.InstructorUseCase.getProfile(email);
      if (!InstructorData) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      const id = (await InstructorData)._id.toString();
      const chats = await this.chatUseCase.getAllChats(id);
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
      const messages = await this.chatUseCase.getAllMessages(chatId);
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
      const message = await this.chatUseCase.postMessage(chatId, text, id);
      return res.status(200).json(message);
    } catch (error: any) {
      console.error("Error in postMessage:", error);
      return res
        .status(500)
        .json({ message: "Failed to send message", error: error.message });
    }
  };
  getCallHistory = async (req: Request, res: Response) => {
    try {
      const { instructorId } = req.params;
      const callHistory = await this.chatUseCase.getCallHistory(instructorId);
      return res.status(200).json(callHistory);
    } catch (error: any) {
      console.error("Error in getCallHistory:", error);
      return res.status(500).json({
        message: "Failed to fetch call history",
        error: error.message,
      });
    }
  };
}




