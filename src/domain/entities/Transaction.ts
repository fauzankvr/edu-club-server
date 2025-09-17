export class TransactionEntity {
  constructor(
    public readonly id: string,
    public studentId: string,
    public instructor: string,
    public courseId: string,
    public totalAmount: number,
    public adminShare: number,
    public instructorShare: number,
    public paymentStatus: string,
    public payoutStatus: "PENDING" | "REQUESTED" | "COMPLETED" | "FAILED",
    public paypalTransactionId: string,
    public payoutId?: string,
    public createdAt?: Date
  ) {}
}
