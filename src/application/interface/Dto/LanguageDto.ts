export interface CreateLanguageRequestDTO {
  name: string;
}

export interface UpdateLanguageRequestDTO {
  name?: string;
}

// Response DTO
export interface LanguageResponseDTO {
  id?: string;
  name: string;
  isBlocked: boolean;
}
