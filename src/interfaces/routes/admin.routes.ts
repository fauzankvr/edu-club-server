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
router.post("/login", (req, res) => {
  adminController.loginAdmin(req, res);
});
router.post("/logout", (req, res) => {
  adminController.logOutAdmin(req, res);
});

/* -------------------- STUDENTS -------------------- */
router.get("/findAllStudent", verifyAdmin, (req, res) => {
  adminController.findAllStudent(req, res);
});
router.patch("/blockStudent", verifyAdmin, (req, res) => {
  adminController.blockStudent(req, res);
});

/* -------------------- TEACHERS -------------------- */
router.get("/findAllTeachers", verifyAdmin, (req, res) => {
  adminController.findAllTeachers(req, res);
});
router.patch("/blockTeacher", verifyAdmin, (req, res) => {
  adminController.blockInstructor(req, res);
});
router.patch("/teachers/approve", verifyAdmin, (req, res) => {
  adminController.approveInstructor(req, res);
});

/* -------------------- DASHBOARD / REPORT -------------------- */
router.get("/dashboard", verifyAdmin, (req, res) => {
  adminController.getDashboardData(req, res);
});
router.get("/report", verifyAdmin, (req, res) => {
  adminController.downloadReport(req, res);
});

/* -------------------- PAYOUTS -------------------- */
router.get("/payouts", verifyAdmin, (req, res) => {
  adminController.getPayouts(req, res);
});
router.post("/payout/:id", verifyAdmin, (req, res) => {
  adminController.updatePayout(req, res);
});

/* -------------------- PLANS -------------------- */
router.post("/plans", verifyAdmin, (req, res) => {
  planController.createPlan(req, res);
});
router.get("/plans", verifyAdmin, (req, res) => {
  planController.getPlans(req, res);
});
router.put("/plans/:id", verifyAdmin, (req, res) => {
  planController.updatePlan(req, res);
});
router.patch("/plans/:id/toggle", verifyAdmin, (req, res) => {
  planController.blockPlan(req, res);
});
router.get("/plan/:id", verifyAdmin, (req, res) => {
  planController.getPlan(req, res);
});

/* -------------------- COURSES -------------------- */
router.get("/courses", verifyAdmin, (req, res) => {
  courseController.getAllCoursesAdmin(req, res);
});
router.patch("/course/:courseId/block", verifyAdmin, (req, res) => {
  courseController.blockCourse(req, res);
});

/* -------------------- CATEGORY -------------------- */
router.post("/category", verifyAdmin, (req, res) => {
  categoryController.createCategory(req, res);
});
router.get("/category", verifyAdmin, (req, res) => {
  categoryController.getAllCategories(req, res);
});

router.patch("/category/update/:id", verifyAdmin, (req, res) => {
  categoryController.updateCategory(req, res);
});
router.patch("/category/:id/block", verifyAdmin, (req, res) => {
  categoryController.toggleCategoryBlockStatus(req, res);
});

/* -------------------- LANGUAGE -------------------- */
router.post("/language", verifyAdmin, (req, res) => {
  languageController.createLanguage(req, res);
});
router.get("/language", verifyAdmin, (req, res) => {
  languageController.getAllLanguages(req, res);
});
// router.get("/language/getNotBlocked", verifyAdmin, (req, res) => {
//   languageController.getNotBlockedLanguages(req, res);
// });
router.patch("/language/update/:id", verifyAdmin, (req, res) => {
  languageController.updateLanguage(req, res);
});
router.patch("/language/:id/block", verifyAdmin, (req, res) => {
  languageController.toggleLanguageBlockStatus(req, res);
});

export default router;
