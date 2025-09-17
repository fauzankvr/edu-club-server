export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly quantity: number,
    public readonly paypalOrderId: string,
    public readonly status: "PENDING" | "PAID" | "FAILED",
    public readonly priceUSD: number,
    public readonly createdAt: Date
  ) {}
}
