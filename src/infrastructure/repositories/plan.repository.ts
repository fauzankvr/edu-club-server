import { Model } from "mongoose";
import { IPlan } from "../database/models/PlanModels";
import { BaseRepository } from "./base.repository";
import { IPlanRepository } from "../../application/interface/IPlanRepository";


export class PlanRepository extends BaseRepository<IPlan> implements IPlanRepository {
    constructor(private _planModel: Model<IPlan>) {
        super(_planModel)
     }
    findNonBlocked(): Promise<IPlan[]> {
        return this._planModel.find({ isBlocked: false });
    }
    countDocuments(): Promise<number> {
        return this._planModel.countDocuments();
    }
    findAllPlans(limit: number, skip: number): Promise<IPlan[]> {
        return this._planModel.find().limit(limit).skip(skip);
    }
}