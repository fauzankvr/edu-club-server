import { Request, Response } from "express";
import { IAuthanticatedRequest } from "../middlewares/ExtractUser";
import { FAILED_ORDER_CAPTURE, FAILED_ORDER_CREATE, FAILED_ORDER_FETCH, INVALID_TOKEN, SUCCESS_ORDER_CAPTURED, SUCCESS_ORDER_CREATED, SUCCESS_ORDERS_FETCHED } from "../constants/responseMessage";
import { StatusCodes } from "../constants/statusCodes";
import { captureOrderService, createOrderService } from "../../infrastructure/services/PaypalIntigrataion";
import { errorResponse, successResponse } from "../../infrastructure/utility/ResponseCreator";
import { IAuthenticatedRequest } from "../middlewares/ExtractInstructor";
import { IStudentUseCase } from "../../application/interface/IStudentUseCase";
import { IOrderUseCase } from "../../application/interface/IOrderUseCase";
import { IInstructorUseCase } from "../../application/interface/IInstructorUseCase";


export class OrderController {
  constructor(
    private _studentUseCase: IStudentUseCase,
    private _orderUseCase: IOrderUseCase,
    private _instructorUseCase: IInstructorUseCase
  ) {}

  async createOrder(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const { cart } = req.body;
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const { orderId, status } = await createOrderService(cart, student.email);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_ORDER_CREATED, { orderId, status }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_ORDER_CREATE));
    }
  }

  async getOrders(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const orders = await this._orderUseCase.getOrders(student.id);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_ORDERS_FETCHED, { purchases: orders }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_ORDER_FETCH));
    }
  }


  async captureOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { message, captureId, orderID1 } = await captureOrderService(
        orderId
      );
      
      res.status(StatusCodes.OK).json(
        successResponse(SUCCESS_ORDER_CAPTURED, {
          message,
          captureId,
          orderID1,
        })
      );
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_ORDER_CAPTURE));
    }
  }

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

      const pendingPayments = await this._orderUseCase.getPendingPayment(email);
      res.status(200).json({ success: true, data: pendingPayments });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch pending payments" });
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

      const instructordata = await this._instructorUseCase.getProfile(
        instructorMail
      );
      if (!instructordata || !instructordata.paypalEmail) {
        return res.status(400).json({
          success: false,
          message: "PayPal email is not set. Please update your profile.",
        });
      }

      const paypalEmail = instructordata.paypalEmail;
      const payoutData = await this._orderUseCase.requestPayout(
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
  async getDashboardData(req: IAuthenticatedRequest, res: Response) {
    try {
      const instructor = req.instructor
      if (
        !instructor ||
        typeof instructor === "string" ||
        !("email" in instructor)
      ) {
        throw new Error("Invalid token payload: Email not found");
      }
      const instructoremail = instructor.email
      if (!instructoremail) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { filterType, startDate, endDate } = req.query;
      let filter;
      if (filterType) {
        filter = {
          type: filterType as "weekly" | "monthly" | "yearly" | "custom",
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        };
      }

      const data = await this._orderUseCase.getDashboard(
        instructoremail,
        filter
      );
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}