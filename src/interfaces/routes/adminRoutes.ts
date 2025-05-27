import express from 'express'
import { AdminRepository } from '../../infrastructure/repositories/AdminRepositorie'
import { AdminUseCase } from '../../application/useCase/AdminUseCase'
import AdminController from '../controllers/AdminController'
import { StudentRepository } from '../../infrastructure/repositories/StudentRepositorie'
import { InstructorRepository } from '../../infrastructure/repositories/InstructorRepositorie'
import { verifyAdmin } from '../middlewares/ExtractAdmin'



const adminRepo = new AdminRepository()
const studentRepo = new StudentRepository()
const instrucotorRepo = new InstructorRepository()
const adminUseCase = new AdminUseCase(adminRepo, studentRepo,instrucotorRepo);
const controller = new AdminController(adminUseCase);
const router = express.Router()



router.post("/login", (req, res) => {
    controller.loginAdmin(req, res);
})
router.get("/findAllStudent", (req, res) => {
    controller.findAllStudent(req,res)
});
router.get("/findAllTeachers", (req, res) => {
  controller.findAllTeachers(req,res)
});
router.patch("/blockTeacher", (req, res) => {
  controller.blockTeacher(req, res);
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


export default router