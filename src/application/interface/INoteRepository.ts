import { NotesEntity } from "../../domain/entities/Note"; 

export interface INoteRepository {
  find(studentId: string, courseId: string): Promise<NotesEntity[] | null>;
  findByTitle(
    studentId: string,
    courseId: string,
    title: string
  ): Promise<NotesEntity | null>;
  create(studentId: string, data: any): Promise<NotesEntity>;
  addNote(
    notesId: string,
    studentId: string,
    noteText: string
  ): Promise<NotesEntity | null>;
  updateTitle(
    notesId: string,
    studentId: string,
    title: string
  ): Promise<NotesEntity | null>;
  updateNote(
    notesId: string,
    studentId: string,
    text: string,
    index: number
  ): Promise<NotesEntity | null>;
  delete(notesId: string, studentId: string): Promise<boolean>;
  removeNote(
    notesId: string,
    studentId: string,
    index: number
  ): Promise<boolean>;
}
