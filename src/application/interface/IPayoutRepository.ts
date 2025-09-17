import { PayoutEntity } from "../../domain/entities/Payout"; 

export interface IPayoutRepository {
  getPayouts(): Promise<PayoutEntity[]>;
  findByInstructor(instructorId: string): Promise<PayoutEntity[]>
  
  getPayoutSummary(
    instructorId: string
  ): Promise<{ totalPayout: number; pendingPayout: number }>;
}
