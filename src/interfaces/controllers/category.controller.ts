import { Request, Response } from "express";
// import { CategoryUseCase } from "../../application/useCase/Category.usercase";
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
import { ICategoryUseCase } from "../../application/interface/ICategoryUseCase";
import { CategoryResponseDTO, CreateCategoryDTO } from "../../application/interface/Dto/CatetoryDto";
import { CategoryEntity } from "../../domain/entities/Category";

class CategoryController {
  constructor(private _categoryUseCase: ICategoryUseCase) {}
  static toDTO(entity: CategoryEntity): CategoryResponseDTO {
    return {
      id: entity.id!,
      name: entity.name,
      isBlocked: entity.isBlocked ?? false,
    };
  }
  async createCategory(req: Request, res: Response) {
    try {
      const dto: CreateCategoryDTO = { name: req.body.name };
      const result = await this._categoryUseCase.createCategory(dto);

      return res
        .status(StatusCodes.CREATED)
        .json(successResponse(CATEGORY_CREATED_SUCCESS, CategoryController.toDTO(result)));
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
      if (req.query.status == "true") {
        const result = await this._categoryUseCase.getNotBlockedCategories();
        return res
          .status(StatusCodes.OK)
          .json(successResponse(CATEGORY_FETCH_SUCCESS, result));
      }
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      const result = await this._categoryUseCase.getAllCategories(limit, skip);
      const total = await this._categoryUseCase.getCategoryCount();
      const pages = Math.ceil(total / limit);
      const dto = result.map((item) => CategoryController.toDTO(item))
      return res
        .status(StatusCodes.OK)
        .json(successResponse(CATEGORY_FETCH_SUCCESS, { dto, pages }));
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
      const result = await this._categoryUseCase.getNotBlockedCategories();
      const dto = result.map((item) => CategoryController.toDTO(item))
      return res
        .status(StatusCodes.OK)
        .json(successResponse(CATEGORY_FETCH_SUCCESS, dto));
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
      const {name} = req.body;
      const result = await this._categoryUseCase.updateCategory(
        id,
        name
      );
      const dto = CategoryController.toDTO(result)
      return res
        .status(StatusCodes.OK)
        .json(successResponse(CATEGORY_UPDATE_SUCCESS, dto));
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
      const result = await this._categoryUseCase.toggleBlockStatus(id);
      const dto = CategoryController.toDTO(result)
      return res
        .status(StatusCodes.OK)
        .json(successResponse(CATEGORY_TOGGLE_SUCCESS, dto));
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
