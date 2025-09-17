import { FeatureEntity, PlanEntity } from "../../domain/entities/Plan";
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
    const featureEntities: FeatureEntity[] = plan.features.map(
      (f) => new FeatureEntity(f.description, f.icon, f.isAvailable ?? true)
    );

    const planData = new PlanEntity(
      plan.id,
      plan.name,
      plan.price,
      plan.billingPeriod,
      featureEntities,
      plan.isFeatured,
      plan.isBlocked,
      plan.createdAt,
      plan.updatedAt
    );

    return this._planRepository.create(planData);
  }

  getPlans(limit: number, skip: number) {
    return this._planRepository.list(limit, skip);
  }
  getPlan(id: string) {
    return this._planRepository.findById(id);
  }
  findNonBlockedPlans() {
    return this._planRepository.findNonBlocked();
  }
  updatePlans(id: string, data: IPlan) {
    const featureEntities: FeatureEntity[] = data.features.map(
      (f) => new FeatureEntity(f.description, f.icon, f.isAvailable ?? true)
    );

    const planEntity = new PlanEntity(
      id,
      data.name,
      data.price,
      data.billingPeriod,
      featureEntities,
      data.isFeatured,
      data.isBlocked,
      data.createdAt,
      new Date() // update updatedAt timestamp
    );

    return this._planRepository.updateById(id, planEntity);
  }

  getOrderedPlan(id: string) {
    return this._planCheckoutRepository.findByUserId(id);
  }
  async getTotalPlansCount(): Promise<number> {
    return this._planRepository.countDocuments();
  }
}
