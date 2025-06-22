import { Model, Types } from "mongoose";
import { IBaseRepo } from "../../application/interface/IBaseRepo";

export class BaseRepository<T> implements IBaseRepo<T> {
  constructor(private model: Model<T>) {}

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findById(id: string): Promise<T | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model.findById(id).exec();
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async deleteById(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this.model.findByIdAndDelete(id).exec();
  }
}