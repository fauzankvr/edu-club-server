import { Model } from "mongoose";
import  { ITransaction } from "../database/models/Transaction";
import { ITransactionRepository } from "../../application/interface/ITransactionRepository";

export class TransactionRepository implements ITransactionRepository {
  constructor(public _transactionModel:Model<ITransaction>) {}

  async getPendingPayments(email: string): Promise<ITransaction[]> {
    const result = await this._transactionModel.aggregate([
      {
        $match: {
          instructor: email,
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $addFields: {
          course: { $arrayElemAt: ["$course", 0] },
          student: { $arrayElemAt: ["$student", 0] },
        },
      },
    ]);
    return result;
  }
}
