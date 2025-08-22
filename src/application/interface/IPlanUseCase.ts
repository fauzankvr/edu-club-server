import { IPlan } from "../../infrastructure/database/models/PlanModels";

export interface IPlanUseCase {
  createPlan(plan: IPlan): any;
  getPlans(limit: number, skip: number): any;
  getPlan(id: string): any;
  findNonBlockedPlans(): any;
  updatePlans(id: string, data: IPlan): any;
  getOrderedPlan(id: string): any;
  getTotalPlansCount(): Promise<number>;
}
