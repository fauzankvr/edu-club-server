import { Model, Types } from "mongoose";
import { IBaseRepo } from "../../application/interface/IBaseRepository";

export class BaseRepository<T> implements IBaseRepo<T> {
  constructor(private _model: Model<T>) {}

  async findAll(): Promise<T[]> {
    return this._model.find().exec();
  }

  async findById(id: string): Promise<T | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this._model.findById(id).exec();
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this._model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    return this._model.create(data);
  }

  async deleteById(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this._model.findByIdAndDelete(id).exec();
  }
}