import { IPlan } from "../../infrastructure/database/models/PlanModels";
import { IPlanCheckoutRepository } from "../interface/IPlanCheckoutRepository";
import { IPlanRepository } from "../interface/IPlanRepository";
import { IPlanUseCase } from "../interface/IPlanUseCase";

export class PlanUseCase implements IPlanUseCase {
  constructor(
    private _planRepository: IPlanRepository,
    private _planCheckoutRepository: IPlanCheckoutRepository
  ) {}
  createPlan(plan: IPlan) {
    return this._planRepository.create(plan);
  }
  getPlans(limit: number, skip: number) {
    return this._planRepository.findAllPlans(limit, skip);
  }
  getPlan(id: string) {
    return this._planRepository.findById(id);
  }
  findNonBlockedPlans() {
    return this._planRepository.findNonBlocked();
  }
  updatePlans(id: string, data: IPlan) {
    {
      return this._planRepository.updateById(id, data);
    }
  }

  getOrderedPlan(id: string) {
    return this._planCheckoutRepository.findPlanByUserId(id);
  }
  async getTotalPlansCount(): Promise<number> {
    return this._planRepository.countDocuments();
  }
}
