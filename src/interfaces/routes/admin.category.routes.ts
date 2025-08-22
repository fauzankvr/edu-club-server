import express from "express";
import { categoryController } from "./Dependencyinjector";

const router = express.Router();

router.post("/add", (req, res) => {
  categoryController.createCategory(req, res);
});
router.get("/getAll", (req, res) => {
  categoryController.getAllCategories(req, res);
});
router.get("/getNotBlocked", (req, res) => {
  categoryController.getNotBlockedCategories(req, res);
});
router.patch("/update/:id", (req, res) => {
  categoryController.updateCategory(req, res);
});
router.patch("/toggleblock/:id", (req, res) => {
  categoryController.toggleCategoryBlockStatus(req, res);
});
export default router;
