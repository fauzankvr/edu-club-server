import { Request, Response } from "express";
import { CategoryUseCase } from "../../application/useCase/Category.usercase";
import { StatusCodes } from "../constants/statusCodes";
import {
  errorResponse,
  successResponse,
} from "../../infrastructure/utility/ResponseCreator";
import {
  CATEGORY_CREATED_SUCCESS,
  CATEGORY_CREATED_FAILE,
  CATEGORY_FETCH_SUCCESS,
  CATEGORY_FETCH_FAILED,
  CATEGORY_UPDATE_SUCCESS,
  CATEGORY_UPDATE_FAILED,
  CATEGORY_TOGGLE_FAILED,
  CATEGORY_TOGGLE_SUCCESS,
} from "../constants/responseMessage";

class CategoryController {
  constructor(private categoryUseCase: CategoryUseCase) {}

  async createCategory(req: Request, res: Response) {
    try {
      const categoryData = req.body;
      const result = await this.categoryUseCase.createCategory(categoryData);

      return res
        .status(StatusCodes.CREATED)
        .json(successResponse(CATEGORY_CREATED_SUCCESS, result));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse(
            error instanceof Error ? error.message : CATEGORY_CREATED_FAILE
          )
        );
    }
  }

  async getAllCategories(req: Request, res: Response) {
    try {
      const result = await this.categoryUseCase.getAllCategories();
      return res
        .status(StatusCodes.OK)
        .json(successResponse(CATEGORY_FETCH_SUCCESS, result));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse(
            error instanceof Error ? error.message : CATEGORY_FETCH_FAILED
          )
        );
    }
  }

  async getNotBlockedCategories(req: Request, res: Response) {
    try {
      const result = await this.categoryUseCase.getNotBlockedCategories();
      return res
        .status(StatusCodes.OK)
        .json(successResponse(CATEGORY_FETCH_SUCCESS, result));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse(
            error instanceof Error ? error.message : CATEGORY_FETCH_FAILED
          )
        );
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      const result = await this.categoryUseCase.updateCategory(
        id,
        categoryData
      );
      return res
        .status(StatusCodes.OK)
        .json(successResponse(CATEGORY_UPDATE_SUCCESS, result));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse(
            error instanceof Error ? error.message : CATEGORY_UPDATE_FAILED
          )
        );
    }
  }
  async toggleCategoryBlockStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.categoryUseCase.toggleBlockStatus(id);
      return res
        .status(StatusCodes.OK)
        .json(successResponse(CATEGORY_TOGGLE_SUCCESS, result));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse(
            error instanceof Error ? error.message : CATEGORY_TOGGLE_FAILED
          )
        );
    }
  }
}

export default CategoryController;
