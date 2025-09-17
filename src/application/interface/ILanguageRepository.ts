import { IBaseRepo } from "./IBaseRepository";
import { LanguageEntity } from "../../domain/entities/Languate";

export interface ILanguageRepository extends IBaseRepo<LanguageEntity> {
  // update(id: string, data: UpdateLanguageDto): Promise<LanguageEntity | null>;
  findByName: (name: string) => Promise<LanguageEntity | null>;
  findNotBlocked(): Promise<LanguageEntity[]>;
  findAllLanguages(limit: number, skip: number): Promise<LanguageEntity[]>;
  countDocuments(): Promise<number>;
}
