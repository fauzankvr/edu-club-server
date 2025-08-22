import { ICategoryRepository } from "../interface/ICategoryRepository";
import { ICategory } from "../../infrastructure/database/models/CategoryModel";
import { ICategoryUseCase } from "../interface/ICategoryUseCase";

export class CategoryUseCase implements ICategoryUseCase {
  constructor(private readonly _categoryRepository: ICategoryRepository) {}

  async createCategory(categoryData: ICategory): Promise<ICategory> {
    const category = await this._categoryRepository.findByName(
      categoryData.name
    );
    if (category) throw new Error("Category already exists");
    return this._categoryRepository.create(categoryData);
  }

  async getAllCategories(limit: number, skip: number): Promise<ICategory[]> {
    return this._categoryRepository.findAllCategories(limit, skip);
  }
  async getCategoryCount(): Promise<number> {
    return this._categoryRepository.count();
  }
  async getNotBlockedCategories(): Promise<ICategory[]> {
    return this._categoryRepository.findNotBlocked();
  }

  async toggleBlockStatus(id: string): Promise<ICategory> {
    const category = await this._categoryRepository.findById(id);
    if (!category) throw new Error("Category not found");

    const updatedCategory = await this._categoryRepository.update(id, {
      isBlocked: !category.isBlocked,
    });
    if (!updatedCategory) throw new Error("Category not found");
    return updatedCategory;
  }

  async updateCategory(
    id: string,
    categoryData: Partial<ICategory>
  ): Promise<ICategory | null> {
    if (!categoryData.name) throw new Error("Category name is required");
    const data: Partial<ICategory> = {
      name: categoryData.name,
    };
    const category = await this._categoryRepository.findByName(
      categoryData.name
    );
    if (category) throw new Error("Category already exists");
    const updateData = this._categoryRepository.update(id, data);
    if (!updateData) throw new Error("Category not found");
    return updateData;
  }
}
