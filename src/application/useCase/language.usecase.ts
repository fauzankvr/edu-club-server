import { ILanguage } from "../../infrastructure/database/models/LanguageModel"; 
import { ILanguageRepo } from "../interface/ILanguageRepository";

export class LanguageUseCase {
  constructor(private readonly languageRepository: ILanguageRepo) {}

  async createLanguage(languageData: ILanguage): Promise<ILanguage> {
    return this.languageRepository.create(languageData);
  }

  async getAllLanguages(): Promise<ILanguage[]> {
    return this.languageRepository.findAll();
  }

  async getNotBlockedLanguages(): Promise<ILanguage[]> {
    return this.languageRepository.findNotBlocked();
  }

  async updateLanguage(
    id: string,
    data: Partial<ILanguage>
  ): Promise<ILanguage> {
    const updatedLanguage = await this.languageRepository.update(id, data);
    if (!updatedLanguage) {
      throw new Error("Language not found");
    }
    return updatedLanguage;
  }

  async toggleBlockStatus(id: string): Promise<ILanguage> {
    const language = await this.languageRepository.findById(id);
    if (!language) {
      throw new Error("Language not found");
    }

    const updatedLanguage = await this.languageRepository.update(id, {
      isBlocked: !language.isBlocked,
    });

    if (!updatedLanguage) {
      throw new Error("Failed to toggle block status");
    }

    return updatedLanguage;
  }
}
