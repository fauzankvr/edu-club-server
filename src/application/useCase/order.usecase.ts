import { requestPayoutService } from "../../infrastructure/services/PayoutService";
import { DashboardFilter } from "../interface/Dto/IDateStrategy";
import ICourseRepository from "../interface/ICourseRepository";
import IInstructorRepository from "../interface/IInstructorRepository";
import { IOrderRepository } from "../interface/IOrderRepository";
import { IOrderUseCase } from "../interface/IOrderUseCase";
import { IPayoutRepository } from "../interface/IPayoutRepository";
import IStudentRepository from "../interface/IStudentRepository";
import { ITransactionRepository } from "../interface/ITransactionRepository";
import { CustomStrategy } from "./Filter/CustomStrategy";
import { IDateRangeStrategy } from "./Filter/IDateRangeStrategy";
import { WeeklyStrategy } from "./Filter/WeeklyStrategy";
import { YearlyStrategy } from "./Filter/YearlyStrategy";

export class OrderUseCase implements IOrderUseCase {
  constructor(
    private _transactionRepository: ITransactionRepository,
    private _orderRepository: IOrderRepository,
    private _studentRepository: IStudentRepository,
    private _instructorRepository: IInstructorRepository,
    private _courseRepository: ICourseRepository,
    private _payoutRepository:IPayoutRepository
  ) {}
  getPendingPayment(email: string) {
    const res = this._transactionRepository.getPendingPayments(email);
    if (!res) {
      throw new Error("Failed to retrieve pending payments");
    }
    return res;
  }

  getOrders(userId: string) {
    const res = this._orderRepository.getOrdersByUserId(userId);
    if (!res) {
      throw new Error("Failed to retrieve orders");
    }
    return res;
  }

  async requestPayout(instructorMail: string, paypalEmail: string) {
    return await requestPayoutService(instructorMail, paypalEmail);
  }
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
  
  async getDashboard(instructor:string, filter?: DashboardFilter) {
    // Step 1: Get strategy
    const strategy = this.getStrategy(filter);

    // Step 2: Get date range from strategy
    const dateRange = strategy.getDateRange();

    // Step 3: Build your match stage
    const matchStage = { status: "PAID", ...dateRange };
    console.log(filter?.type)

    // Step 4: Call repositories
    const [
      totalRevenue,
      totalCourses,
      revenueByPeriod,
      payoutSummary,
      orderDetails,
    ] = await Promise.all([
      this._orderRepository.getTotalRevenue(matchStage),
      (await this._courseRepository.findByInstructor(instructor)).length,
      this._orderRepository.getRevenueByPeriod(matchStage, filter?.type || ""),
      this._payoutRepository.getPayoutSummary(instructor),
      this._orderRepository.getOrderDetails(matchStage),
    ]);
    console.log(revenueByPeriod);

    return {
      totalRevenue,
      totalCourses,
      revenueByPeriod,
      payoutSummary,
      orderDetails,
    };
  }
}
