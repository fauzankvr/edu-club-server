import { Model } from "mongoose";
import { IPlanCheckout } from "../database/models/PlanCheckoutModel";

export class PlanCheckoutRepository {
    constructor(private planCheckoutModel: Model<IPlanCheckout>) { }
    async findPlanByUserId(userId: string): Promise<IPlanCheckout | null> {
        return await this.planCheckoutModel.findOne({ userId ,paymentStatus:"completed"}).populate("planId").sort({ createdAt: -1 });
    }
}