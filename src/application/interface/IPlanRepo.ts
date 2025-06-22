import { IPlan } from "../../infrastructure/database/models/PlanModels";
import { IBaseRepo } from "./IBaseRepo";

export interface IPlanRepo extends IBaseRepo<IPlan> {
  findNonBlocked(): Promise<IPlan[]>
}