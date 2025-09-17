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

router.post("/sendOtp", (req, res) => {
  instructorController.sendOtp(req, res);
});
router.post("/verifyOtp", (req, res) => {
  instructorController.verifyOtp(req, res);
});
router.post("/resendOtp", (req, res) => {
  instructorController.resendOtp(req, res);
});
router.post("/resetPassword", (req, res) => {
  instructorController.resetPassword(req, res);
});
router.post("/changePassword", verifyInstructor, (req, res) => {
  instructorController.chagePassword(req, res);
});

router.post("/login", (req, res) => {
  instructorController.loginInstructor(req, res);
});

router.post("/logout", (req, res) => {
  instructorController.logOutInstructor(req, res);
});
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

router.post(
  "/createCourse",
  verifyInstructor,
  upload.single("courseImgeId"),
  (req, res) => {
    courseController.createCourse(req, res);
  }
);

router.post(
  "/uploadCurriculum/:courseId",
  verifyInstructor,
  upload.fields([
    { name: "videos", maxCount: 100 },
    { name: "pdfs", maxCount: 100 },
  ]),
  (req, res) => {
    courseController.uploadCurriculum(req, res);
  }
);

router.get("/getCourse/:courseId", (req, res) => {
  courseController.getCourseById(req, res);
});
router.get("/getCurriculum/:courseId", (req, res) => {
  courseController.getCurriculum(req, res);
});

router.put(
  "/updateCurriculum/:id",
  verifyInstructor,
  upload.fields([
    { name: "videos", maxCount: 100 },
    { name: "pdfs", maxCount: 100 },
  ]),
  (req, res) => {
    courseController.updateCurriculum(req, res);
  }
);
router.post("/update/:id", upload.single("courseImgeId"), (req, res) => {
  courseController.updateCourse(req, res);
});

router.get("/category", (req, res) => {
  categoryController.getNotBlockedCategories(req, res);
});
router.get("/language", (req, res) => {
  languageController.getNotBlockedLanguages(req, res);
});

router.get("/getAllCourses", verifyInstructor, (req, res) => {
  courseController.getInstructorAllCourses(req, res);
});

router.get("/chats", verifyInstructor, (req, res) => {
  chatController.getAllChats(req, res);
});
router.get("/getMessages/:id", verifyInstructor, (req, res) => {
  chatController.getAllMessage(req, res);
});

router.post("/postMessage", verifyInstructor, (req, res) => {
  chatController.postMessage(req, res);
});
router.get("/callhistory/:instructorId", verifyInstructor, (req, res) => {
  chatController.getCallHistory(req, res);
});

router.get("/wallet", verifyInstructor, (req, res) => {
  orderController.getPendingPayment(req, res);
});

router.patch("/updatePaypalEmail", verifyInstructor, (req, res) => {
  instructorController.updatePaypalEmail(req, res);
});

router.post("/requestPayout", verifyInstructor, (req, res) => {
  orderController.requestPayout(req, res);
});

router.get("/dashboard", verifyInstructor, (req, res) => {
  orderController.getDashboardData(req, res);
});

router.post("/createNotification", verifyInstructor, async (req, res) => {
  await notificationController.createNotification(req, res);
});

router.get("/notifications", verifyInstructor, async (req, res) => {
  await notificationController.getAllNotification(req, res);
});

export default router;
