import { Model } from "mongoose";
import { INotes } from "../database/models/NotesModel";
import { INoteRepository } from "../../application/interface/INoteRepository";

export class NotesRepository implements INoteRepository {
  constructor(private _notes: Model<INotes>) {}

  async getNote(id: string, courseId: string): Promise<any> {
    return await this._notes.find({ student_id: id, course_id: courseId });
  }

  async createNote(id: string, data: any): Promise<any> {
    const notes = new this._notes({
      title: data.title,
      notes: data.notes,
      student_id: id,
      course_id: data.course_id,
    });
    return await notes.save();
  }

  async updateNotes(
    id: string,
    studentId: string,
    newNote: string
  ): Promise<any> {
    return await this._notes.findOneAndUpdate(
      { _id: id, student_id: studentId },
      { $push: { notes: newNote } },
      { new: true }
    );
  }

  async deleteNotes(id: string, studentId: string): Promise<any> {
    return await this._notes.findOneAndDelete({ _id: id, student_id: studentId });
  }

  async deleteNote(id: string, studentId: string, index: number): Promise<any> {
    const noteDoc = await this._notes.findOne({ _id: id, student_id: studentId });
    if (noteDoc?.notes && index >= 0 && index < noteDoc.notes.length) {
      noteDoc.notes.splice(index, 1);
      return await noteDoc.save();
    }
    return null;
  }

  async updateNote(
    id: string,
    studentId: string,
    newNote: string,
    index: number
  ): Promise<any> {
    const noteDoc = await this._notes.findOne({ _id: id, student_id: studentId });
    if (noteDoc?.notes && index >= 0 && index < noteDoc.notes.length) {
      noteDoc.notes[index] = newNote;
      return await noteDoc.save();
    }
    return null;
  }
updateNoteTitle(id: string, studentId: string, title: string): Promise<any> {
    return this._notes.findOneAndUpdate(
      { _id: id, student_id: studentId },
      { title: title },
      { new: true }
    );
}
}
