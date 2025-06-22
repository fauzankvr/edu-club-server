import { IPlanCheckout } from "../../infrastructure/database/models/PlanCheckoutModel";

export interface IPlanCheckoutRepo {
  findPlanByUserId(userId: string): Promise<IPlanCheckout | null>;
}