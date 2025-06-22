import { IBaseRepo } from "./IBaseRepo";
import { ILanguage } from "../../infrastructure/database/models/LanguageModel";
import { UpdateLanguageDto } from "./Dto/LanguageDto";

export interface ILanguageRepo extends IBaseRepo<ILanguage> {
  update(id: string, data: UpdateLanguageDto): Promise<ILanguage | null>;
  findNotBlocked(): Promise<ILanguage[]>;
}
