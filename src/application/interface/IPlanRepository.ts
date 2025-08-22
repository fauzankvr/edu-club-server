import { IPlan } from "../../infrastructure/database/models/PlanModels";
import { IBaseRepo } from "./IBaseRepository";

export interface IPlanRepository extends IBaseRepo<IPlan> {
  findNonBlocked(): Promise<IPlan[]>
  countDocuments(): Promise<number>;
  findAllPlans(limit: number, skip: number): Promise<IPlan[]>;
}