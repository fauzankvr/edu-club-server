import express, { Request, Response } from "express";
import { verifyStudent } from "../middlewares/ExtractUser";
import { upload } from "../../infrastructure/services/multer/multerConfig";

import {
  authController,
  chatController,
  courseController,
  disscussionController,
  notesController,
  notificationController,
  orderController,
  planController,
  reviewController,
  studentController,
} from "./Dependencyinjector";

const router = express.Router();

// Health
router.get("/health", async (req: Request, res: Response) => {
  res.send("<h1>Server is working. Hello World!</h1>");
});

// Auth
router.post("/students/refresh", (req, res) => authController.generateRefreshToken(req, res));
router.post("/students/signup", (req, res) => authController.signupStudent(req, res));
router.post("/students/login", (req, res) => authController.loginStudent(req, res));
router.post("/students/google-login", (req, res) => authController.googleLoginController(req, res));
router.post("/students/logout", (req, res) => authController.logOutStudent(req, res));
router.post("/students/verify-otp", (req, res) => authController.verifyOtp(req, res));
router.post("/students/resend-otp", (req, res) => authController.resendOtp(req, res));
router.post("/students/send-otp", (req, res) => authController.sendOtp(req, res));
router.post("/students/reset-password", (req, res) => authController.resetPassword(req, res));
router.post("/students/forgot-verify-otp", (req, res) => authController.forgotVerifyOtp(req, res));

// Student profile
router.get("/students", verifyStudent, (req, res) => {
  studentController.getStudent(req, res);
});
router.put("/students/profile", verifyStudent, upload.single("profileImage"), async (req, res) => {
  await studentController.updateProfile(req, res);
});
router.get("/students/profile", verifyStudent, async (req, res) => {
  await studentController.getProfile(req, res);
});

// Courses
router.get("/courses", async (req, res) => courseController.getAllCourses(req, res));
router.get("/courses/order/:orderId", async (req, res) => courseController.getCourseByOrderId(req, res));
router.get("/courses/:courseId", async (req, res) => courseController.getCourseById(req, res));
router.get("/courses/enrolled", verifyStudent, async (req, res) => courseController.getEnrolledCourses(req, res));
router.get("/courses/:courseId/curriculum", async (req, res) => courseController.getCurriculum(req, res));
router.get("/students/progress", verifyStudent, async (req, res) => courseController.getAllProgress(req, res));
router.get("/students/:studentId/courses/:courseId/progress", async (req, res) => courseController.getLessonProgress(req, res));
router.patch("/students/progress", async (req, res) => courseController.updateLessonProgress(req, res));
router.get("/courses/full/:orderId", async (req, res) => courseController.getFullCourse(req, res));

// Orders
router.route("/students/orders")
  .get(verifyStudent, async (req, res) => orderController.getOrders(req, res))
  .post(verifyStudent, async (req, res) => orderController.createOrder(req, res));

router.post("/students/orders/:orderId/capture", async (req, res) => orderController.captureOrder(req, res));

// Reviews
router.post("/courses/:courseId/reviews", verifyStudent, async (req, res) => reviewController.addReview(req, res));
router.get("/courses/:courseId/reviews", async (req, res) => reviewController.getReview(req, res));
router.patch("/reviews/:reviewId/reaction", verifyStudent, async (req, res) => reviewController.addReaction(req, res));
router.get("/courses/:courseId/my-review", verifyStudent, async (req, res) => reviewController.getMyReview(req, res));

// Wishlist
router.post("/courses/:courseId/wishlist", verifyStudent, async (req, res) => studentController.addWishlist(req, res));
router.delete("/courses/:courseId/wishlist", verifyStudent, async (req, res) => studentController.removeWishlist(req, res));
router.get("/students/wishlist", verifyStudent, async (req, res) => studentController.getWishlist(req, res));

// Discussions
router.post("/discussions/:id", async (req, res) => disscussionController.createDiscussion(req, res));
router.get("/discussions/:id", async (req, res) => disscussionController.getAllDiscussions(req, res));
router.post("/discussions/:id/react", async (req, res) => disscussionController.createReact(req, res));
router.post("/discussions/:id/replies", verifyStudent, async (req, res) => disscussionController.createReplay(req, res));
router.get("/discussions/:id/replies", async (req, res) => disscussionController.getReplay(req, res));

// Chat
router.post("/chats", (req, res) => chatController.createChat(req, res));
router.get("/chats/user/:userId", (req, res) => chatController.getUserChats(req, res));
router.get("/chats/instructor/:instructorId", (req, res) => chatController.getInstructorChats(req, res));
router.post("/chats/messages", (req, res) => chatController.sendMessage(req, res));
router.get("/chats/:chatId/messages", (req, res) => chatController.getChatMessages(req, res));
router.post("/chats/:courseId/ai", verifyStudent, async (req, res) => chatController.geminiChat(req, res));
router.get("/chats/:courseId/ai", verifyStudent, async (req, res) => chatController.getAiChatById(req, res));

// Notes
router.get("/notes/:id", verifyStudent, async (req, res) => notesController.getNotes(req, res));
router.post("/notes", verifyStudent, async (req, res) => notesController.createNotes(req, res));
router.put("/notes/:id", verifyStudent, async (req, res) => notesController.updateNotes(req, res));
router.patch("/notes/:id/title", verifyStudent, async (req, res) => notesController.updateNoteTitle(req, res));
router.delete("/notes/:id", verifyStudent, async (req, res) => notesController.deleteNotes(req, res));
router.patch("/notes/:id/update", verifyStudent, async (req, res) => notesController.updateNote(req, res));
router.patch("/notes/:id/delete", verifyStudent, async (req, res) => notesController.deleteNote(req, res));
router.patch("/notes/:notebookId/title", verifyStudent, async (req, res) => notesController.updateNotesTitle(req, res));

// Plans
router.get("/plans", async (req, res) => planController.getPlans(req, res));
router.get("/plans/:id", async (req, res) => planController.getPlanById(req, res));
router.post("/plans/checkout", async (req, res) => planController.createPlanOrder(req, res));
router.post("/plans/checkout/capture", async (req, res) => planController.capturePlanOrder(req, res));
router.get("/students/plans", verifyStudent, async (req, res) => planController.getOrderedPlan(req, res));

// Notifications
router.get("/students/notifications", verifyStudent, async (req, res) => notificationController.getNotifications(req, res));
router.post("/students/notifications", verifyStudent, async (req, res) => notificationController.completionNotification(req, res));
router.patch("/students/notifications/:id", verifyStudent, async (req, res) => notificationController.markAsRead(req, res));

export default router;
