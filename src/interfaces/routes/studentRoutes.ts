import express, { Request, Response, RequestHandler } from "express";
import StudentController from "../controllers/StudentController";
import {StudentUseCase} from "../../application/useCase/StudentUseCase";
import { StudentRepository } from "../../infrastructure/repositories/StudentRepositorie"; 
import { verifyStudent } from "../middlewares/ExtractUser";
import { upload } from "../../infrastructure/services/multer/multerConfig";

import { MongoChatRepository } from "../../infrastructure/repositories/ChatRepository";
import { ChatUseCase } from "../../application/useCase/ChatUsecase";
import { InstructorRepository } from "../../infrastructure/repositories/InstructorRepositorie";
import { ChatController } from "../controllers/ChatController";

// Create dependencies
const studentRepo = new StudentRepository();
const studentUseCase = new StudentUseCase(studentRepo);
const controller = new StudentController(studentUseCase);

const instrucotRepo = new InstructorRepository()
const chatMessageRepository = new MongoChatRepository();
const chatUseCase = new ChatUseCase(
  chatMessageRepository,
  studentRepo,
  instrucotRepo
);
const chatController = new ChatController(chatUseCase);


const router = express.Router();

router.get("/health", async (req: Request, res: Response) => {
  res.send("<h1>Server is working. Hello World!</h1>");
});

router.post("/refresh", (req, res) => {
  controller.generateRefreshToken(req,res)
})

router.post("/student/signup", (req, res) =>
  controller.signupStudent(req, res)
);

router.post("/student/login", (req, res) => {
  controller.loginStudent(req, res);
});

router.get("/student", verifyStudent, (req, res) => {
  controller.getStudent(req,res)
})

router.post("/student/logout", (req, res) => controller.logOutStudent(req, res));

router.post("/student/verifyotp", (req, res) => controller.verifyOtp(req, res));

router.post("/student/resendOtp", (req, res) => {
  controller.resendOtp(req,res)
})

router.put(
  "/student/profile",
  verifyStudent,
  upload.single("profileImage"),
  async (req, res) => {
    await controller.updateProfile(req, res);
  }
);

router.get("/student/profile", verifyStudent, async (req, res) => {
  await controller.getProfile(req, res);
});

router.get("/student/getAllCourses",async (req, res) => {
  await controller.getAllCoureses(req,res)
})

router.get("/student/getCourse/:courseId",async (req, res) => {
  await controller.getCourseById(req,res)
});

router.post("/student/orders",verifyStudent, async (req, res) => {
  await controller.createOrderController(req, res);
});
router.post("/student/orders/capture/:orderId",async (req, res) => {
  await controller.captureOrderController(req, res);
});

router.get("/student/order/success/:orderId", async (req, res) => {
  await controller.getCourseByOrderId(req, res);
});
router.get("/student/course/fullcourse/:orderId", async (req, res) => {
  await controller.getFullCourse(req,res)
});

router.post(
  "/student/course/:courseId/review",
  verifyStudent,
  async (req, res) => {
    await controller.addReview(req, res);
  }
);

router.get("/student/course/:courseId/reviews", async (req, res) => {
  await controller.getReview(req, res);
});
router.patch("/student/:reviewId/reaction", verifyStudent, async (req, res) => {
  await controller.addReaction(req,res)
})

router.get(
  "/student/course/myReview/:courseId",
  verifyStudent,
  async (req, res) => {
    await controller.getMyReview(req, res);
  }
);

router.post("/student/course/:courseId/wishlist",verifyStudent, async (req, res) => {
  await controller.addWishlist(req, res);
})

router.get("/student/course/wishlist", verifyStudent, async (req, res) => {
  await controller.getWishlist(req, res);
});

router.get("/student/courses/enrolled", verifyStudent, async (req, res) => {
  await controller.getEnrolledCourses(req, res);
});

router.get("/student/getCurriculum/:courseId", async(req, res) => {
  await controller.getCarriculam(req, res);
});

router.post("/student/gemini/chat", async (req, res) => {
  await controller.geminiChat(req,res)
})

router.post("/student/discussion/:id", async (req, res) => {
  await controller.createDiscussion(req,res)
});

router.get("/student/discussion/:id", async (req, res) => {
 await controller.getAllDiscussion(req,res)
})

router.post("/student/:id/react", async (req, res) => {
  await controller.createReact(req,res)
});

router.post("/student/discussion/:id/reply",verifyStudent, async (req, res) => {
  await controller.createReplay(req, res)
})

router.get("/student/discussion/replay/:id", async (req, res) => {
  await controller.getReplay(req,res)
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


export default router;
