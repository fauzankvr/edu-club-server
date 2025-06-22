import { Response } from "express";
import { IAuthanticatedRequest } from "../middlewares/ExtractUser";
import { StatusCodes } from "../constants/statusCodes";
import { errorResponse, successResponse } from "../../infrastructure/utility/ResponseCreator";
import { FAILED_NOTE_DELETE, FAILED_NOTE_UPDATE, FAILED_NOTES_CREATE, FAILED_NOTES_DELETE, FAILED_NOTES_FETCH, FAILED_NOTES_UPDATE, INVALID_TOKEN, SUCCESS_NOTE_DELETED, SUCCESS_NOTE_UPDATED, SUCCESS_NOTES_CREATED, SUCCESS_NOTES_DELETED, SUCCESS_NOTES_FETCH, SUCCESS_NOTES_UPDATED } from "../constants/responseMessage";
import { NotesUseCase } from "../../application/useCase/notes.usecase";

// Notes Controller
export class NotesController {
  constructor(private notesUseCase: NotesUseCase) {}

  async getNotes(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const notes = await this.notesUseCase.getNotes(
        student.email,
        req.params.id
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_NOTES_FETCH, { notes }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTES_FETCH));
    }
  }

  async createNotes(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const notes = await this.notesUseCase.createNotes(
        student.email,
        req.body
      );
      res
        .status(StatusCodes.CREATED)
        .json(successResponse(SUCCESS_NOTES_CREATED, { notes }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTES_CREATE));
    }
  }

  async updateNotes(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const notes = await this.notesUseCase.updateNotes(
        student.email,
        req.params.id,
        req.body.note
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_NOTES_UPDATED, { notes }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTES_UPDATE));
    }
  }

  async updateNoteTitle(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const notes = await this.notesUseCase.updateNoteTitle(
        student.email,
        req.params.id,
        req.body.title
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_NOTES_UPDATED, { notes }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTES_UPDATE));
    }
  }

  async deleteNotes(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const notes = await this.notesUseCase.deleteNotes(
        student.email,
        req.params.id
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_NOTES_DELETED, { notes }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTES_DELETE));
    }
  }

  async updateNote(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const notes = await this.notesUseCase.updateNote(
        student.email,
        req.params.id,
        req.body.newText,
        req.body.noteIndex
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_NOTE_UPDATED, { notes }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTE_UPDATE));
    }
  }

  async deleteNote(req: IAuthanticatedRequest, res: Response): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const notes = await this.notesUseCase.deleteNote(
        student.email,
        req.params.id,
        req.body.noteIndex
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_NOTE_DELETED, { notes }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTE_DELETE));
    }
  }
  async updateNotesTitle(
    req: IAuthanticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const notes = await this.notesUseCase.updateNote(
        student.email,
        req.params.id,
        req.body.newText,
        req.body.noteIndex
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_NOTE_UPDATED, { notes }));
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message || FAILED_NOTE_UPDATE));
    }
  }
}
