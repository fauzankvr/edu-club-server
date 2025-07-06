import { Request, Response } from "express";
import { NotificationUseCase } from "../../application/useCase/notificaion.usecase"; 
import { IAuthanticatedRequest } from "../middlewares/ExtractUser";
import {
  FAILED_NOTIFICATION_CREATE,
  FAILED_NOTIFICATION_FETCH,
  FAILED_NOTIFICATION_READ,
  FAILED_NOTIFICATION_CLEAR,
  INVALID_TOKEN,
  STUDENT_DATA_NOT_FOUND,
  SUCCESS_NOTIFICATION_CREATE,
  SUCCESS_NOTIFICATION_FETCH,
  SUCCESS_NOTIFICATION_READ,
  SUCCESS_NOTIFICATION_CLEAR,
} from "../constants/responseMessage";
import { StatusCodes } from "../constants/statusCodes";
import {
  successResponse,
  errorResponse,
} from "../../infrastructure/utility/ResponseCreator";
import { StudentUseCase } from "../../application/useCase/student.usecase";
import { IAuthenticatedRequest } from "../middlewares/ExtractInstructor";

export class NotificationController {
  constructor(
    private notificationUseCase: NotificationUseCase,
    private studentUseCase: StudentUseCase
  ) {}

  async getAllNotification(
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
        throw new Error("Invalid token payload: Email not found");
      }
      const instructorId = instructor.id;
      if (!instructorId) {
        throw new Error("Invalid token payload: Email not found");
      }

      const notifications =
        await this.notificationUseCase.getAllNotification(
          instructorId,
        );

      res.status(StatusCodes.CREATED).json(
        successResponse(SUCCESS_NOTIFICATION_FETCH, {
          notification: notifications,
        })
      );
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTIFICATION_CREATE));
    }
  }

  async createNotification(
    req: IAuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { type, title, message, userId } = req.body;
      const instructor = req.instructor;
      if (
        !instructor ||
        typeof instructor === "string" ||
        !("email" in instructor)
      ) {
        throw new Error("Invalid token payload: Email not found");
      }
      const instructorId = instructor.id;
      if (!instructorId) {
        throw new Error("Invalid token payload: Email not found");
      }

      const createdNotification =
        await this.notificationUseCase.createNotification({
          type,
          title,
          message,
          studentId: userId,
          instructorId,
        });

      res.status(StatusCodes.CREATED).json(
        successResponse(SUCCESS_NOTIFICATION_CREATE, {
          notification: createdNotification,
        })
      );
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTIFICATION_CREATE));
    }
  }

  async getNotifications(
    req: IAuthanticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const notifications = await this.notificationUseCase.getNotifications(
        student.id.toString()
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_NOTIFICATION_FETCH, { notifications }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTIFICATION_FETCH));
    }
  }

  async markAsRead(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const { id: notificationId } = req.params;
      const student = req.student;

      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }

      const updated = await this.notificationUseCase.markAsRead(
        notificationId,
        student.email
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_NOTIFICATION_READ, { updated }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTIFICATION_READ));
    }
  }

  async clearNotifications(
    req: IAuthanticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }

      const cleared = await this.notificationUseCase.clearNotifications(
        student.id
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_NOTIFICATION_CLEAR, { cleared }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTIFICATION_CLEAR));
    }
  }
}
