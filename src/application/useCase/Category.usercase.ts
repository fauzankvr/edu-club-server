import { ICategoryRepository } from "../interface/ICategoryRepository";
import { CategoryEntity } from "../../domain/entities/Category"; 
import { ICategoryUseCase } from "../interface/ICategoryUseCase";
import { CATEGORY_ALREADY_EXISTS, CATEGORY_NAME_REQUIRED, CATEGORY_NOT_FOUND } from "../../interfaces/constants/ErrorMessge";

export class CategoryUseCase implements ICategoryUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async createCategory(name: string): Promise<CategoryEntity> {
    const existing = await this.categoryRepo.findByName(
      name.trim().replace(/\s+/g, " ")
    );
    if (existing) throw new Error(CATEGORY_ALREADY_EXISTS);

    const category = new CategoryEntity(name.trim().replace(/\s+/g, " "));
    return this.categoryRepo.create(category);
  }

  async getAllCategories(
    limit: number,
    skip: number
  ): Promise<CategoryEntity[]> {
    return this.categoryRepo.find(limit, skip);
  }

  async getCategoryCount(): Promise<number> {
    return this.categoryRepo.count();
  }

  async getNotBlockedCategories(): Promise<CategoryEntity[]> {
    return this.categoryRepo.findNotBlocked();
  }

  async toggleBlockStatus(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new Error(CATEGORY_NOT_FOUND);
    const updated = await this.categoryRepo.update(id, {
      isBlocked: !category.isBlocked,
    });
    if (!updated) throw new Error(CATEGORY_NOT_FOUND);

    return updated;
  }

  async updateCategory(id: string, name: string): Promise<CategoryEntity> {
    if (!name) throw new Error(CATEGORY_NAME_REQUIRED);

    const existing = await this.categoryRepo.findByName(name);
    if (existing) throw new Error(CATEGORY_ALREADY_EXISTS);

    const category = new CategoryEntity(name);
    const updated = await this.categoryRepo.update(id, category);
    if (!updated) throw new Error(CATEGORY_NOT_FOUND);

    return updated;
  }
}
