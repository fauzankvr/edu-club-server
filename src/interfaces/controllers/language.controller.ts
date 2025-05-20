import { Request, Response } from "express";
import { LanguageUseCase } from "../../application/useCase/language.usecase";

class LanguageController {
  constructor(private languageUseCase: LanguageUseCase) {}

  async create(req: Request, res: Response) {
    try {
      const languageData = req.body;
      const result = await this.languageUseCase.create(languageData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error});
    }
    }
    
    async getAll(req: Request, res: Response) {
        try {
            const result = await this.languageUseCase.getAll();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.languageUseCase.update(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}

export default LanguageController;