import { INoteRepo } from "../interface/INoteRepo";
import IStudentRepo from "../interface/IStudentRepo";


export class NotesUseCase {
  constructor(
    private notesRepo: INoteRepo,
    private studentRepo: IStudentRepo
  ) {}

  getNotes = async (email: string, courseId: string) => {
    const student = await this.studentRepo.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    console.log("studentId", studentId);
    console.log("courseId", courseId);
    const notes = await this.notesRepo.getNote(studentId, courseId);
    return notes;
  };
  createNotes = async (email: string, data: object) => {
    const student = await this.studentRepo.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const notes = await this.notesRepo.createNote(studentId, data);
    return notes;
  };
  updateNotes = async (email: string, id: string, data: object) => {
    const student = await this.studentRepo.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const notes = await this.notesRepo.updateNotes(id, studentId, data);
    return notes;
  };
  updateNoteTitle = async (email: string, id: string, title: string) => {
    const student = await this.studentRepo.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const notes = await this.notesRepo.updateNoteTitle(id, studentId, title);
    return notes;
  };
  deleteNotes = async (email: string, id: string) => {
    const student = await this.studentRepo.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const notes = await this.notesRepo.deleteNotes(id, studentId);
    return notes;
  };
  updateNote = async (
    email: string,
    id: string,
    text: string,
    index: number
  ) => {
    const student = await this.studentRepo.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const notes = await this.notesRepo.updateNote(id, studentId, text, index);
    return notes;
  };
  deleteNote = async (email: string, id: string, index: number) => {
    const student = await this.studentRepo.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error("Student not found");
    }
    const studentId = student._id.toString();
    const notes = await this.notesRepo.deleteNote(id, studentId, index);
    return notes;
  };
}