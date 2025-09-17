import { Model } from "mongoose";
import { PayoutEntity } from "../../domain/entities/Payout";
import { IPayoutRepository } from "../../application/interface/IPayoutRepository"; 
import PayoutRequestModel, { IPayoutRequest } from "../database/models/PayoutModel";

export class PayoutRepository implements IPayoutRepository {
  private _model: Model<IPayoutRequest>;

  constructor() {
    this._model = PayoutRequestModel;
  }

  private toEntity(doc: IPayoutRequest): PayoutEntity {
    return new PayoutEntity(
      doc._id.toString(),
      doc.instructor,
      doc.amount,
      doc.paypalEmail,
      doc.requestStatus,
      doc.payoutId,
      doc.createdAt,
      doc.updatedAt
    );
  }

  async getPayouts(): Promise<PayoutEntity[]> {
    const result = await this._model.aggregate([
      {
        $lookup: {
          from: "instructors",
          localField: "instructor",
          foreignField: "email",
          as: "instructorDetails",
        },
      },
      {
        $unwind: {
          path: "$instructorDetails",
          preserveNullAndEmptyArrays: true, // in case instructor is missing
        },
      },
      {
        $project: {
          _id: 1,
          amount: 1,
          paypalEmail: 1,
          requestStatus: 1,
          payoutId: 1,
          createdAt: 1,
          updatedAt: 1,
          instructor: {
            _id: "$instructorDetails._id",
            fullName: "$instructorDetails.fullName",
          },
        },
      },
    ]);

    return result.map((doc) => this.toEntity(doc as IPayoutRequest));
  }

  async findByInstructor(instructorId: string): Promise<PayoutEntity[]> {
    const payouts = await this._model.find({ instructor: instructorId });
    return payouts.map((payout) => this.toEntity(payout));
  }

  async getPayoutSummary(
    instructorId: string
  ): Promise<{ totalPayout: number; pendingPayout: number }> {
    const result = await this._model.aggregate([
      { $match: { instructor: instructorId } },
      {
        $group: {
          _id: "$requestStatus",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const summary = { totalPayout: 0, pendingPayout: 0 };
    result.forEach((item) => {
      if (item._id === "COMPLETED") summary.totalPayout = item.total;
      if (item._id === "PENDING") summary.pendingPayout = item.total;
    });
    console.log(summary)
    return summary;
  }
}
