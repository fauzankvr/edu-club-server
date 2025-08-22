import { IPlanCheckout } from "../../infrastructure/database/models/PlanCheckoutModel";

export interface IPlanCheckoutRepository {
  findPlanByUserId(userId: string): Promise<IPlanCheckout | null>;
}