import { INotes } from "../../infrastructure/database/models/NotesModel";
export interface CreateNoteData {
  title?: string;
  courseId?: string;
  content?: string[];
}

export interface UpdateNoteData {
  title?: string;
  courseId?: string;
  content?: string[];
}

export interface INotesUseCase {
  getNotes(email: string, courseId: string): Promise<INotes[]>;
  createNotes(email: string, data: CreateNoteData): Promise<INotes>;
  updateNotes(email: string, id: string, data: UpdateNoteData): Promise<INotes>;
  updateNoteTitle(email: string, id: string, title: string): Promise<INotes>;
  deleteNotes(email: string, id: string): Promise<boolean | INotes>;
  updateNote(email: string, id: string, text: string, index: number): Promise<INotes>;
  deleteNote(email: string, id: string, index: number): Promise<INotes>;
}