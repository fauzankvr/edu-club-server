import { Model } from "mongoose";
import { IPlan } from "../database/models/PlanModels";
import { BaseRepository } from "./base.repository";
import { IPlanRepository } from "../../application/interface/IPlanRepository";
import { PlanEntity, FeatureEntity } from "../../domain/entities/Plan";

const toEntity = (doc: IPlan): PlanEntity => {
    return new PlanEntity(
        doc._id.toString(),
        doc.name,
        doc.price,
        doc.billingPeriod,
        doc.features.map((feature) => new FeatureEntity(feature.description, feature.icon)),
        doc.isFeatured,
        doc.isBlocked,
        doc.createdAt,
        doc.updatedAt
    );
};

export class PlanRepository
  extends BaseRepository<IPlan, PlanEntity>
  implements IPlanRepository
{
  constructor(private _planModel: Model<IPlan>) {
    super(_planModel,toEntity);
  }

  async findNonBlocked(): Promise<PlanEntity[]> {
    const docs = await this._planModel.find({ isBlocked: false });
    return docs.map((doc) => toEntity(doc));
  }

  async countDocuments(): Promise<number> {
    return this._planModel.countDocuments();
  }

  async list(limit: number, skip: number): Promise<PlanEntity[]> {
    const docs = await this._planModel.find().limit(limit).skip(skip);
    return docs.map((doc) => toEntity(doc));
  }
}
