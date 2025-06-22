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

  getOrderedPlan(id: string) {
    return this.planCheckoutRepo.findPlanByUserId(id);
  }
}