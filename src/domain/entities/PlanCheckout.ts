export class PlanCheckoutEntity {
  constructor(
    public readonly id: string,
    public userId: string,
    public planId: string,
    public paymentStatus: "pending" | "completed" | "failed" | "refunded",
    public amount: number,
    public currency: string,
    public paymentMethod: "paypal" | "free",
    public transactionId?: string,
    public startDate?: Date,
    public endDate?: Date,
    public paypalOrderId?: string,
    public paypalCaptureId?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
