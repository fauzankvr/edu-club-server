import express from "express";
import LanguageController from "../controllers/language.controller";
import { LanguageRepository } from "../../infrastructure/repositories/language.repository";
import { LanguageUseCase } from "../../application/useCase/language.usecase";
import { LanguageModel } from "../../infrastructure/database/models/LanguageModel";


const languageRepo = new LanguageRepository(LanguageModel);
const languageUseCase = new LanguageUseCase(languageRepo);
const controller = new LanguageController(languageUseCase);
const router = express.Router();

router.post("/add", (req, res) => {
  controller.createLanguage(req, res);
});
router.get("/getAll", (req, res) => {
  controller.getAllLanguages(req, res);
}); 
router.get("/getNotBlocked", (req, res) => {
  controller.getNotBlockedLanguages(req, res);
});
router.patch("/update/:id", (req, res) => {
    controller.updateLanguage(req, res);
});
router.patch("/toggleBlock/:id", (req, res) => {
  controller.toggleLanguageBlockStatus(req,res)
})
export default router;