import { requestPayoutService } from "../../infrastructure/services/PayoutService";
import { IOrderRepository } from "../interface/IOrderRepository";
import { IOrderUseCase } from "../interface/IOrderUseCase";
import { ITransactionRepository } from "../interface/ITransactionRepository";

export class OrderUseCase implements IOrderUseCase {
  constructor(
    private _transactionRepository: ITransactionRepository,
    private _orderRepository: IOrderRepository
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
      this._orderRepository.getTotalRevenue(instructorId),
      this._orderRepository.getTotalEnrollments(instructorId),
      this._orderRepository.getMonthlyRevenue(instructorId, filter),
      this._orderRepository.getPayoutSummary(instructorId),
      this._orderRepository.getPaidOrderDetails(instructorId, filter),
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
