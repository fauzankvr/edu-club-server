import { Request, Response } from "express";
import { CategoryUseCase } from "../../application/useCase/Category.usercase";


class CategoryController {
  constructor(private categoryUseCase: CategoryUseCase) {}

  async create(req: Request, res: Response) {
    try {
      const categoryData = req.body;
      const result = await this.categoryUseCase.create(categoryData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error});
    }
    }
    
    async getAll(req: Request, res: Response) {
        try {
            const result = await this.categoryUseCase.getAll();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.categoryUseCase.update(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}

export default CategoryController;