import { IBaseRepo } from "./IBaseRepo";
import { ILanguage } from "../../infrastructure/database/models/LanguageModel";
import { UpdateLanguage } from "./Dto/LanguageDto";

export interface ILanguageRepo extends IBaseRepo<ILanguage> {
  update(id: string, data: UpdateLanguage): Promise<ILanguage | null>;
  findNotBlocked(): Promise<ILanguage[]>
}
