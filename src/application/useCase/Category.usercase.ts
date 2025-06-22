import { ICategoryRepository } from "../interface/ICategoryRepo";
import { ICategory } from "../../infrastructure/database/models/CategoryModel";

export class CategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async createCategory(categoryData: ICategory): Promise<ICategory> {
    const category = await this.categoryRepository.findByName(
      categoryData.name
    );
    if (category) throw new Error("Category already exists");
    return this.categoryRepository.create(categoryData);
  }

  async getAllCategories(): Promise<ICategory[]> {
    return this.categoryRepository.findAll();
  }
  async getNotBlockedCategories(): Promise<ICategory[]> {
    return this.categoryRepository.findNotBlocked();
  }

  async toggleBlockStatus(id: string): Promise<ICategory> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new Error("Category not found");

    const updatedCategory = await this.categoryRepository.update(id, {
      isBlocked: !category.isBlocked,
    });
    if (!updatedCategory) throw new Error("Category not found");
    return updatedCategory;
  }

  async updateCategory(
    id: string,
    categoryData: Partial<ICategory>
  ): Promise<ICategory | null> {
    if(!categoryData.name) throw new Error("Category name is required");
    const data: Partial<ICategory> = {
      name: categoryData.name,
    };
    const category = await this.categoryRepository.findByName(
      categoryData.name
    );
    if (category) throw new Error("Category already exists");
    const updateData = this.categoryRepository.update(id, data);
    if (!updateData) throw new Error("Category not found");
    return updateData;
  }
}
