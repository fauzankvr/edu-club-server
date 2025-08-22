import { ILanguage } from "../../infrastructure/database/models/LanguageModel";
import { ILanguageRepository } from "../interface/ILanguageRepository";
import { ILanguageUseCase } from "../interface/ILanguateUseCase";

export class LanguageUseCase implements ILanguageUseCase {
  constructor(private readonly _languageRepository: ILanguageRepository) {}
  async getTotalLanguagesCount(): Promise<number> {
    return this._languageRepository.countDocuments();
  }
  async createLanguage(languageData: ILanguage): Promise<ILanguage> {
    return this._languageRepository.create(languageData);
  }
  async getAllLanguages(limit: number, skip: number): Promise<ILanguage[]> {
    return this._languageRepository.findAllLanguages(limit, skip);
  }

  async getNotBlockedLanguages(): Promise<ILanguage[]> {
    return this._languageRepository.findNotBlocked();
  }

  async updateLanguage(
    id: string,
    data: Partial<ILanguage>
  ): Promise<ILanguage> {
    const updatedLanguage = await this._languageRepository.update(id, data);
    if (!updatedLanguage) {
      throw new Error("Language not found");
    }
    return updatedLanguage;
  }

  async toggleBlockStatus(id: string): Promise<ILanguage> {
    const language = await this._languageRepository.findById(id);
    if (!language) {
      throw new Error("Language not found");
    }

    const updatedLanguage = await this._languageRepository.update(id, {
      isBlocked: !language.isBlocked,
    });

    if (!updatedLanguage) {
      throw new Error("Failed to toggle block status");
    }

    return updatedLanguage;
  }
}
