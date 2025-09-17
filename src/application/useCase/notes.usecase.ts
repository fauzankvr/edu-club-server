import { INoteRepository } from "../interface/INoteRepository"; 
import { INotesUseCase } from "../interface/INotesUseCase";
import IStudentRepository from "../interface/IStudentRepository";
import { StudentEntity } from "../../domain/entities/Student";
import { NotesEntity } from "../../domain/entities/Note"; 
import {
  STUDENT_NOT_FOUND,
  USER_BLOCKED,
  FAILED_NOTES_CREATE,
  FAILED_NOTES_DELETE,
  INVALID_NOTE_INDEX,
  EMPTY_NOTE_TEXT,
  EMPTY_TITLE,
  INVALID_INPUT,
  FAILED_NOTES_UPDATE,
  USER_NOT_FOUND,
  NOTES_ALREDY_EXIST,
} from "../../interfaces/constants/responseMessage";

export class NotesUseCase implements INotesUseCase {
  constructor(
    private _notesRepository: INoteRepository,
    private _studentRepository: IStudentRepository
  ) {}

  // Helper method to get validated student
  private async getValidatedStudent(email: string): Promise<StudentEntity> {
    if (!email || email.trim().length === 0) {
      throw new Error(INVALID_INPUT);
    }

    const student = await this._studentRepository.findByEmail(email);
    if (!student) {
      throw new Error(STUDENT_NOT_FOUND);
    }

    if (student.isBlocked) {
      throw new Error(USER_BLOCKED);
    }

    if (!student.id) {
      throw new Error(USER_NOT_FOUND);
    }

    return student;
  }

  // Helper method to validate note text
  private validateNoteText(text: string): void {
    if (!text || text.trim().length === 0) {
      throw new Error(EMPTY_NOTE_TEXT);
    }
  }

  // Helper method to validate title
  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error(EMPTY_TITLE);
    }
  }

  async getNotes(email: string, courseId: string): Promise<NotesEntity[] | null> {
    if (!courseId || courseId.trim().length === 0) {
      throw new Error(INVALID_INPUT);
    }

    const student = await this.getValidatedStudent(email);
    if (!student?.id) throw new Error(USER_NOT_FOUND);
    const notes = await this._notesRepository.find(student.id, courseId);

    return notes;
  }

  async createNotes(
    email: string,
    data: {
      title?: string;
      notes?: string[];
      courseId: string;
    }
  ): Promise<NotesEntity> {

    if (!data.courseId || !data.title||data.title.trim().split("").length==0) {
      throw new Error(INVALID_INPUT);
    }

    const student = await this.getValidatedStudent(email);
    if (!student?.id) throw new Error();
    const existingNotes = await this._notesRepository.findByTitle(
      student.id,
      data.courseId,
      data.title.trim()
    );
    if (existingNotes) {
      throw new Error(NOTES_ALREDY_EXIST);
    }

    // Validate notes if provided
    // if (data.notes) {
    //   data.notes.forEach((note) => this.validateNoteText(note));
    // }

    // Validate title if provided
    if (data.title) {
      this.validateTitle(data.title);
    }

    const notes = await this._notesRepository.create(student.id, {
      title: data.title.trim() || null,
      notes: data.notes || null,
      course_id: data.courseId,
    });

    if (!notes) {
      throw new Error(FAILED_NOTES_CREATE);
    }

    return notes;
  }

  async addNote(
    email: string,
    notesId: string,
    noteText: string
  ): Promise<NotesEntity> {
    if (!notesId || notesId.trim().length === 0) {
      throw new Error(INVALID_INPUT);
    }

    this.validateNoteText(noteText);
    const student = await this.getValidatedStudent(email);
    if (!student?.id) throw new Error(USER_NOT_FOUND);
    const updatedNotes = await this._notesRepository.addNote(
      notesId,
      student.id,
      noteText.trim()
    );
    if (!updatedNotes) {
      throw new Error(FAILED_NOTES_UPDATE);
    }

    return updatedNotes;
  }

  async updateNoteTitle(
    email: string,
    notesId: string,
    title: string
  ): Promise<NotesEntity> {
    if (!notesId || notesId.trim().length === 0) {
      throw new Error(INVALID_INPUT);
    }

    this.validateTitle(title);
    const student = await this.getValidatedStudent(email);
    if (!student?.id) throw new Error(USER_NOT_FOUND);
    const updatedNotes = await this._notesRepository.updateTitle(
      notesId,
      student.id,
      title.trim()
    );
    if (!updatedNotes) {
      throw new Error(FAILED_NOTES_UPDATE);
    }

    return updatedNotes;
  }
  async updateNotes(email: string, id: string, data: string): Promise<NotesEntity> {
     const student = await this.getValidatedStudent(email);
     if (!student) {
       throw new Error(USER_NOT_FOUND);
     }
     if (!student?.id) throw new Error(USER_NOT_FOUND);
    const studentId = student.id
    const notes = await this._notesRepository.addNote(id, studentId, data);
    if(!notes) throw new Error("")
     return notes;
  }

  async updateNote(
    email: string,
    notesId: string,
    text: string,
    index: number
  ): Promise<NotesEntity> {
    if (!notesId || notesId.trim().length === 0 || index < 0) {
      throw new Error(INVALID_INPUT);
    }

    this.validateNoteText(text);
    const student = await this.getValidatedStudent(email);
    if (!student?.id) throw new Error(USER_NOT_FOUND);
    const updatedNotes = await this._notesRepository.updateNote(
      notesId,
      student.id,
      text.trim(),
      index
    );
    if (!updatedNotes) {
      throw new Error(INVALID_NOTE_INDEX);
    }

    return updatedNotes;
  }
async deleteNotes(email: string, id: string): Promise<boolean> {
  const student = await this._studentRepository.findByEmail(email);
  if (!student) {
    throw new Error(USER_NOT_FOUND);
  }
   if (!student?.id) throw new Error(USER_NOT_FOUND);
  const studentId = student.id
  const notes = await this._notesRepository.delete(id, studentId);
  return notes;
}
  async deleteNote(email: string, notesId: string): Promise<boolean> {
    if (!notesId || notesId.trim().length === 0) {
      throw new Error(INVALID_INPUT);
    }

    const student = await this.getValidatedStudent(email);
    if (!student?.id) throw new Error(USER_NOT_FOUND);
    const deleted = await this._notesRepository.delete(notesId, student.id);
    if (!deleted) {
      throw new Error(FAILED_NOTES_DELETE);
    }

    return true;
  }

  async removeNote(
    email: string,
    notesId: string,
    index: number
  ): Promise<boolean> {
    if (!notesId || notesId.trim().length === 0 || index < 0) {
      throw new Error(INVALID_INPUT);
    }

    const student = await this.getValidatedStudent(email);
    if (!student?.id) throw new Error(USER_NOT_FOUND);
    const removed = await this._notesRepository.removeNote(
      notesId,
      student.id,
      index
    );
    if (!removed) {
      throw new Error(INVALID_NOTE_INDEX);
    }

    return true;
  }
}
