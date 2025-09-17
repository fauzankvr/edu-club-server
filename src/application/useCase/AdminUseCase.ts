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
import { IPayoutRepository } from "../interface/IPayoutRepository";
import { IOrderRepository } from "../interface/IOrderRepository";
import { WeeklyStrategy } from "./Filter/WeeklyStrategy";
import { YearlyStrategy } from "./Filter/YearlyStrategy";
import { CustomStrategy } from "./Filter/CustomStrategy";
import { IDateRangeStrategy } from "./Filter/IDateRangeStrategy";
import { DashboardFilter } from "../interface/Dto/IDateStrategy";
import ICourseRepository from "../interface/ICourseRepository";


export class AdminUseCase implements IAdminUseCase {
  constructor(
    private _adminRepository: IAdminRepository,
    private _studentRepository: IStudentRepository,
    private _instructorRepository: IInstructorRepository,
    private _payoutRepository: IPayoutRepository,
    private _orderRepository: IOrderRepository,
    private _courseRepository: ICourseRepository
  ) {}

  async loginAdmin(email: string, password: string) {
    const adminData = await this._adminRepository.findByEmail(email);
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
    return this._studentRepository.count();
  }
  async findAllStudents(limit: number, skip: number) {
    return await this._studentRepository.list(limit, skip);
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
    const id = instructor.id;
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
    const id = instructor.id;
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
    const student = await this._studentRepository.findByEmail(email);
    if (!student) throw new Error(STUDENT_NOT_FOUND);
    if (!student.id) throw new Error(STUDENT_NOT_FOUND);
    const update = await this._studentRepository.updateById(student.id, {
      isBlocked: !student.isBlocked,
    });

    return update;
  }

  getPayouts = async () => {
    const payouts = await this._payoutRepository.getPayouts();
    if (!payouts) {
      throw new Error("No payouts found");
    }
    return payouts;
  };

  private getStrategy(filter?: DashboardFilter): IDateRangeStrategy {
    if (!filter) return { getDateRange: () => ({}) };

    switch (filter.type) {
      case "weekly":
        return new WeeklyStrategy();
      case "yearly":
        return new YearlyStrategy();
      case "custom":
        return new CustomStrategy(filter.startDate!, filter.endDate!);
      default:
        return { getDateRange: () => ({}) };
    }
  }

  async getDashboardData(filter?: DashboardFilter) {
    // Step 1: Get strategy
    const strategy = this.getStrategy(filter);

    // Step 2: Get date range from strategy
    const dateRange = strategy.getDateRange();

    // Step 3: Build your match stage
    const matchStage = { status: "PAID", ...dateRange };

    // Step 4: Call repositories
    const [
      totalRevenue,
      totalStudents,
      totalTeachers,
      totalCourses,
      revenueByPeriod,
      orderDetails,
    ] = await Promise.all([
      this._orderRepository.getTotalRevenue(matchStage),
      this._studentRepository.count(),
      this._instructorRepository.count(),
      this._courseRepository.count(),
      this._orderRepository.getRevenueByPeriod(matchStage, filter?.type || ""),
      this._orderRepository.getOrderDetails(matchStage),
    ]);

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
     const strategy = this.getStrategy(filter);

      const { startDate, endDate } = strategy.getDateRange();
      const matchStage = {status:"PAID", type:filter?.type,startDate:startDate,endDate:endDate};
     const datas = await this._orderRepository.getReportData(matchStage);
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
