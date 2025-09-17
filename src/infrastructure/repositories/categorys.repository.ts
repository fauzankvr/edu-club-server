import { Model } from "mongoose";
import { ICategoryRepository } from "../../application/interface/ICategoryRepository";
import { ICategory } from "../database/models/CategoryModel";
import { BaseRepository } from "./base.repository";
import { CategoryEntity } from "../../domain/entities/Category";

export class CategoryRepository
  extends BaseRepository<ICategory, CategoryEntity>
  implements ICategoryRepository
{
  constructor(private _categoryModel: Model<ICategory>) {
    super(_categoryModel, CategoryRepository.toEntity);
  }

  // DB → Entity
  private static toEntity(category: ICategory): CategoryEntity {
    return new CategoryEntity(
      category.name,
      category._id.toString(),
      category.isBlocked
    );
  }

  // Entity → DB
  private static toDatabase(entity: CategoryEntity): Partial<ICategory> {
    return {
      name: entity.name,
      isBlocked: entity.isBlocked,
    };
  }

  async create(entity: CategoryEntity): Promise<CategoryEntity> {
    const data = CategoryRepository.toDatabase(entity);
    const doc = await this._categoryModel.create(data);
    return CategoryRepository.toEntity(doc);
  }

  async find(limit: number, skip: number): Promise<CategoryEntity[]> {
    const docs = await this._categoryModel
      .find()
      .limit(limit)
      .skip(skip)
    return docs.map(CategoryRepository.toEntity);
  }

  async count(): Promise<number> {
    return this._categoryModel.countDocuments();
  }

  async update(
    id: string,
    entity: CategoryEntity
  ): Promise<CategoryEntity | null> {
    const data = CategoryRepository.toDatabase(entity);
    const doc = await this._categoryModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return doc ? CategoryRepository.toEntity(doc) : null;
  }

  async findNotBlocked(): Promise<CategoryEntity[]> {
    const docs = await this._categoryModel.find({ isBlocked: false });
    return docs.map(CategoryRepository.toEntity);
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    const doc = await this._categoryModel.findOne({ name });
    return doc ? CategoryRepository.toEntity(doc) : null;
  }
}
