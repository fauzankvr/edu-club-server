
import express from "express";
import { CategoryRepository } from "../../infrastructure/repositories/category.repository"; 
import { CategoryUseCase } from "../../application/useCase/Category.usercase";
import CategoryController from "../controllers/category.controller";
import { CategoryModel } from "../../infrastructure/database/models/CategoryModel";


const categoryRepo = new CategoryRepository(CategoryModel);
const categoryUseCase = new CategoryUseCase(categoryRepo);
const controller = new CategoryController(categoryUseCase);
const router = express.Router();

router.post("/add", (req, res) => {
  controller.createCategory(req, res);
});
router.get("/getAll", (req, res) => {
  controller.getAllCategories(req, res);
});
router.get("/getNotBlocked", (req, res) => {
  controller.getNotBlockedCategories(req, res);
})
router.patch("/update/:id", (req, res) => {
    controller.updateCategory(req, res);
});
router.patch("/toggleblock/:id", (req, res)=> {
  controller.toggleCategoryBlockStatus(req,res)
})
export default router;