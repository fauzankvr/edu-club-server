import express from "express";
import { languageController } from "./Dependencyinjector";

const router = express.Router();

router.post("/add", (req, res) => {
  languageController.createLanguage(req, res);
});
router.get("/getAll", (req, res) => {
  languageController.getAllLanguages(req, res);
});
router.get("/getNotBlocked", (req, res) => {
  languageController.getNotBlockedLanguages(req, res);
});
router.patch("/update/:id", (req, res) => {
  languageController.updateLanguage(req, res);
});
router.patch("/toggleBlock/:id", (req, res) => {
  languageController.toggleLanguageBlockStatus(req, res);
});
export default router;
