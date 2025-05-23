import express from "express";
import { CategoryRepository } from "../../infrastructure/repositories/Category.repository";
import { CategoryUseCase } from "../../application/useCase/Category.usercase";
import CategoryController from "../controllers/category.controller";


const categoryRepo = new CategoryRepository();
const categoryUseCase = new CategoryUseCase(categoryRepo);
const controller = new CategoryController(categoryUseCase);
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