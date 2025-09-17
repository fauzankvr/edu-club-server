import { Model } from "mongoose";
import { IPlanCheckout } from "../database/models/PlanCheckoutModel";
import { IPlanCheckoutRepository } from "../../application/interface/IPlanCheckoutRepository";
import { PlanCheckoutEntity } from "../../domain/entities/PlanCheckout";

export class PlanCheckoutRepository implements IPlanCheckoutRepository {
  constructor(private _planCheckoutModel: Model<IPlanCheckout>) {}

  private toEntity(planCheckout: IPlanCheckout): PlanCheckoutEntity {
    return new PlanCheckoutEntity(
      planCheckout._id.toString(),
      planCheckout.userId.toString(),
      planCheckout.planId.toString(),
      planCheckout.paymentStatus,
      planCheckout.amount,
      planCheckout.currency,
      planCheckout.paymentMethod,
      planCheckout.transactionId,
      planCheckout.startDate,
      planCheckout.endDate,
      planCheckout.paypalOrderId,
      planCheckout.paypalCaptureId,
      planCheckout.createdAt,
      planCheckout.updatedAt
    );
  }

  async findByUserId(userId: string): Promise<PlanCheckoutEntity | null> {
    const planCheckout = await this._planCheckoutModel
      .findOne({ userId, paymentStatus: "completed" })
      .populate("planId")
      .sort({ createdAt: -1 });

    return planCheckout ? this.toEntity(planCheckout) : null;
  }
}
