import { ILanguage } from "../../application/interface/ILanguage";
import { ILanguageRepository } from "../../application/interface/ILanguageRepository";
import { LanguageModel } from "../database/models/LanguageModel";

export class LanguageRepository implements ILanguageRepository {
  async create(languageData: ILanguage): Promise<ILanguage> {
    const result = await LanguageModel.create(languageData);
    return result as ILanguage;
    }
    async getAll(): Promise<ILanguage[]> {
        const result = await LanguageModel.find();
        return result as ILanguage[];
    }
    async update(id: string): Promise<ILanguage> {
        const language = await LanguageModel.findById(id);

        if (!language) {
          throw new Error("Language not found");
        }

        // Toggle the isBlocked field
        language.isBlocked = !language.isBlocked;
        await language.save();

        return language as ILanguage;
    }
    
}
