import { CategoryEntity } from "../../domain/entities/Category";
import { UpdateCategoryDTO } from "./Dto/CatetoryDto";
import { IBaseRepo } from "./IBaseRepository";


export interface ICategoryRepository extends IBaseRepo<CategoryEntity> {
  find(limit: number, skip: number): Promise<CategoryEntity[]>;
  update(id: string, data: UpdateCategoryDTO): Promise<CategoryEntity | null>;
  findNotBlocked(): Promise<CategoryEntity[]>;
  findByName(name: string): Promise<CategoryEntity | null>;
  count(): Promise<number>;
}
