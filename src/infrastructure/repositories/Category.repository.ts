import { ICategory } from "../../application/interface/ICategory";
import { ICategoryRepository } from "../../application/interface/ICategoryRepo";
import { CategoryModel } from "../database/models/CategoryModel";


export class CategoryRepository implements ICategoryRepository {
  async create(categoryData: ICategory): Promise<ICategory> {
    const result = await CategoryModel.create(categoryData);
    return result as ICategory;
  }
  async getAll(): Promise<ICategory[]> {
    const result = await CategoryModel.find();
    return result as ICategory[];
  }
  async update(id: string): Promise<ICategory> {
    const category = await CategoryModel.findById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    // Toggle the isBlocked field
    category.isBlocked = !category.isBlocked;
    await category.save();

    return category as ICategory;
    }
    
}
