import { CreateLanguageRequestDTO, LanguageResponseDTO, UpdateLanguageRequestDTO } from "./Dto/LanguageDto";

export interface ILanguageUseCase {
  getTotalLanguagesCount(): Promise<number>;
  createLanguage(
    requestDTO: CreateLanguageRequestDTO
  ): Promise<LanguageResponseDTO>;
  getAllLanguages(limit: number, skip: number): Promise<LanguageResponseDTO[]>;
  getNotBlockedLanguages(): Promise<LanguageResponseDTO[]>;
  updateLanguage(
    id: string,
    requestDTO: UpdateLanguageRequestDTO
  ): Promise<LanguageResponseDTO>;
  toggleBlockStatus(id: string): Promise<LanguageResponseDTO>;
}
