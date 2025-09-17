import { PlanEntity } from "../../domain/entities/Plan";
import { IBaseRepo } from "./IBaseRepository";

export interface IPlanRepository extends IBaseRepo<PlanEntity> {
  findNonBlocked(): Promise<PlanEntity[]>;
  countDocuments(): Promise<number>;
  list(limit: number, skip: number): Promise<PlanEntity[]>;
}
