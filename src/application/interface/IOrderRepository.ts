import { OrderEntity } from "../../domain/entities/Order";
import { ICourse } from "../../infrastructure/database/models/CourseModel";

export interface IOrderRepository {
  getOrderById(paypalOrderId: string): Promise<OrderEntity | null>;
  getOrdersByUserId(userId: string): Promise<OrderEntity[]>;

  findPaidCourses(id: string): Promise<
    Array<{
      orderDetails: OrderEntity & { courseDetails?: never };
      courseDetails: ICourse | null;
    }>
  >;

  getTotalRevenue(dateRange?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<number>;

  getTotalEnrollments(instructorId: string): Promise<number>;
  getMonthlyRevenue(
    instructorId: string,
    filter: any
  ): Promise<{ name: string; uv: number }[]>;

  getPaidOrderDetails(instructorId: string, filter?: any): Promise<any[]>;
  getRevenueByPeriod(matchStage: any, groupBy: string): Promise<any[]>;
  getOrderDetails(matchStage: any): Promise<any[]>;
  getReportData(matchStage: any): Promise<any>;
}
