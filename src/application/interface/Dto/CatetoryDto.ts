export interface UpdateCategoryDTO {
  name?: string;
  isBlocked?: boolean;
}

export interface CategoryDTO {
  name: string;
  isBlocked?: boolean;
}

export interface CreateCategoryDTO {
  name: string;
}

export interface CategoryResponseDTO {
  id: string;
  name: string;
  isBlocked: boolean;
}


