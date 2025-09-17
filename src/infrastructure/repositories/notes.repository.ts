import { Model } from "mongoose";
import { INotes } from "../database/models/NotesModel";
import { INoteRepository } from "../../application/interface/INoteRepository"; 
import { NotesEntity } from "../../domain/entities/Note"; 

export class NoteRepository implements INoteRepository {
  constructor(private _notes: Model<INotes>) {}

  // Helper to convert to entity
  private toEntity(data: INotes): NotesEntity {
    return new NotesEntity(
      data._id.toString(),
      data.title?.toString() || null,
      data.notes?.map((note) => note.toString()) || null,
      data.student_id?.toString() || null,
      data.course_id?.toString() || null,
    );
  }

  async find(studentId: string, courseId: string): Promise<NotesEntity[] | null> {
    const result = await this._notes.find({
      student_id: studentId,
      course_id: courseId,
    });
    return result ? result.map((course)=>this.toEntity(course)) : null;
  }
  async findByTitle(studentId: string, courseId: string, title: string): Promise<NotesEntity | null> {
    const result = await this._notes.findOne({
      student_id: studentId,
      course_id: courseId,
      title:title
    });
    return result?this.toEntity(result):null
  }

  async create(studentId: string, data: any): Promise<NotesEntity> {
    const notes = new this._notes({
      title: data.title,
      notes: data.notes,
      student_id: studentId,
      course_id: data.course_id,
    });
    const saved = await notes.save();
    return this.toEntity(saved);
  }

  async addNote(
    notesId: string,
    studentId: string,
    noteText: string
  ): Promise<NotesEntity | null> {
    const result = await this._notes.findOneAndUpdate(
      { _id: notesId, student_id: studentId },
      { $push: { notes: noteText } },
      { new: true }
    );
    return result ? this.toEntity(result) : null;
  }

  async updateTitle(
    notesId: string,
    studentId: string,
    title: string
  ): Promise<NotesEntity | null> {
    const result = await this._notes.findOneAndUpdate(
      { _id: notesId, student_id: studentId },
      { title: title },
      { new: true }
    );
    return result ? this.toEntity(result) : null;
  }

  async updateNote(
    notesId: string,
    studentId: string,
    text: string,
    index: number
  ): Promise<NotesEntity | null> {
    const noteDoc = await this._notes.findOne({
      _id: notesId,
      student_id: studentId,
    });
    if (!noteDoc?.notes || index < 0 || index >= noteDoc.notes.length) {
      return null;
    }

    noteDoc.notes[index] = text;
    const saved = await noteDoc.save();
    return this.toEntity(saved);
  }

  async delete(notesId: string, studentId: string): Promise<boolean> {
    const result = await this._notes.findOneAndDelete({
      _id: notesId,
      student_id: studentId,
    });
    return result !== null;
  }

  async removeNote(
    notesId: string,
    studentId: string,
    index: number
  ): Promise<boolean> {
    const noteDoc = await this._notes.findOne({
      _id: notesId,
      student_id: studentId,
    });
    if (!noteDoc?.notes || index < 0 || index >= noteDoc.notes.length) {
      return false;
    }

    noteDoc.notes.splice(index, 1);
    await noteDoc.save();
    return true;
  }
}
