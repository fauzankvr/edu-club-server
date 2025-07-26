import { requestPayoutService } from "../../infrastructure/services/PayoutService";
import { IOrderRepo } from "../interface/IOrderRepo";
import { ITransactionRepo } from "../interface/ITransactionRepo";

export class OrderUseCase {
  constructor(
    private transacionRepo: ITransactionRepo,
    private orderRepository: IOrderRepo
  ) {}
  getPendingPayment(email: string) {
    const res = this.transacionRepo.getPendingPayments(email);
    if (!res) {
      throw new Error("Failed to retrieve pending payments");
    }
    return res;
  }

  getOrders(userId: string) {
    const res = this.orderRepository.getOrdersByUserId(userId);
    if (!res) {
      throw new Error("Failed to retrieve orders");
    }
    return res;
  }

  async requestPayout(instructorMail: string, paypalEmail: string) { 
    return await requestPayoutService(instructorMail, paypalEmail);
  }
  async getDashboardData(
    instructorId: string,
    filter?: {
      type: "weekly" | "monthly" | "yearly" | "custom";
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const [
      totalRevenue,
      totalEnrollments,
      monthlyRevenue,
      payoutSummary,
      orderDetails,
    ] = await Promise.all([
      this.orderRepository.getTotalRevenue(instructorId),
      this.orderRepository.getTotalEnrollments(instructorId),
      this.orderRepository.getMonthlyRevenue(instructorId, filter),
      this.orderRepository.getPayoutSummary(instructorId),
      this.orderRepository.getPaidOrderDetails(instructorId, filter),
    ]);

    const reviewRating = 4.6;

    return {
      totalRevenue,
      totalEnrollments,
      monthlyRevenue,
      payoutSummary,
      reviewRating,
      orderDetails,
    };
  }
}