import { Model } from "mongoose";
import { IPlan } from "../database/models/PlanModels";
import { BaseRepository } from "./base.repository";
import { IPlanRepo } from "../../application/interface/IPlanRepo";


export class PlanRepository extends BaseRepository<IPlan> implements IPlanRepo {
    constructor(private PlanModel: Model<IPlan>) {
        super(PlanModel)
     }
    findNonBlocked(): Promise<IPlan[]> {
        return this.PlanModel.find({ isBlocked: false });
    }
}