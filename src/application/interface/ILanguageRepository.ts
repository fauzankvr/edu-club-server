import { ILanguage } from "./ILanguage";

export interface ILanguageRepository {
    create(languageData: ILanguage): Promise<ILanguage>;
    getAll(): Promise<ILanguage[]>;
    update(id: string): Promise<ILanguage>;
}
