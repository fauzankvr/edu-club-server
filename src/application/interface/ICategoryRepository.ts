import { ICategory } from "../../infrastructure/database/models/CategoryModel";
import { UpdateCategoryDTO } from "./Dto/CatetoryDto";
import { IBaseRepo } from "./IBaseRepository";


export interface ICategoryRepository extends IBaseRepo<ICategory> {
  findAllCategories(limit: number, skip: number): Promise<ICategory[]>;
  update(id: string, data: UpdateCategoryDTO): Promise<ICategory | null>;
  findNotBlocked(): Promise<ICategory[]>
  findByName(name: string): Promise<ICategory | null>
  count(): Promise<number>;
}
