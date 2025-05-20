import express from "express";
import LanguageController from "../controllers/language.controller";
import { LanguageRepository } from "../../infrastructure/repositories/language.repository";
import { LanguageUseCase } from "../../application/useCase/language.usecase";


const languageRepo = new LanguageRepository();
const languageUseCase = new LanguageUseCase(languageRepo);
const controller = new LanguageController(languageUseCase);
const router = express.Router();

router.post("/add", (req, res) => {
  controller.create(req, res);
});
router.get("/getAll", (req, res) => {
  controller.getAll(req, res);
}); 
router.patch("/update/:id", (req, res) => {
    controller.update(req, res);
});
export default router;