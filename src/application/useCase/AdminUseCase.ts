import IAdminRepository from "../interface/IAdminRepository";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../infrastructure/utility/GenarateToken";
import { generateTempPassword } from "../../infrastructure/utility/GenerateTempPasw";
import { sendApprovalEmail } from "../../infrastructure/services/EmailService";
import {
  INSTRUCTOR_NOT_FOUND,
  INVALID_CREDENTIALS,
  LOGIN_SUCCESS,
  STUDENT_NOT_FOUND,
} from "../../interfaces/constants/responseMessage";
import { IAdminUseCase } from "../interface/IAdminUseCase";
import IStudentRepository from "../interface/IStudentRepository";
import IInstructorRepository from "../interface/IInstructorRepository";
import { generatePdfReport } from "../../infrastructure/utility/pdfGenerator";
import { generateExcelReport } from "../../infrastructure/utility/exelGenerator";

export class AdminUseCase implements IAdminUseCase {
  constructor(
    private _adminRepository: IAdminRepository,
    private _studentRepository: IStudentRepository,
    private _instructorRepository: IInstructorRepository
  ) {}

  async loginAdmin(email: string, password: string) {
    const adminData = await this._adminRepository.findAdminByEmail(email);
    if (!adminData) {
      throw new Error(INVALID_CREDENTIALS);
    }
    const isMatch = await bcrypt.compare(password, adminData.password);
    if (!isMatch) {
      throw new Error(INVALID_CREDENTIALS);
    }
    const TokenPayload: any = {
      email: adminData.email,
      id: adminData._id.toString(),
      role: "admin",
    };
    const accessToken = generateAccessToken(TokenPayload);
    const refreshToken = generateRefreshToken(TokenPayload);

    return {
      message: LOGIN_SUCCESS,
      accessToken,
      refreshToken,
    };
  }
  countAllStudents(): Promise<number> {
    return this._studentRepository.countAllStudents();
  }
  async findAllStudents(limit: number, skip: number) {
    return await this._studentRepository.getAllStudents(limit, skip);
  }

  async findAllTeachers() {
    const instructors = await this._instructorRepository.findAllInstructors();
    return instructors;
  }

  async blockTeacher(email: string) {
    const instructor = await this._instructorRepository.findInstructorByEmail(
      email
    );
    if (!instructor) {
      throw new Error(INSTRUCTOR_NOT_FOUND);
    }
    const id = instructor._id.toString();
    const res = await this._instructorRepository.updateById(id, {
      isBlocked: !instructor.isBlocked,
    });
    return res;
  }

  async approveTeacher(email: string) {
    // 1. Find the instructor
    const instructor = await this._instructorRepository.findInstructorByEmail(
      email
    );
    if (!instructor) {
      throw new Error(INSTRUCTOR_NOT_FOUND);
    }

    // 2. Generate a temporary password
    const tempPassword = generateTempPassword(8);
    console.log("tempPaws", tempPassword);

    // 3. Hash the temporary password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    // 4. Update instructor fields
    const id = instructor._id.toString();
    const res = await this._instructorRepository.updateById(id, {
      isBlocked: false, // unblock the user if needed
      isApproved: true,
      isTempPassword: true,
      password: hashedPassword,
    });

    // 5. Send approval email with credentials
    try {
      await sendApprovalEmail(email, tempPassword);
    } catch (err) {
      console.error("Failed to send approval email:", err);
    }

    return res;
  }

  async blockStudent(email: string) {
    const student = await this._studentRepository.findStudentByEmail(email);
    if (!student) throw new Error(STUDENT_NOT_FOUND);
    const update = await this._studentRepository.updateById(
      student._id.toString(),
      {
        isBlocked: !student.isBlocked,
      }
    );

    return update;
  }

  getPayouts = async () => {
    const payouts = await this._adminRepository.getPayouts();
    if (!payouts) {
      throw new Error("No payouts found");
    }
    return payouts;
  };

  async getDashboardData(filter?: {
    type: "weekly" | "monthly" | "yearly" | "custom";
    startDate?: Date;
    endDate?: Date;
  }) {
    const [
      totalRevenue,
      totalStudents,
      totalTeachers,
      totalCourses,
      revenueByPeriod,
      orderDetails,
    ] = await Promise.all([
      this._adminRepository.getTotalRevenue(filter),
      this._adminRepository.getTotalStudents(),
      this._adminRepository.getTotalTeachers(),
      this._adminRepository.getTotalCourses(),
      this._adminRepository.getRevenueByPeriod(filter),
      this._adminRepository.getOrderDetails(filter),
    ]);
    console.log(revenueByPeriod);

    return {
      totalRevenue,
      totalStudents,
      totalTeachers,
      totalCourses,
      revenueByPeriod,
      orderDetails,
    };
  }

  async getReportData(
    format: "pdf" | "excel",
    filter?: {
      type: "weekly" | "monthly" | "yearly" | "custom";
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    try {
      const datas = await this._adminRepository.getReportData(filter);
      const total = datas.totalRevenue || 0;
      const data = datas.orders || [];
      const totalRevenue = Number(total);
      if (format === "pdf") {
        const pdfBuffer = await generatePdfReport(data, totalRevenue);
        return {
          data: pdfBuffer,
          contentType: "application/pdf",
          filename: "admin_report.pdf",
        };
      } else {
        const excelBuffer = generateExcelReport(data, totalRevenue);
        return {
          data: excelBuffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          filename: "admin_report.xlsx",
        };
      }
    } catch (error) {
      console.error(`Error generating ${format} report:`, error);
      throw new Error(`Failed to generate ${format} report`);
    }
  }
}
