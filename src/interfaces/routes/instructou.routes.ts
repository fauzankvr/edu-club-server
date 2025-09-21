import express from "express";
import { verifyInstructor } from "../middlewares/ExtractInstructor";
import { upload } from "../../infrastructure/services/multer/multerConfig";
import {
  categoryController,
  chatController,
  courseController,
  instructorController,
  languageController,
  notificationController,
  orderController,
} from "./Dependencyinjector";

const router = express.Router();

// Auth
router.post(
  "/signup",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "certificates", maxCount: 5 },
  ]),
  (req, res) => {
    instructorController.signupInstructor(req, res);
  }
);

router.post("/send-otp", (req, res) => {
  instructorController.sendOtp(req, res);
});
router.post("/verify-otp", (req, res) => {
  instructorController.verifyOtp(req, res);
});
router.post("/resend-otp", (req, res) => {
  instructorController.resendOtp(req, res);
});
router.post("/reset-password", (req, res) => {
  instructorController.resetPassword(req, res);
});
router.post("/change-password", verifyInstructor, (req, res) => {
  instructorController.chagePassword(req, res);
});

router.post("/login", (req, res) => {
  instructorController.loginInstructor(req, res);
});
router.post("/logout", (req, res) => {
  instructorController.logOutInstructor(req, res);
});

// Profile
router.get("/profile", verifyInstructor, async (req, res) => {
  await instructorController.getProfile(req, res);
});
router.put(
  "/profile",
  verifyInstructor,
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  async (req, res) => {
    await instructorController.updateProfile(req, res);
  }
);

// Courses
router.post(
  "/courses",
  verifyInstructor,
  upload.single("courseImgeId"),
  (req, res) => {
    courseController.createCourse(req, res);
  }
);

router.post(
  "/courses/:courseId/curriculum",
  verifyInstructor,
  upload.fields([
    { name: "videos", maxCount: 100 },
    { name: "pdfs", maxCount: 100 },
  ]),
  (req, res) => {
    courseController.uploadCurriculum(req, res);
  }
);

router.get("/courses/:courseId", (req, res) => {
  courseController.getCourseById(req, res);
});
router.get("/courses/:courseId/curriculum", (req, res) => {
  courseController.getCurriculum(req, res);
});

router.put(
  "/curriculum/:id",
  verifyInstructor,
  upload.fields([
    { name: "videos", maxCount: 100 },
    { name: "pdfs", maxCount: 100 },
  ]),
  (req, res) => {
    courseController.updateCurriculum(req, res);
  }
);

router.put("/courses/:id", upload.single("courseImgeId"), (req, res) => {
  courseController.updateCourse(req, res);
});

router.get("/categories", (req, res) => {
  categoryController.getNotBlockedCategories(req, res);
});
router.get("/languages", (req, res) => {
  languageController.getNotBlockedLanguages(req, res);
});

router.get("/courses", verifyInstructor, (req, res) => {
  courseController.getInstructorAllCourses(req, res);
});

// Chats
router.get("/chats", verifyInstructor, (req, res) => {
  chatController.getAllChats(req, res);
});
router.get("/chats/:id/messages", verifyInstructor, (req, res) => {
  chatController.getAllMessage(req, res);
});
router.post("/chats/messages", verifyInstructor, (req, res) => {
  chatController.postMessage(req, res);
});
router.get(
  "/chats/:instructorId/call-history",
  verifyInstructor,
  (req, res) => {
    chatController.getCallHistory(req, res);
  }
);

// Wallet / Payments
router.get("/wallet", verifyInstructor, (req, res) => {
  orderController.getPendingPayment(req, res);
});
router.patch("/wallet/paypal-email", verifyInstructor, (req, res) => {
  instructorController.updatePaypalEmail(req, res);
});
router.post("/wallet/request-payout", verifyInstructor, (req, res) => {
  orderController.requestPayout(req, res);
});

// Dashboard
router.get("/dashboard", verifyInstructor, (req, res) => {
  orderController.getDashboardData(req, res);
});

// Notifications
router.post("/notifications", verifyInstructor, async (req, res) => {
  await notificationController.createNotification(req, res);
});
router.get("/notifications", verifyInstructor, async (req, res) => {
  await notificationController.getAllNotification(req, res);
});

export default router;
