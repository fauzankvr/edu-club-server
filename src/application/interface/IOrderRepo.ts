import { ICourse } from "../../infrastructure/database/models/CourseModel";
import { IOrder } from "../../infrastructure/database/models/OrderModel";

export interface IOrderRepo {
  getOrderById(paypalOrderId: string): Promise<IOrder | null>;
  getOrdersByUserId(userId:string):Promise<IOrder[]>
  findPaidCourses(id: string): Promise<
    Array<{
      orderDetails: IOrder & { courseDetails?: never };
      courseDetails: ICourse | null;
    }>
  >;

  getTotalRevenue(instructorId: string): Promise<number>;
  getTotalEnrollments(instructorId: string): Promise<number>;
  getMonthlyRevenue(
    instructorId: string,
    filter: any
  ): Promise<{ name: string; uv: number }[]>;
  getPayoutSummary(
    instructorId: string
  ): Promise<{ totalPayout: number; pendingPayout: number }>;
  getPaidOrderDetails(instructorId: string, filter?: any): Promise<any[]>;
}
