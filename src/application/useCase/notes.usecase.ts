import { INoteRepository } from "../interface/INoteRepository";
import { INotesUseCase } from "../interface/INotesUseCase";
import IStudentRepository from "../interface/IStudentRepository";


export class NotesUseCase implements INotesUseCase {
  constructor(
    private _notesRepository: INoteRepository,
    private _studentRepository: IStudentRepository
  ) {}

  getNotes = async (email: string, courseId: string) => {
    const student = await this._studentRepository.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    console.log("studentId", studentId);
    console.log("courseId", courseId);
    const notes = await this._notesRepository.getNote(studentId, courseId);
    return notes;
  };
  createNotes = async (email: string, data: object) => {
    const student = await this._studentRepository.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const notes = await this._notesRepository.createNote(studentId, data);
    return notes;
  };
  updateNotes = async (email: string, id: string, data: object) => {
    const student = await this._studentRepository.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const notes = await this._notesRepository.updateNotes(id, studentId, data);
    return notes;
  };
  updateNoteTitle = async (email: string, id: string, title: string) => {
    const student = await this._studentRepository.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const notes = await this._notesRepository.updateNoteTitle(id, studentId, title);
    return notes;
  };
  deleteNotes = async (email: string, id: string) => {
    const student = await this._studentRepository.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const notes = await this._notesRepository.deleteNotes(id, studentId);
    return notes;
  };
  updateNote = async (
    email: string,
    id: string,
    text: string,
    index: number
  ) => {
    const student = await this._studentRepository.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const notes = await this._notesRepository.updateNote(id, studentId, text, index);
    return notes;
  };
  deleteNote = async (email: string, id: string, index: number) => {
    const student = await this._studentRepository.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const notes = await this._notesRepository.deleteNote(id, studentId, index);
    return notes;
  };
}