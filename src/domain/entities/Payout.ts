export type PayoutStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export class PayoutEntity {
  constructor(
    public readonly id: string, 
    public instructor: string, 
    public amount: number,
    public paypalEmail: string,
   public requestStatus: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED",
    public payoutId?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  approve() {
    if (this.requestStatus !== "PENDING") {
      throw new Error("Only pending payouts can be approved.");
    }
    this.requestStatus = "APPROVED";
  }

  reject() {
    if (this.requestStatus !== "PENDING") {
      throw new Error("Only pending payouts can be rejected.");
    }
    this.requestStatus = "REJECTED";
  }

  complete() {
    if (this.requestStatus !== "APPROVED") {
      throw new Error("Only approved payouts can be completed.");
    }
    this.requestStatus = "COMPLETED";
  }
}
