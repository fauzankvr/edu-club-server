import { Request, Response } from "express";
import { PlanUseCase } from "../../application/useCase/plan.usecase";
import { StatusCodes } from "../constants/statusCodes";
import { errorResponse, successResponse } from "../../infrastructure/utility/ResponseCreator";
import { FAILED_ORDER_CAPTURE, FAILED_ORDER_CREATE, FAILED_PLAN_BLOCKED, FAILED_PLAN_CREATE, FAILED_PLAN_FETCHED, FAILED_PLAN_UPDATED, INVALID_TOKEN, SUCCESS_ORDER_CAPTURED, SUCCESS_ORDER_CREATED, SUCCESS_PLAN_BLOCKED, SUCCESS_PLAN_CREATED, SUCCESS_PLAN_FETCHED, SUCCESS_PLAN_UPDATED } from "../constants/responseMessage";
import { capturePlanOrderService, createPlanOrderService } from "../../infrastructure/services/PlanCheckoutServices";
import { IAuthanticatedRequest } from "../middlewares/ExtractUser";

export class PlanController {
  constructor(private planUseCase: PlanUseCase) {}
  async createPlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = req.body;
      console.log(plan);

      const result = await this.planUseCase.createPlan(plan);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_PLAN_CREATED, result));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_PLAN_CREATE));
    }
  }
  async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.planUseCase.getPlans();
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_PLAN_FETCHED, result));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_PLAN_FETCHED));
    }
  }
  async getPlan(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.planUseCase.getPlan(id);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_PLAN_FETCHED, result));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_PLAN_FETCHED));
    }
  }
  async updatePlan(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const plan = req.body;
      const result = await this.planUseCase.updatePlans(id, plan);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_PLAN_UPDATED, result));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_PLAN_UPDATED));
    }
  }
  async blockPlan(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.planUseCase.blockPlan(id);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_PLAN_BLOCKED, result));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_PLAN_BLOCKED));
    }
  }
  async getNonBlockedPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await this.planUseCase.findNonBlockedPlans();
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_PLAN_FETCHED, plans));
    } catch (error: any) {
      console.error("Error fetching plans:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_PLAN_FETCHED));
    }
  }

  async getPlanById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse("Missing required field: id"));
        return;
      }

      const plan = await this.planUseCase.getPlan(id);
      if (!plan) {
        res.status(StatusCodes.NOT_FOUND).json(errorResponse("Plan not found"));
        return;
      }

      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_PLAN_FETCHED, plan));
    } catch (error: any) {
      console.error("Error fetching plan:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_PLAN_FETCHED));
    }
  }

  async createPlanOrder(
    req: IAuthanticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { planId, userId } = req.body;
      if (!planId || !userId) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse("Missing required fields: planId, userId"));
        return;
      }

      const order = await createPlanOrderService(planId, userId);
      res
        .status(StatusCodes.CREATED)
        .json(successResponse(SUCCESS_ORDER_CREATED, order));
    } catch (error: any) {
      console.error("Error creating plan order:", error);
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse(error.message || FAILED_ORDER_CREATE));
    }
  }

  async capturePlanOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.body;
      console.log(orderId);
      if (!orderId) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse("Missing required field: orderId"));
        return;
      }

      const result = await capturePlanOrderService(orderId);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_ORDER_CAPTURED, result));
    } catch (error: any) {
      console.error("Error capturing plan order:", error);
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorResponse(error.message || FAILED_ORDER_CAPTURE));
    }
  }
async getOrderedPlan(
    req: IAuthanticatedRequest,
    res: Response
  ): Promise<void> {
  const student = req.student;
  console.log(student)
         if (!student || typeof student === "string" || !("email" in student)) {
           throw new Error(INVALID_TOKEN);
         }

    const orderedPlan = await this.planUseCase.getOrderedPlan(student.id);
    res
      .status(StatusCodes.OK)
      .json(successResponse(SUCCESS_PLAN_FETCHED, orderedPlan));
    return;
  }
}