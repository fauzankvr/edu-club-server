import { ICategory } from "./ICategory";

export interface ICategoryRepository {
    create(categoryData: ICategory): Promise<ICategory>;
    getAll(): Promise<ICategory[]>;
    update(id: string): Promise<ICategory>;
}
