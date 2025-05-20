import { CategoryRepository } from "../../infrastructure/repositories/Category.repository";



export class CategoryUseCase {
    constructor(private categoryRepository: CategoryRepository) { }
    async create(categoryData: any) {
        try {
            const result = await this.categoryRepository.create(categoryData);
            return result;
        } catch (error) {
            throw new Error("Error creating category: " + error);
        }
    }
    async getAll() {
        try {
            const result = await this.categoryRepository.getAll();
            return result;
        } catch (error) {
            throw new Error("Error fetching categories: " + error);
        }
    }
    async update(id: string) {
        try {
            const result = await this.categoryRepository.update(id);
            return result;
        } catch (error) {
            throw new Error("Error updating language: " + error);
        }
    }
}