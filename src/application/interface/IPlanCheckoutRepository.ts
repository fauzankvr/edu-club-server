import { PlanCheckoutEntity } from "../../domain/entities/PlanCheckout";

export interface IPlanCheckoutRepository {
  findByUserId(userId: string): Promise<PlanCheckoutEntity | null>;
}