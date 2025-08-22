export interface IOrderUseCase {
  getPendingPayment(email: string): any;
  getOrders(userId: string): any;
  requestPayout(instructorMail: string, paypalEmail: string): Promise<any>;
  getDashboardData(
    instructorId: string,
    filter?: {
      type: "weekly" | "monthly" | "yearly" | "custom";
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<any>;
}
