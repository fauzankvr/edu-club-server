import { IPlan } from "../../infrastructure/database/models/PlanModels";
import { IPlanCheckoutRepo } from "../interface/IPlanCheckoutRepo";
import { IPlanRepo } from "../interface/IPlanRepo";



export class PlanUseCase {
  constructor(private planRepo: IPlanRepo, private planCheckoutRepo: IPlanCheckoutRepo) {}
  createPlan(plan: IPlan) {
    return this.planRepo.create(plan);
  }
  getPlans() {
    return this.planRepo.findAll();
  }
  getPlan(id: string) {
    return this.planRepo.findById(id);
  }
  findNonBlockedPlans() {
    return this.planRepo.findNonBlocked();
  }
  updatePlans(id: string, data: IPlan) {
    {
      return this.planRepo.updateById(id, data);
    }
  }
  blockPlan(id: string) {
    const plan = this.planRepo.findById(id);
    if (!plan) throw new Error("Plan not found");

    const updatedPlan = this.planRepo.updateById(id, {
      isBlocked: !plan.isBlocked,
    });
    if (!updatedPlan) throw new Error("Plan not found");
    return updatedPlan;
  }
  getOrderedPlan(id: string) {
    return this.planCheckoutRepo.findPlanByUserId(id);
  }
}