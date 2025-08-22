/**
 * Central dependency injection and wiring for all models, repositories, services, and controllers.
 * - Ensures a single source of truth for instantiating and sharing dependencies across the application.
 * - Promotes modularity, testability, and maintainability by decoupling implementation details.
 * - Used as the main entry point for accessing business logic and data access layers throughout the backend.
 */

// models
import { CategoryModel } from "../../infrastructure/database/models/CategoryModel";
import { LanguageModel } from "../../infrastructure/database/models/LanguageModel";
import InstructorModal from "../../infrastructure/database/models/InstructorModel";
import StudentModel from "../../infrastructure/database/models/StudentModel";
import CourseModel from "../../infrastructure/database/models/CourseModel";
import OrderModel from "../../infrastructure/database/models/OrderModel";
import AdminModal from "../../infrastructure/database/models/AdminModel";
import PlanModel from "../../infrastructure/database/models/PlanModels";
import PlanCheckoutModel from "../../infrastructure/database/models/PlanCheckoutModel";
import OtpModel from "../../infrastructure/database/models/OtpModel";
import ProgressModel from "../../infrastructure/database/models/ProgressModel";
import { ChatModel } from "../../infrastructure/database/models/ChatModel";
import { MessageModel } from "../../infrastructure/database/models/MessageModel";
import CurriculumModel from "../../infrastructure/database/models/CarriculamModel";
import { WishlistModel } from "../../infrastructure/database/models/WishlistModel";
import PayoutRequestModel from "../../infrastructure/database/models/Payout";
import NotesModel from "../../infrastructure/database/models/NotesModel";
import ReviewModel from "../../infrastructure/database/models/ReviewModel";
import { NotificationModel } from "../../infrastructure/database/models/NotificationModel";
import DiscussionModel from "../../infrastructure/database/models/Discussion";
import TransactionModel from "../../infrastructure/database/models/Transaction";

// useCase
import { CategoryUseCase } from "../../application/useCase/Category.usercase";
import { LanguageUseCase } from "../../application/useCase/language.usecase";
import { AdminUseCase } from "../../application/useCase/AdminUseCase";
import { PlanUseCase } from "../../application/useCase/plan.usecase";
import { InstructorUseCase } from "../../application/useCase/instructor.usecase";
import { OrderUseCase } from "../../application/useCase/order.usecase";
import { StudentUseCase } from "../../application/useCase/student.usecase";
import { ChatUseCase } from "../../application/useCase/chat.usecase";
import { NotificationUseCase } from "../../application/useCase/notificaion.usecase";
import { NotesUseCase } from "../../application/useCase/notes.usecase";
import { DiscussionUseCase } from "../../application/useCase/discussion.usecase";
import { ReviewUseCase } from "../../application/useCase/review.usecase";
import { AuthUseCase } from "../../application/useCase/auth.usecase";

// repository
import { CategoryRepository } from "../../infrastructure/repositories/categorys.repository";
import { LanguageRepository } from "../../infrastructure/repositories/language.repository";
import { StudentRepository } from "../../infrastructure/repositories/student.repository";
import { InstructorRepository } from "../../infrastructure/repositories/Instructor.repository";
import { AdminRepository } from "../../infrastructure/repositories/admin.repository";
import { PlanCheckoutRepository } from "../../infrastructure/repositories/plancheckout.repository";
import { PlanRepository } from "../../infrastructure/repositories/plan.repository";
import OtpRepository from "../../infrastructure/repositories/otp.repository";
import { CourseRepository } from "../../infrastructure/repositories/course.repositorie";
import { OrderRepository } from "../../infrastructure/repositories/order.repository";
import { CurriculumRepository } from "../../infrastructure/repositories/carriculum.repository";
import { ProgressRepository } from "../../infrastructure/repositories/progress.repository";
import { ChatRepository } from "../../infrastructure/repositories/chat.repository";
import { MessageRepository } from "../../infrastructure/repositories/message.repository";
import { WishlistRepository } from "../../infrastructure/repositories/whishlist.repository";
import { TransactionRepository } from "../../infrastructure/repositories/transaction.repository";
import { ReviewRepository } from "../../infrastructure/repositories/review.repository";
import { DiscussionRepository } from "../../infrastructure/repositories/discussion.repository";
import { NotesRepository } from "../../infrastructure/repositories/notes.repository";
import { NotificationRepository } from "../../infrastructure/repositories/notification.repository";

// controller
import CategoryController from "../controllers/category.controller";
import LanguageController from "../controllers/language.controller";
import AdminController from "../controllers/admin.controller";
import { PlanController } from "../controllers/plan.controller";
import { InstructorController } from "../controllers/instructor.controller";
import { CourseUseCase } from "../../application/useCase/course.usecase";
import { CourseController } from "../controllers/course.controller";
import { OrderController } from "../controllers/order.controller";
import { ChatController } from "../controllers/chat.controller";
import { StudentController } from "../controllers/student.controller";
import { DiscussionController } from "../controllers/discussion.controller";
import { NotesController } from "../controllers/notes.controller";
import { NotificationController } from "../controllers/notification.controller";
import AuthController from "../controllers/auth.controller";
import { ReviewController } from "../controllers/review.controller";

