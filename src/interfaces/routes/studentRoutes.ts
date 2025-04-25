import express, { Request, Response, RequestHandler } from "express";
import StudentController from "../controllers/StudentController";
import {StudentUseCase} from "../../application/useCase/StudentUseCase";
import { StudentRepository } from "../../infrastructure/repositories/StudentRepositorie"; 
import { verifyStudent } from "../middlewares/ExtractUser";
import { upload } from "../../infrastructure/services/multer/multerConfig";

// Create dependencies
const studentRepo = new StudentRepository();
const studentUseCase = new StudentUseCase(studentRepo);
const controller = new StudentController(studentUseCase);

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

router.post("/student/orders", async (req, res) => {
  await controller.createOrderController(req, res);
});
router.post("/student/orders/:orderId/capture", async (req, res) => {
  await controller.captureOrderController(req, res)
})


export default router;
