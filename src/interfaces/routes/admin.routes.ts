import express from "express";
import { verifyAdmin } from "../middlewares/ExtractAdmin";
import {
  adminController,
  courseController,
  planController,
  categoryController,
  languageController,
} from "./Dependencyinjector";

const router = express.Router();

/* -------------------- ADMIN AUTH -------------------- */
router.post("/auth/login", (req, res) => {
  adminController.loginAdmin(req, res);
});
router.post("/auth/logout", (req, res) => {
  adminController.logOutAdmin(req, res);
});

/* -------------------- STUDENTS -------------------- */
router.get("/students", verifyAdmin, (req, res) => {
  adminController.findAllStudent(req, res);
});
router.patch("/students/:id/block", verifyAdmin, (req, res) => {
  adminController.blockStudent(req, res);
});

/* -------------------- INSTRUCTORS -------------------- */
router.get("/instructors", verifyAdmin, (req, res) => {
  adminController.findAllTeachers(req, res);
});
router.patch("/instructors/:id/block", verifyAdmin, (req, res) => {
  adminController.blockInstructor(req, res);
});
router.patch("/instructors/:id/approve", verifyAdmin, (req, res) => {
  adminController.approveInstructor(req, res);
});

/* -------------------- DASHBOARD / REPORT -------------------- */
router.get("/dashboard", verifyAdmin, (req, res) => {
  adminController.getDashboardData(req, res);
});
router.get("/reports", verifyAdmin, (req, res) => {
  adminController.downloadReport(req, res);
});

/* -------------------- PAYOUTS -------------------- */
router.get("/payouts", verifyAdmin, (req, res) => {
  adminController.getPayouts(req, res);
});
router.patch("/payouts/:id", verifyAdmin, (req, res) => {
  adminController.updatePayout(req, res);
});

/* -------------------- PLANS -------------------- */
router.post("/plans", verifyAdmin, (req, res) => {
  planController.createPlan(req, res);
});
router.get("/plans", verifyAdmin, (req, res) => {
  planController.getPlans(req, res);
});
router.get("/plans/:id", verifyAdmin, (req, res) => {
  planController.getPlan(req, res);
});
router.put("/plans/:id", verifyAdmin, (req, res) => {
  planController.updatePlan(req, res);
});
router.patch("/plans/:id/toggle", verifyAdmin, (req, res) => {
  planController.blockPlan(req, res);
});

/* -------------------- COURSES -------------------- */
router.get("/courses", verifyAdmin, (req, res) => {
  courseController.getAllCoursesAdmin(req, res);
});
router.patch("/courses/:courseId/block", verifyAdmin, (req, res) => {
  courseController.blockCourse(req, res);
});

/* -------------------- CATEGORY -------------------- */
router.post("/categories", verifyAdmin, (req, res) => {
  categoryController.createCategory(req, res);
});
router.get("/categories", verifyAdmin, (req, res) => {
  categoryController.getAllCategories(req, res);
});
router.patch("/categories/:id", verifyAdmin, (req, res) => {
  categoryController.updateCategory(req, res);
});
router.patch("/categories/:id/block", verifyAdmin, (req, res) => {
  categoryController.toggleCategoryBlockStatus(req, res);
});

/* -------------------- LANGUAGE -------------------- */
router.post("/languages", verifyAdmin, (req, res) => {
  languageController.createLanguage(req, res);
});
router.get("/languages", verifyAdmin, (req, res) => {
  languageController.getAllLanguages(req, res);
});
router.patch("/languages/:id", verifyAdmin, (req, res) => {
  languageController.updateLanguage(req, res);
});
router.patch("/languages/:id/block", verifyAdmin, (req, res) => {
  languageController.toggleLanguageBlockStatus(req, res);
});

export default router;
