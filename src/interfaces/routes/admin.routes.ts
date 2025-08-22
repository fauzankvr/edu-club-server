import express from "express";
import { verifyAdmin } from "../middlewares/ExtractAdmin";
import {
  adminController,
  courseController,
  planController,
} from "./Dependencyinjector";

const router = express.Router();

router.post("/login", (req, res) => {
  adminController.loginAdmin(req, res);
});
router.get("/findAllStudent", verifyAdmin, (req, res) => {
  adminController.findAllStudent(req, res);
});
router.get("/findAllTeachers", verifyAdmin, (req, res) => {
  adminController.findAllTeachers(req, res);
});
router.patch("/blockTeacher", (req, res) => {
  adminController.blockInstructor(req, res);
});
router.patch("/teachers/approve", (req, res) => {
  adminController.approveInstructor(req, res);
});
router.patch("/blockStudent", (req, res) => {
  adminController.blockStudent(req, res);
});

router.post("/logout", (req, res) => {
  adminController.logOutAdmin(req, res);
});

router.get("/payouts", (req, res) => {
  adminController.getPayouts(req, res);
});
router.post("/payout/:id", verifyAdmin, (req, res) => {
  adminController.updatePayout(req, res);
});

router.get("/dashboard", (req, res) => {
  adminController.getDashboardData(req, res);
});

router.get("/report", (req, res) => {
  adminController.downloadReport(req, res);
});

router.post("/plans", (req, res) => {
  planController.createPlan(req, res);
});
router.get("/plans", (req, res) => {
  planController.getPlans(req, res);
});
router.put("/plans/:id", (req, res) => {
  planController.updatePlan(req, res);
});
router.patch("/plans/:id/toggle", (req, res) => {
  planController.blockPlan(req, res);
});
router.get("/plan/:id", (req, res) => {
  planController.getPlan(req, res);
});

router.get("/courses", verifyAdmin, (req, res) => {
  courseController.getAllCoursesAdmin(req, res);
});
router.patch("/course/:courseId/block", verifyAdmin, (req, res) => {
  courseController.blockCourse(req, res);
});

export default router;
