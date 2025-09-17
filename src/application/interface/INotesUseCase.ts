import { NotesEntity } from "../../domain/entities/Note"; 

export interface CreateNoteData {
  title?: string;
  courseId: string; // Required for business logic
  content?: string[];
}


export interface INotesUseCase {
  getNotes(email: string, courseId: string): Promise<NotesEntity[] | null>;
  createNotes(email: string, data: CreateNoteData): Promise<NotesEntity>;
  updateNotes(email: string, id: string, data: string): Promise<NotesEntity>;
  updateNoteTitle(
    email: string,
    id: string,
    title: string
  ): Promise<NotesEntity>;
  deleteNotes(email: string, id: string): Promise<boolean>;
  updateNote(
    email: string,
    id: string,
    text: string,
    index: number
  ): Promise<NotesEntity>;
  removeNote(email: string, id: string, index: number): Promise<boolean>;
}
