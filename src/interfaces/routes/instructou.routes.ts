import express from 'express'
import { InstructorRepository } from '../../infrastructure/repositories/Instructor.repository'
import { InstructorUseCase } from '../../application/useCase/instructor.usecase' 
import { InstructorController } from '../controllers/instructor.controller'
import { upload } from '../../infrastructure/services/multer/multerConfig'
import { verifyInstructor } from '../middlewares/ExtractInstructor'
import InstructorModel from '../../infrastructure/database/models/InstructorModel'
import OtpRepository from '../../infrastructure/repositories/otp.repository'
import OtpModel from '../../infrastructure/database/models/OtpModel'
import { CourseRepository } from '../../infrastructure/repositories/course.repositorie'
import CourseModel from '../../infrastructure/database/models/CourseModel'
import { CourseUseCase } from '../../application/useCase/course.usecase'
import { CourseController } from '../controllers/course.controller'
import { CurriculumRepository } from '../../infrastructure/repositories/carriculum.repository'
import CurriculumModel from '../../infrastructure/database/models/CarriculamModel'
import { ChatModel } from '../../infrastructure/database/models/ChatModel'
import { ChatRepository } from '../../infrastructure/repositories/chat.repository'
import { ChatUseCase } from '../../application/useCase/chat.usecase'
import { ChatController } from '../controllers/chat.controller'
import { MessageRepository } from '../../infrastructure/repositories/message.repository'
import { MessageModel } from '../../infrastructure/database/models/MessageModel'
import { StudentRepository } from '../../infrastructure/repositories/student.repository'
import StudentModel from '../../infrastructure/database/models/StudentModel'
import { StudentUseCase } from '../../application/useCase/student.usecase' 
import { OrderRepository } from '../../infrastructure/repositories/order.repository'
import { OrderController } from '../controllers/order.controller'
import { OrderUseCase } from '../../application/useCase/order.usecase'
import { TransactionRepository } from '../../infrastructure/repositories/transaction.repository'
import TransactionModel from '../../infrastructure/database/models/Transaction'
import { WishlistRepository } from '../../infrastructure/repositories/whishlist.repository'
import { WishlistModel } from '../../infrastructure/database/models/WishlistModel'
import OrderModel from '../../infrastructure/database/models/OrderModel'
import PayoutRequestModel from '../../infrastructure/database/models/Payout'


const instructorRepo = new InstructorRepository(InstructorModel)
const otpRepo = new OtpRepository(OtpModel)
const instructorUseCase = new InstructorUseCase(instructorRepo,otpRepo)
const instructorController = new InstructorController(instructorUseCase)
const router = express.Router()

const courseRepo = new CourseRepository(CourseModel)
const orderRepo = new OrderRepository(OrderModel,PayoutRequestModel)
const studentRepo = new StudentRepository(StudentModel)
const curriculamRepo = new CurriculumRepository(CurriculumModel)
const courseUseCase = new CourseUseCase(courseRepo, curriculamRepo, orderRepo,studentRepo);
export const courseController = new CourseController(courseUseCase)

const chatRepo = new ChatRepository(ChatModel,MessageModel)
const messageRepo = new MessageRepository(MessageModel)
const whishlistRepo = new WishlistRepository(WishlistModel)
const studentUseCase = new StudentUseCase(studentRepo, whishlistRepo);
const chatUseCase = new ChatUseCase(chatRepo,messageRepo,studentRepo,instructorRepo)
const chatController = new ChatController(chatUseCase, studentUseCase, instructorUseCase);

const transacionRepo = new TransactionRepository(TransactionModel)
const orderUseCase = new OrderUseCase(transacionRepo,orderRepo);
const orderController = new OrderController(
  studentUseCase,
  orderUseCase,
  instructorUseCase
);

router.post("/signup", (req, res) => {
  instructorController.signupInstructor(req, res);
})

router.post("/sendOtp",(req,res)=>{
  instructorController.sendOtp(req,res)
})
router.post("/verifyOtp", (req, res) => {
  instructorController.verifyOtp(req, res);
})
router.post("/resendOtp", (req, res) => {
  instructorController.resendOtp(req, res);
})
router.post("/resetPassword", (req, res) => {
  instructorController.resetPassword(req, res);
})

router.post("/login", (req, res) => {
  instructorController.loginInstructor(req, res);
})

router.post("/logout", (req, res) => {
  instructorController.logOutInstructor(req, res);
})
router.get("/profile", verifyInstructor, async (req, res) => {
  await instructorController.getProfile(req, res);
});

router.put(
  "/profile",
  verifyInstructor,
  upload.single("profileImage"),
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
router.post("/updateCourse/:id", upload.single("courseImgeId"), (req, res) => {
  courseController.updateCourse(req, res);
});

router.get("/getAllCourses", verifyInstructor, (req, res) => {
  courseController.getInstructorAllCourses(req, res);
});

router.get("/getAllChats",verifyInstructor, (req, res) => {
  chatController.getAllChats(req, res); 
})
router.get("/getMessages/:id", verifyInstructor, (req, res) => {
  chatController.getAllMessage(req, res);
});

router.post("/postMessage", verifyInstructor, (req, res) => {
  chatController.postMessage(req, res);
});
router.get("/getCallhistory/:instructorId", verifyInstructor, (req, res) => {
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

router.get(
  "/dashboard", verifyInstructor,(req, res) => {
    orderController.getDashboardData(req,res)
  }
);

export default router