import express, { Request, Response, RequestHandler } from "express";
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

router.get("/health", async (req: Request, res: Response) => {
  res.send("<h1>Server is working. Hello World!</h1>");
});

router.post("/student/refresh", (req, res) => {
  authController.generateRefreshToken(req, res);
});

router.post("/student/signup", (req, res) =>
  authController.signupStudent(req, res)
);

router.post("/student/login", (req, res) => {
  authController.loginStudent(req, res);
});

router.post("/student/googleLogin", (req, res) => {
  authController.googleLoginController(req, res);
});

router.get("/student", verifyStudent, (req, res) => {
  studentController.getStudent(req, res);
});

router.post("/student/logout", (req, res) =>
  authController.logOutStudent(req, res)
);

router.post("/student/verifyotp", (req, res) =>
  authController.verifyOtp(req, res)
);

router.post("/student/resendOtp", (req, res) => {
  authController.resendOtp(req, res);
});

router.post("/student/sendOtp", (req, res) => {
  authController.sendOtp(req, res);
});
router.post("/student/resetPassword", (req, res) => {
  authController.resetPassword(req, res);
});

router.post("/student/forgotVerifyOtp", (req, res) => {
  authController.forgotVerifyOtp(req, res);
});

router.put(
  "/student/profile",
  verifyStudent,
  upload.single("profileImage"),
  async (req, res) => {
    await studentController.updateProfile(req, res);
  }
);

router.get("/student/profile", verifyStudent, async (req, res) => {
  await studentController.getProfile(req, res);
});

//course
router.get("/student/getAllCourses", async (req, res) => {
  await courseController.getAllCourses(req, res);
});

router.get("/student/order/success/:orderId", async (req, res) => {
  await courseController.getCourseByOrderId(req, res);
});

router.get("/student/getCourse/:courseId", async (req, res) => {
  await courseController.getCourseById(req, res);
});
router.get("/student/courses/enrolled", verifyStudent, async (req, res) => {
  await courseController.getEnrolledCourses(req, res);
});

router.get("/student/getCurriculum/:courseId", async (req, res) => {
  await courseController.getCurriculum(req, res);
});

router.get("/student/getAllProgress", verifyStudent, async (req, res) => {
  await courseController.getAllProgress(req, res);
});

router.get("/student/getProgress/:studentId/:courseId", async (req, res) => {
  await courseController.getLessonProgress(req, res);
});

router.patch("/student/updateProgress", async (req, res) => {
  await courseController.updateLessonProgress(req, res);
});

router.get("/student/course/fullcourse/:orderId", async (req, res) => {
  await courseController.getFullCourse(req, res);
});

// order

router
  .route("/student/orders")
  .get(verifyStudent, async (req, res) => {
    await orderController.getOrders(req, res);
  })
  .post(verifyStudent, async (req, res) => {
    await orderController.createOrder(req, res);
  });

router.post("/student/orders/capture/:orderId", async (req, res) => {
  await orderController.captureOrder(req, res);
});

//review
router.post(
  "/student/course/:courseId/review",
  verifyStudent,
  async (req, res) => {
    await reviewController.addReview(req, res);
  }
);

router.get("/student/course/:courseId/reviews", async (req, res) => {
  await reviewController.getReview(req, res);
});
router.patch("/student/:reviewId/reaction", verifyStudent, async (req, res) => {
  await reviewController.addReaction(req, res);
});

router.get(
  "/student/course/myReview/:courseId",
  verifyStudent,
  async (req, res) => {
    await reviewController.getMyReview(req, res);
  }
);

//whishlist
router.post(
  "/student/course/:courseId/wishlist",
  verifyStudent,
  async (req, res) => {
    await studentController.addWishlist(req, res);
  }
);

router.delete(
  "/student/course/:courseId/wishlist",
  verifyStudent,
  async (req, res) => {
    await studentController.removeWishlist(req, res);
  }
);

router.get("/student/course/wishlist", verifyStudent, async (req, res) => {
  await studentController.getWishlist(req, res);
});

//discussion
router.post("/student/discussion/:id", async (req, res) => {
  await disscussionController.createDiscussion(req, res);
});

router.get("/student/discussion/:id", async (req, res) => {
  await disscussionController.getAllDiscussions(req, res);
});

router.post("/student/:id/react", async (req, res) => {
  await disscussionController.createReact(req, res);
});

router.post(
  "/student/discussion/:id/reply",
  verifyStudent,
  async (req, res) => {
    await disscussionController.createReplay(req, res);
  }
);

router.get("/student/discussion/replay/:id", async (req, res) => {
  await disscussionController.getReplay(req, res);
});

///chat routes

router.post("/student/chat", (req, res) => chatController.createChat(req, res));
router.get("/student/chat/user/:userId", (req, res) =>
  chatController.getUserChats(req, res)
);
router.get("/instructor/chat/:instructorId", (req, res) =>
  chatController.getInstructorChats(req, res)
);
router.post("/chat/message", (req, res) =>
  chatController.sendMessage(req, res)
);
router.get("/chat/messages/:chatId", (req, res) =>
  chatController.getChatMessages(req, res)
);
router.post(
  "/student/gemini/chat/:courseId",
  verifyStudent,
  async (req, res) => {
    await chatController.geminiChat(req, res);
  }
);

router.get(
  "/student/gemini/chat/:courseId",
  verifyStudent,
  async (req, res) => {
    await chatController.getAiChatById(req, res);
  }
);

//notes routes

router.get("/student/notes/:id", verifyStudent, async (req, res) => {
  await notesController.getNotes(req, res);
});
router.post("/student/notes", verifyStudent, async (req, res) => {
  await notesController.createNotes(req, res);
});
router.put("/student/notes/:id", verifyStudent, async (req, res) => {
  await notesController.updateNotes(req, res);
});
router.patch("/student/noteTitle/:id", verifyStudent, async (req, res) => {
  await notesController.updateNoteTitle(req, res);
});
router.delete("/student/notes/:id", verifyStudent, async (req, res) => {
  await notesController.deleteNotes(req, res);
});
router.patch("/student/note/:id/update", verifyStudent, async (req, res) => {
  await notesController.updateNote(req, res);
});
router.patch("/student/note/:id/delete", verifyStudent, async (req, res) => {
  await notesController.deleteNote(req, res);
});

router.patch("/student/notes/:notebookId", verifyStudent, async (req, res) => {
  await notesController.updateNotesTitle(req, res);
});

router.get("/plan", async (req, res) => {
  await planController.getPlans(req, res);
});

router.get("/plan/:id", async (req, res) => {
  await planController.getPlanById(req, res);
});

router.post("/plan/checkout", async (req, res) => {
  await planController.createPlanOrder(req, res);
});

router.post("/plan/checkout/capture", async (req, res) => {
  await planController.capturePlanOrder(req, res);
});

router.get("/student/plan", verifyStudent, async (req, res) => {
  await planController.getOrderedPlan(req, res);
});

router.get("/student/notifications", verifyStudent, async (req, res) => {
  await notificationController.getNotifications(req, res);
});

router.post("/student/notifications", verifyStudent, async (req, res) => {
  notificationController.completionNotification(req, res);
});

router.patch("/student/notifications/:id", verifyStudent, async (req, res) => {
  notificationController.markAsRead(req, res);
});

export default router;
