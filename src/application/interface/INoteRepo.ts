
export interface INoteRepo {
  getNote(id: string, courseId: string): Promise<any>;
  createNote(id: string, data: any): Promise<any>;
  updateNotes(id: string, studentId: string, data: any): Promise<any>;
  updateNoteTitle(
    id: string,
    studentId: string,
    title: string
  ): Promise<any>;
  deleteNotes(id: string, studentId: string): Promise<any>;
  updateNote(
    id: string,
    studentId: string,
    text: string,
    index: number
  ): Promise<any>;
  deleteNote(id: string, studentId: string, index: number): Promise<any>;
}