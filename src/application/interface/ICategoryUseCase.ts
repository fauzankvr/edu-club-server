import { CategoryEntity } from "../../domain/entities/Category"; 
import { CreateCategoryDTO } from "./Dto/CatetoryDto";

export interface ICategoryUseCase {
  createCategory(dto: CreateCategoryDTO): Promise<CategoryEntity>;
  getAllCategories(limit: number, skip: number): Promise<CategoryEntity[]>;
  getNotBlockedCategories(): Promise<CategoryEntity[]>;
  toggleBlockStatus(id: string): Promise<CategoryEntity>;
  updateCategory(id: string, name: string): Promise<CategoryEntity>;
  getCategoryCount(): Promise<number>;
}
