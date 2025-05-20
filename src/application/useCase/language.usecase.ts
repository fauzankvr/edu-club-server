import { LanguageRepository } from "../../infrastructure/repositories/language.repository";


export class LanguageUseCase {
    constructor(private languageRepository: LanguageRepository) { }
    async create(languageData: any) {
        try {
            const result = await this.languageRepository.create(languageData);
            return result;
        } catch (error) {
            throw new Error("Error creating language: " + error);
        }
    }
    async getAll() {
        try {
            const result = await this.languageRepository.getAll();
            return result;
        } catch (error) {
            throw new Error("Error fetching languages: " + error);
        }
    }
    async update(id: string) {
        try {
            const result = await this.languageRepository.update(id);
            return result;
        } catch (error) {
            throw new Error("Error updating language: " + error);
        }
    }
}