import { IBaseRepo } from "./IBaseRepository";
import { ILanguage } from "../../infrastructure/database/models/LanguageModel";
import { UpdateLanguageDto } from "./Dto/LanguageDto";

export interface ILanguageRepository extends IBaseRepo<ILanguage> {
  update(id: string, data: UpdateLanguageDto): Promise<ILanguage | null>;
  findNotBlocked(): Promise<ILanguage[]>;
  findAllLanguages(limit: number, skip: number): Promise<ILanguage[]>;
  countDocuments(): Promise<number>;
}
