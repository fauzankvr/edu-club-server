import { ILanguage } from "../../infrastructure/database/models/LanguageModel";

export interface ILanguageUseCase {
  createLanguage(languageData: ILanguage): Promise<ILanguage>;
  getAllLanguages(limit: number, skip: number): Promise<ILanguage[]>;
  getNotBlockedLanguages(): Promise<ILanguage[]>;
  updateLanguage(id: string, data: Partial<ILanguage>): Promise<ILanguage>;
  toggleBlockStatus(id: string): Promise<ILanguage>;
  getTotalLanguagesCount(): Promise<number>;
}