// Repository
const categoryRepo = new CategoryRepository(CategoryModel);
const languageRepo = new LanguageRepository(LanguageModel);
const instructorRepo = new InstructorRepository(InstructorModal);
const studentRepo = new StudentRepository(StudentModel);
const adminRepo = new AdminRepository(
  AdminModal,
  OrderModel,
  StudentModel,
  CourseModel,
  InstructorModal
);
const planRepo = new PlanRepository(PlanModel);
const planCheckoutRepo = new PlanCheckoutRepository(PlanCheckoutModel);
const otpRepo = new OtpRepository(OtpModel);
const courseRepo = new CourseRepository(CourseModel);
const orderRepo = new OrderRepository(OrderModel, PayoutRequestModel);
const curriculamRepo = new CurriculumRepository(CurriculumModel);
const progressRepo = new ProgressRepository(ProgressModel, CurriculumModel);
const chatRepo = new ChatRepository(ChatModel, MessageModel);
const messageRepo = new MessageRepository(MessageModel);
const whishlistRepo = new WishlistRepository(WishlistModel);
const transacionRepo = new TransactionRepository(TransactionModel);
const reviewRepo = new ReviewRepository(ReviewModel);
const discussionRepo = new DiscussionRepository(DiscussionModel);
const notesRepo = new NotesRepository(NotesModel);
const transactionRepo = new TransactionRepository(TransactionModel);
const notificationRepo = new NotificationRepository(NotificationModel);

// const instructorRepo = new InstructorRepository(InstructorModal)

// const studentRepo = new StudentRepository(StudentModel);
// const otpRepo = new OtpRepository(OtpModel)
// const whishlistRepo = new WishlistRepository(WishlistModel)
// const studentUseCase = new StudentUseCase(studentRepo, whishlistRepo);

// const messageRepo = new MessageRepository(MessageModel)
// const chatRepo = new ChatRepository(ChatModel,MessageModel);
// const chatUseCase = new ChatUseCase(
//     chatRepo,
//     messageRepo,
//     studentRepo,
//     instrucotRepo
// );
// const instructorUseCase = new InstructorUseCase(instrucotRepo,otpRepo)
// const chatController = new ChatController(chatUseCase, instructorUseCase);

// const courseRepo = new CourseRepository(CourseModel)
// const curriculamRepo = new CurriculumRepository(CurriculumModel)
// const progressRepo = new ProgressRepository(ProgressModel, CurriculumModel);
// const orderRepo = new OrderRepository(OrderModel,PayoutRequestModel)
// const courseUseCase = new CourseUseCase(
//   courseRepo,
//   curriculamRepo,
//   orderRepo,
//   studentRepo,
//   progressRepo
// );
// const courseController = new CourseController(courseUseCase)

// const orderController = new OrderController(studentUseCase,orderuseCase,instructorUseCase)

// UseCase
const categoryUseCase = new CategoryUseCase(categoryRepo);
const languageUseCase = new LanguageUseCase(languageRepo);
const adminUseCase = new AdminUseCase(adminRepo, studentRepo, instructorRepo);
const planUseCase = new PlanUseCase(planRepo, planCheckoutRepo);
const courseUseCase = new CourseUseCase(
  courseRepo,
  curriculamRepo,
  orderRepo,
  studentRepo,
  progressRepo
);
const chatUseCase = new ChatUseCase(
  chatRepo,
  messageRepo,
  studentRepo,
  instructorRepo
);
const studentUseCase = new StudentUseCase(studentRepo, whishlistRepo);
const orderUseCase = new OrderUseCase(transacionRepo, orderRepo);
const instructorUseCase = new InstructorUseCase(instructorRepo, otpRepo);
const notificationUseCase = new NotificationUseCase(notificationRepo);
const notesUseCase = new NotesUseCase(notesRepo, studentRepo);
const discuccionUseCase = new DiscussionUseCase(discussionRepo);
const reviewUseCase = new ReviewUseCase(reviewRepo);
const authUseCase = new AuthUseCase(studentRepo, otpRepo, instructorRepo);

// Controller
export const categoryController = new CategoryController(categoryUseCase);
export const languageController = new LanguageController(languageUseCase);
export const adminController = new AdminController(adminUseCase);
export const planController = new PlanController(planUseCase);
export const orderController = new OrderController(
  studentUseCase,
  orderUseCase,
  instructorUseCase
);

export const courseController = new CourseController(courseUseCase);
export const chatController = new ChatController(
  chatUseCase,
  instructorUseCase
);
export const instructorController = new InstructorController(instructorUseCase);
export const studentController = new StudentController(studentUseCase);
export const notesController = new NotesController(notesUseCase);
export const notificationController = new NotificationController(
  notificationUseCase,
  studentUseCase
);
export const reviewController = new ReviewController(
  reviewUseCase,
  studentUseCase
);

export const disscussionController = new DiscussionController(
  discuccionUseCase,
  studentUseCase
);
export const authController = new AuthController(studentUseCase, authUseCase);
