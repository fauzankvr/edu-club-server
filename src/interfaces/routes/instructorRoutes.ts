import express from 'express'
import { InstructorRepository } from '../../infrastructure/repositories/InstructorRepositorie'
import { InstructorUseCase } from '../../application/useCase/InstructorUseCase'
import InstructorController from '../controllers/InstructorController'
import { upload } from '../../infrastructure/services/multer/multerConfig'
import { verifyStudent } from '../middlewares/ExtractUser'


const instructorRepo = new InstructorRepository()
const instructorUseCase = new InstructorUseCase(instructorRepo)
const controller = new InstructorController(instructorUseCase)
const router = express.Router()


router.post("/signup", (req, res) => {
    controller.signupInstructor(req,res)
})

router.post("/verifyOtp", (req, res) => {
    controller.verifyOtp(req,res)
})
router.post("/resendOtp", (req, res) => {
  controller.resendOtp(req,res)
})

router.post("/login", (req, res) => {
    controller.loginInstructor(req, res);
})

router.post("/logout", (req, res) => {
    controller.logOutInstructor(req,res)
})
router.get("/profile",verifyStudent,  async (req, res) => {
  await controller.getProfile(req, res);
});

router.put(
  "/profile",
  verifyStudent,
  upload.single("profileImage"),
  async (req, res) => {
    await controller.updateProfile(req, res);
  }
);

router.post("/createCourse",verifyStudent, upload.single("courseImgeId"), (req, res) => {
  controller.createCourse(req, res);
});
// in your route file
router.post(
  "/uploadCurriculum/:courseId",
  verifyStudent,
  upload.fields([
    { name: "videos", maxCount: 100 },
    { name: "pdfs", maxCount: 100 },
  ]),
  (req, res) => {
    controller.uploadCurriculum(req, res);
  }
);

router.get("/getCourse/:id", (req, res) => {
  controller.getCourseById(req,res)
})
router.get("/getCurriculum/:id", (req, res) => {
  controller.getCurriculam(req,res)
});

router.put(
  "/updateCurriculum/:id",
  verifyStudent,
  upload.fields([
    { name: "videos", maxCount: 100 },
    { name: "pdfs", maxCount: 100 },
  ]),
  (req, res) => {
    controller.updateCurriculum(req, res);
  }
);
router.post("/updateCourse/:id", upload.single("courseImgeId"), (req, res) => {
  controller.updateCourse(req, res);
});

router.get("/getAllCourses", verifyStudent, (req, res) => {
  controller.getAllCoureses(req, res);
});


export default router