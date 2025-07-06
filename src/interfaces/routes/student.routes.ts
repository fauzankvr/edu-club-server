import express, { Request, Response, RequestHandler } from "express";
import { StudentController } from "../controllers/student.controller"; 
import { StudentUseCase } from "../../application/useCase/student.usecase"; 
import { StudentRepository } from "../../infrastructure/repositories/student.repository"; 
import { verifyStudent } from "../middlewares/ExtractUser";
import { upload } from "../../infrastructure/services/multer/multerConfig";
import { ChatRepository } from "../../infrastructure/repositories/chat.repository"; 
import { ChatUseCase } from "../../application/useCase/chat.usecase";
import { InstructorRepository } from "../../infrastructure/repositories/Instructor.repository";
import { ChatController } from "../controllers/chat.controller";
import StudentModel from "../../infrastructure/database/models/StudentModel";
import InstructorModal from "../../infrastructure/database/models/InstructorModel";
import { ChatModel } from "../../infrastructure/database/models/ChatModel";
import { MessageRepository } from "../../infrastructure/repositories/message.repository";
import { MessageModel } from "../../infrastructure/database/models/MessageModel";
import { InstructorUseCase } from "../../application/useCase/instructor.usecase";
import OtpRepository from "../../infrastructure/repositories/otp.repository";
import OtpModel from "../../infrastructure/database/models/OtpModel";
import AuthController from "../controllers/auth.controller";
import { CourseRepository } from "../../infrastructure/repositories/course.repositorie";
import CourseModel from "../../infrastructure/database/models/CourseModel";
import { CourseUseCase } from "../../application/useCase/course.usecase";
import CurriculumModel from "../../infrastructure/database/models/CarriculamModel";
import { CurriculumRepository } from "../../infrastructure/repositories/carriculum.repository";
import { CourseController } from "../controllers/course.controller";
import { AuthUseCase } from "../../application/useCase/auth.usecase";
import { OrderRepository } from "../../infrastructure/repositories/order.repository";
import OrderModel from "../../infrastructure/database/models/OrderModel";
import { OrderUseCase } from "../../application/useCase/order.usecase";
import { OrderController } from "../controllers/order.controller";
import TransactionModel from "../../infrastructure/database/models/Transaction";
import { TransactionRepository } from "../../infrastructure/repositories/transaction.repository";
import { ReviewRepository } from "../../infrastructure/repositories/review.repository";
import ReviewModel from "../../infrastructure/database/models/ReviewModel";
import { ReviewUseCase } from "../../application/useCase/review.usecase";
import { ReviewController } from "../controllers/review.controller";
import { WishlistModel } from "../../infrastructure/database/models/WishlistModel";
import { WishlistRepository } from "../../infrastructure/repositories/whishlist.repository";
import { DiscussionRepository } from "../../infrastructure/repositories/discussion.repository";
import DiscussionModel from "../../infrastructure/database/models/Discussion";
import { DiscussionUseCase } from "../../application/useCase/discussion.usecase";
import { DiscussionController } from "../controllers/discussion.controller";
import { NotesRepository } from "../../infrastructure/repositories/notes.repository";
import NotesModel from "../../infrastructure/database/models/NotesModel";
import { NotesUseCase } from "../../application/useCase/notes.usecase";
import { NotesController } from "../controllers/notes.controller";
import { planController } from "./admin.routes";
import PayoutRequestModel from "../../infrastructure/database/models/Payout";
import { ProgressRepository } from "../../infrastructure/repositories/progress.repository";
import ProgressModel from "../../infrastructure/database/models/ProgressModel";
import { NotificationRepository } from "../../infrastructure/repositories/notification.repository";
import { NotificationUseCase } from "../../application/useCase/notificaion.usecase";
import { NotificationController } from "../controllers/notification.controller";
import { NotificationModel } from "../../infrastructure/database/models/NotificationModel";

// Create dependencies
const studentRepo = new StudentRepository(StudentModel);
const otpRepo = new OtpRepository(OtpModel)
const whishlistRepo = new WishlistRepository(WishlistModel)
const studentUseCase = new StudentUseCase(studentRepo, whishlistRepo);
const studetnController = new StudentController(studentUseCase);

const notificationRepo = new NotificationRepository(NotificationModel)
const notificationUseCase = new NotificationUseCase(notificationRepo)
export const notificationController = new NotificationController(
  notificationUseCase,
  studentUseCase
);

const instrucotRepo = new InstructorRepository(InstructorModal)
const messageRepo = new MessageRepository(MessageModel)
const chatRepo = new ChatRepository(ChatModel,MessageModel);
const chatUseCase = new ChatUseCase(
  chatRepo,
  messageRepo,
  studentRepo,
  instrucotRepo
);
const instructorUseCase = new InstructorUseCase(instrucotRepo,otpRepo)
const chatController = new ChatController(chatUseCase, studentUseCase, instructorUseCase);

