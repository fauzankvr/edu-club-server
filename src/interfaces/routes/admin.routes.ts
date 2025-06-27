import express from 'express'
import { AdminRepository } from '../../infrastructure/repositories/admin.repository'
import { AdminUseCase } from '../../application/useCase/AdminUseCase'
import AdminController from '../controllers/admin.controller'
import { StudentRepository } from '../../infrastructure/repositories/student.repository'
import { InstructorRepository } from '../../infrastructure/repositories/Instructor.repository'
import { verifyAdmin } from '../middlewares/ExtractAdmin'
import AdminModal from '../../infrastructure/database/models/AdminModel'
import StudentModel from '../../infrastructure/database/models/StudentModel'
import Instructor from '../../infrastructure/database/models/InstructorModel'
import { PlanRepository } from '../../infrastructure/repositories/plan.repository'
import { PlanUseCase } from '../../application/useCase/plan.usecase'
import { PlanController } from '../controllers/plan.controller'
import PlanModel from '../../infrastructure/database/models/PlanModels'
import OrderModel from '../../infrastructure/database/models/OrderModel'
import CourseModel from '../../infrastructure/database/models/CourseModel'
import { CourseRepository } from '../../infrastructure/repositories/course.repositorie'
import { PlanCheckoutRepository } from '../../infrastructure/repositories/plancheckout.repository'
import PlanCheckoutModel from '../../infrastructure/database/models/PlanCheckoutModel'
import { courseController } from './instructou.routes'


const studentRepo = new StudentRepository(StudentModel)
const instrucotorRepo = new InstructorRepository(Instructor)
const adminRepo = new AdminRepository(
  AdminModal,
  OrderModel,
  StudentModel,
  CourseModel,
  Instructor
);
const adminUseCase = new AdminUseCase(adminRepo, studentRepo,instrucotorRepo);
const controller = new AdminController(adminUseCase);
const router = express.Router()

const planRepo = new PlanRepository(PlanModel)
const planCheckoutRepo = new PlanCheckoutRepository(PlanCheckoutModel)
const planUseCase = new PlanUseCase(planRepo, planCheckoutRepo)
export const planController = new PlanController(planUseCase)


router.post("/login", (req, res) => {
    controller.loginAdmin(req, res);
})
router.get("/findAllStudent",verifyAdmin, (req, res) => {
    controller.findAllStudent(req,res)
});
router.get("/findAllTeachers", verifyAdmin, (req, res) => {
  controller.findAllTeachers(req, res);
});
router.patch("/blockTeacher", (req, res) => {
  controller.blockInstructor(req, res);
});
router.patch("/blockStudent", (req, res) => {
  controller.blockStudent(req, res);
});

router.post("/logout", (req, res) => {
    controller.logOutAdmin(req,res)
})

router.get("/payouts", (req, res) => {
  controller.getPayouts(req, res);
});
router.post("/payout/:id",verifyAdmin, (req, res) => {
  controller.updatePayout(req, res);
});

router.get("/dashboard", (req, res) => {
  controller.getDashboardData(req,res)
});
  
router.get("/report", (req, res) => {
  controller.downloadReport(req,res)
});



router.post("/plans", (req, res) => {
  planController.createPlan(req, res);
});
router.get("/plans", (req, res) => {
  planController.getPlans(req, res);
})
router.put("/plans/:id", (req, res) => {
  planController.updatePlan(req, res);
})
router.patch("/plans/:id/toggle", (req, res) => {
  planController.blockPlan(req, res);
})
router.get("/plan/:id", (req, res) => {
  planController.getPlan(req, res);
})

router.get("/courses", verifyAdmin, (req, res) => {
  courseController.getAllCoursesAdmin(req, res);
});
router.patch("/course/:courseId/block",verifyAdmin, (req, res) => {
  courseController.blockCourse(req, res);
})

export default router