import { LanguageEntity } from "../../domain/entities/Languate";
import { CreateLanguageRequestDTO, LanguageResponseDTO, UpdateLanguageRequestDTO } from "../interface/Dto/LanguageDto";
import { ILanguageRepository } from "../interface/ILanguageRepository";
import { ILanguageUseCase } from "../interface/ILanguateUseCase";



export class LanguageUseCase implements ILanguageUseCase {
  constructor(private readonly _languageRepository: ILanguageRepository) {}

  async getTotalLanguagesCount(): Promise<number> {
    return this._languageRepository.countDocuments();
  }

  async createLanguage(
    requestDTO: CreateLanguageRequestDTO
  ): Promise<LanguageResponseDTO> {
    const existingLanguage = await this._languageRepository.findByName(
      requestDTO.name.trim().replace(/\s+/g," ")
    )
    if (existingLanguage) {
       throw new Error("Language is alredy exist");
    }

    const language = new LanguageEntity(
      requestDTO.name.trim().replace(/\s+/g, " "),
      false
    );

    const savedLanguage = await this._languageRepository.create(language);
    return this.mapToResponseDTO(savedLanguage);
  }

  async getAllLanguages(
    limit: number,
    skip: number
  ): Promise<LanguageResponseDTO[]> {
    const languages = await this._languageRepository.findAllLanguages(
      limit,
      skip
    );
    return languages.map((lang) => this.mapToResponseDTO(lang));
  }

  async getNotBlockedLanguages(): Promise<LanguageResponseDTO[]> {
    const languages = await this._languageRepository.findNotBlocked();
    return languages.map((lang) => this.mapToResponseDTO(lang));
  }

  async updateLanguage(
    id: string,
    requestDTO: UpdateLanguageRequestDTO
  ): Promise<LanguageResponseDTO> {
    const existingLanguage = await this._languageRepository.findById(id);
    if (!existingLanguage) {
      throw new Error("Language not found");
    }

    // Create updated entity
    const updatedLanguage = new LanguageEntity(
      requestDTO.name ?? existingLanguage.name,
      existingLanguage.isBlocked,
      existingLanguage.id
    );

    const result = await this._languageRepository.updateById(
      id,
      updatedLanguage
    );
    if (!result) {
      throw new Error("Failed to update language");
    }

    return this.mapToResponseDTO(result);
  }

  async toggleBlockStatus(id: string): Promise<LanguageResponseDTO> {
    const language = await this._languageRepository.findById(id);
    if (!language) {
      throw new Error("Language not found");
    }

    // Create new entity with toggled status
    const toggledLanguage = new LanguageEntity(
      language.name,
      !language.isBlocked,
      language.id,
    );

    const updatedLanguage = await this._languageRepository.updateById(
      id,
      toggledLanguage
    );
    if (!updatedLanguage) {
      throw new Error("Failed to toggle block status");
    }

    return this.mapToResponseDTO(updatedLanguage);
  }

  // Private mapping method
  private mapToResponseDTO(language: LanguageEntity): LanguageResponseDTO {
    return {
      id: language.id,
      name: language.name,
      isBlocked: language.isBlocked,
    };
  }
}
