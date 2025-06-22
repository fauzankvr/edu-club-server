import { ICategory } from "../../infrastructure/database/models/CategoryModel";
import { UpdateCategoryDTO } from "./Dto/CatetoryDto";
import { IBaseRepo } from "./IBaseRepo";


export interface ICategoryRepository extends IBaseRepo<ICategory> {
  update(id: string, data: UpdateCategoryDTO): Promise<ICategory | null>;
  findNotBlocked(): Promise<ICategory[]>
  findByName(name:string): Promise<ICategory|null>
}
