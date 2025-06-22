
import { Model } from "mongoose";
import { ICategoryRepository } from "../../application/interface/ICategoryRepo";
import { ICategory } from "../database/models/CategoryModel";
import { BaseRepository } from "./base.repository"; 


export class CategoryRepository
  extends BaseRepository<ICategory>
  implements ICategoryRepository
{
  constructor(private CategoryModel: Model<ICategory>) {
    super(CategoryModel);
  }
  async update(id: string, data: ICategory): Promise<ICategory | null> {
    return await this.CategoryModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }
  async findNotBlocked(): Promise<ICategory[]> {
    return await this.CategoryModel.find({isBlocked:false})
  }
  async findByName(name:string):Promise<ICategory|null>{
    return await this.CategoryModel.findOne({name})
  }
}
