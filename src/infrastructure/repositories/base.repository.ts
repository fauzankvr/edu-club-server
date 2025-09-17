import { Model, Types } from "mongoose";
import { IBaseRepo } from "../../application/interface/IBaseRepository";

export class BaseRepository<DB, Entity> implements IBaseRepo<Entity> {
  constructor(
    private _model: Model<DB>,
    private toEntity: (doc: DB) => Entity
  ) { } 
  
  private entityToDB(data: Partial<Entity>): Partial<DB> {
    const dbData: Partial<DB> = {} as Partial<DB>;
    Object.assign(dbData, data);
    return dbData;
  }

  async findAll(): Promise<Entity[]> {
    const docs = await this._model.find().exec();
    return docs.map(this.toEntity);
  }

  async findById(id: string): Promise<Entity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this._model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async create(data: Partial<Entity>): Promise<Entity> {
    const doc = await this._model.create(data);
    return this.toEntity(doc);
  }

  async updateById(id: string, data: Partial<Entity>): Promise<Entity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // Convert entity fields to DB fields
    const dbUpdate: Partial<DB> = this.entityToDB(data);
    const doc = await this._model
      .findByIdAndUpdate(id, dbUpdate, { new: true })
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  async deleteById(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this._model.findByIdAndDelete(id).exec();
  }
}
