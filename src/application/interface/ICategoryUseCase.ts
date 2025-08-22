import { ICategory } from "../../infrastructure/database/models/CategoryModel";

export interface ICategoryUseCase {
  createCategory(categoryData: ICategory): Promise<ICategory>;
  getAllCategories(limit: number, skip: number,): Promise<ICategory[]>;
  getNotBlockedCategories(): Promise<ICategory[]>;
  toggleBlockStatus(id: string): Promise<ICategory>;
  updateCategory(
    id: string,
    categoryData: Partial<ICategory>
  ): Promise<ICategory | null>;
  getCategoryCount(): Promise<number>;
}
