import { Request, Response } from "express";
import { StatusCodes } from "../constants/statusCodes";
import {
  successResponse,
  errorResponse,
} from "../../infrastructure/utility/ResponseCreator";
import {
  LANGUAGE_CREATED_SUCCESS,
  LANGUAGE_CREATED_FAILED,
  LANGUAGE_FETCH_SUCCESS,
  LANGUAGE_FETCH_FAILED,
  LANGUAGE_UPDATE_SUCCESS,
  LANGUAGE_UPDATE_FAILED,
  LANGUAGE_TOGGLE_BLOCK_SUCCESS,
  LANGUAGE_TOGGLE_BLOCK_FAILED,
} from "../constants/responseMessage";
import { ILanguageUseCase } from "../../application/interface/ILanguateUseCase";

class LanguageController {
  constructor(private readonly _languageUseCase: ILanguageUseCase) {}

  async createLanguage(req: Request, res: Response) {
    try {
      const languageData = req.body;
      const result = await this._languageUseCase.createLanguage(languageData);
      return res
        .status(StatusCodes.CREATED)
        .json(successResponse(LANGUAGE_CREATED_SUCCESS, result));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse(
            error instanceof Error ? error.message : LANGUAGE_CREATED_FAILED
          )
        );
    }
  }

  async getAllLanguages(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = parseInt(req.query.skip as string) || 0;
      const result = await this._languageUseCase.getAllLanguages(limit, skip);
      const total = await this._languageUseCase.getTotalLanguagesCount();
      const totalPages = Math.ceil(total / limit);
      return res
        .status(StatusCodes.OK)
        .json(successResponse(LANGUAGE_FETCH_SUCCESS,{result, totalPages }));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse(
            error instanceof Error ? error.message : LANGUAGE_FETCH_FAILED
          )
        );
    }
  }

  async getNotBlockedLanguages(req: Request, res: Response) {
    try {
      const result = await this._languageUseCase.getNotBlockedLanguages();
      return res
        .status(StatusCodes.OK)
        .json(successResponse(LANGUAGE_FETCH_SUCCESS, result));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse(
            error instanceof Error ? error.message : LANGUAGE_FETCH_FAILED
          )
        );
    }
  }

  async updateLanguage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await this._languageUseCase.updateLanguage(id, updateData);
      return res
        .status(StatusCodes.OK)
        .json(successResponse(LANGUAGE_UPDATE_SUCCESS, result));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse(
            error instanceof Error ? error.message : LANGUAGE_UPDATE_FAILED
          )
        );
    }
  }

  async toggleLanguageBlockStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this._languageUseCase.toggleBlockStatus(id);
      return res
        .status(StatusCodes.OK)
        .json(successResponse(LANGUAGE_TOGGLE_BLOCK_SUCCESS, result));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse(
            error instanceof Error
              ? error.message
              : LANGUAGE_TOGGLE_BLOCK_FAILED
          )
        );
    }
  }
}

export default LanguageController;
