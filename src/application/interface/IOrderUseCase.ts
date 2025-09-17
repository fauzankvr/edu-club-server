import { DashboardFilter } from "./Dto/IDateStrategy";

export interface IOrderUseCase {
  getPendingPayment(email: string): any;
  getOrders(userId: string): any;
  requestPayout(instructorMail: string, paypalEmail: string): Promise<any>;
  getDashboardData(filter?: DashboardFilter): Promise<any>;
  getDashboard(instructor: string, filter?: DashboardFilter): Promise<any>;
}