const authUseCase = new AuthUseCase(studentRepo, otpRepo, instrucotRepo);
const authController = new AuthController(studentUseCase, authUseCase);

const courseRepo = new CourseRepository(CourseModel)
const curriculamRepo = new CurriculumRepository(CurriculumModel)
const progressRepo = new ProgressRepository(ProgressModel, CurriculumModel);
const orderRepo = new OrderRepository(OrderModel,PayoutRequestModel)
const courseUseCase = new CourseUseCase(
  courseRepo,
  curriculamRepo,
  orderRepo,
  studentRepo,
  progressRepo
);
const courseController = new CourseController(courseUseCase)

const transactionRepo = new TransactionRepository(TransactionModel)
const orderuseCase = new OrderUseCase(transactionRepo,orderRepo)
const orderController = new OrderController(studentUseCase,orderuseCase,instructorUseCase)

const reviewRepo = new ReviewRepository(ReviewModel)
const reviewUseCase = new ReviewUseCase(reviewRepo);
const reviewController = new ReviewController(reviewUseCase, studentUseCase)

const discussionRepo = new DiscussionRepository(DiscussionModel)
const discuccionUseCase = new DiscussionUseCase(discussionRepo)
const disscussionController = new DiscussionController(discuccionUseCase,studentUseCase)

const notesRepo = new NotesRepository(NotesModel)
const notesUseCase = new NotesUseCase(notesRepo,studentRepo)
const notesController = new NotesController(notesUseCase)


const router = express.Router();

router.get("/health", async (req: Request, res: Response) => {
  res.send("<h1>Server is working. Hello World!</h1>");
});

router.post("/refresh", (req, res) => {
  authController.generateRefreshToken(req, res);
})

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
  studetnController.getStudent(req, res);
})

router.post("/student/logout", (req, res) =>
  authController.logOutStudent(req, res)
);

router.post("/student/verifyotp", (req, res) =>
  authController.verifyOtp(req, res)
);

router.post("/student/resendOtp", (req, res) => {
  authController.resendOtp(req, res);
})

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
    await studetnController.updateProfile(req, res);
  }
);

router.get("/student/profile", verifyStudent, async (req, res) => {
  await studetnController.getProfile(req, res);
});

//course
router.get("/student/getAllCourses",async (req, res) => {
  await courseController.getAllCourses(req, res);
})

router.get("/student/order/success/:orderId", async (req, res) => {
  await courseController.getCourseByOrderId(req, res);
});

router.get("/student/getCourse/:courseId",async (req, res) => {
  await courseController.getCourseById(req, res);
});
router.get("/student/courses/enrolled", verifyStudent, async (req, res) => {
  await courseController.getEnrolledCourses(req, res);
});

router.get("/student/getCurriculum/:courseId", async (req, res) => {
  await courseController.getCurriculum(req, res);
});

router.get("/student/getAllProgress",verifyStudent, async (req, res) => {
  await courseController.getAllProgress(req,res)
});

router.get("/student/getProgress/:studentId/:courseId", async (req, res) => {
  await courseController.getLessonProgress(req,res)
});

router.patch("/student/updateProgress", async (req, res) => {
  await courseController.updateLessonProgress(req,res)
})

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
  
router.post("/student/orders/capture/:orderId",async (req, res) => {
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
})

router.get(
  "/student/course/myReview/:courseId",
  verifyStudent,
  async (req, res) => {
    await reviewController.getMyReview(req, res);
  }
);

//whishlist
router.post("/student/course/:courseId/wishlist",verifyStudent, async (req, res) => {
  await studetnController.addWishlist(req, res);
})

router.delete(
  "/student/course/:courseId/wishlist",
  verifyStudent,
  async (req, res) => {
    await studetnController.removeWishlist(req, res);
  }
);

router.get("/student/course/wishlist", verifyStudent, async (req, res) => {
  await studetnController.getWishlist(req, res);
});

//discussion
router.post("/student/discussion/:id", async (req, res) => {
  await disscussionController.createDiscussion(req, res);
});

router.get("/student/discussion/:id", async (req, res) => {
 await disscussionController.getAllDiscussions(req,res)
})

router.post("/student/:id/react", async (req, res) => {
  await disscussionController.createReact(req, res);
});

router.post("/student/discussion/:id/reply",verifyStudent, async (req, res) => {
  await disscussionController.createReplay(req, res);
})

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
router.post("/chat/message", (req, res) => chatController.sendMessage(req, res));
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

router.get("/student/notes/:id", verifyStudent, async (req, res) =>{
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

router.patch("/student/notes/:notebookId",verifyStudent,async(req,res)=>{
  await notesController.updateNotesTitle(req,res)
})

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

router.get(
  "/student/notifications",
  verifyStudent, async (req, res) => {
    await notificationController.getNotifications(req, res)
  }
);

router.patch(
  "/student/notifications/:id",
  verifyStudent, async (req, res) => {
    notificationController.markAsRead(req,res)
  }
);


export default router;
