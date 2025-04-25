import { generateAccessToken, generateRefreshToken } from "../../infrastructure/utility/GenarateToken";
import IAdminRepo from "../interface/IAdminRepo";
import bcrypt from 'bcrypt'
import IStudentRepo from "../interface/IStudentRepo";
import IInstructorRepo from "../interface/IInstructorRepo";


export class AdminUseCase {
  private adminRepo: IAdminRepo;
  private studentRepo: IStudentRepo;
  private instrucotorRepo: IInstructorRepo;
  constructor(
    adminRepo: IAdminRepo,
    studentRepo: IStudentRepo,
    instrucotorRepo:IInstructorRepo
  ) {
    this.adminRepo = adminRepo;
    this.studentRepo = studentRepo;
    this.instrucotorRepo = instrucotorRepo
  }

  async loginAdmin(email: string, password: string) {
    const adminData = await this.adminRepo.findAdminByEmail(email);
    console.log("admin", adminData);
    if (!adminData) {
      throw new Error("Admin not found");
    }
    const isMatch = await bcrypt.compare(password, adminData.password);
    if (!isMatch) {
      throw new Error("Invalid password");
    }
    const payload = { email: adminData.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      message: "Login successful",
      accessToken,
      refreshToken,
    };
  }
  async findAllStudents() {
    const students = await this.studentRepo.getAllStudents();
    return students;
  }
  async findAllTeachers() {
    const students = await this.instrucotorRepo.findAllInstructors();
    return students;
  }
  async blockTeacher(email: string) {
    const res = await this.instrucotorRepo.blockInstructor(email);
    return res;
  }
  async blockStudent(email: string) {
    const res = await this.studentRepo.blockStudent(email);
    return res;
  }
}