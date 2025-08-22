
import { Model } from "mongoose";
import { ICategoryRepository } from "../../application/interface/ICategoryRepository";
import { ICategory } from "../database/models/CategoryModel";
import { BaseRepository } from "./base.repository"; 

// class for category
export class CategoryRepository
  extends BaseRepository<ICategory>
  implements ICategoryRepository
{
  constructor(private _categoryModel: Model<ICategory>) {
    super(_categoryModel);
  }
  findAllCategories(limit: number, skip: number): Promise<ICategory[]> {
    return this._categoryModel.find().limit(limit).skip(skip).exec();
  }
  async count(): Promise<number> {
    return this._categoryModel.countDocuments();
  }
  async update(id: string, data: ICategory): Promise<ICategory | null> {
    return await this._categoryModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }
  async findNotBlocked(): Promise<ICategory[]> {
    return await this._categoryModel.find({isBlocked:false})
  }
  async findByName(name:string):Promise<ICategory|null>{
    return await this._categoryModel.findOne({name})
  }

}
