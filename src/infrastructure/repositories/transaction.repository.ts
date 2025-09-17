import { Model } from "mongoose";
import { ITransaction } from "../database/models/Transaction";
import { ITransactionRepository } from "../../application/interface/ITransactionRepository";
import { TransactionEntity } from "../../domain/entities/Transaction";

// Function to map Mongo document to entity
const toEntity = (doc: ITransaction): TransactionEntity => {
  return new TransactionEntity(
    doc._id.toString(),
    doc.studentId.toString(),
    doc.instructor,
    doc.courseId.toString(),
    doc.totalAmount,
    doc.adminShare,
    doc.instructorShare,
    doc.paymentStatus,
    doc.payoutStatus,
    doc.paypalTransactionId,
    doc.payoutId,
    doc.createdAt
  );
};

export class TransactionRepository implements ITransactionRepository {
  constructor(private _transactionModel: Model<ITransaction>) {}

  async getPendingPayments(email: string): Promise<TransactionEntity[]> {
    const result = await this._transactionModel.aggregate([
      { $match: { instructor: email } },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "courseId",
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "studentId",
        },
      },
      // {
      //   $addFields: {
      //     course: { $arrayElemAt: ["$course", 0] },
      //     student: { $arrayElemAt: ["$student", 0] },
      //   },
      // },
      {$unwind:"$courseId"},
      {$unwind:"$studentId"},
    ]);

    // Convert all results to entity instances
    return result.map(
      (doc: any) =>
        new TransactionEntity(
          doc._id.toString(),
          doc.studentId,
          doc.instructor,
          doc.courseId,
          doc.totalAmount,
          doc.adminShare,
          doc.instructorShare,
          doc.paymentStatus,
          doc.payoutStatus,
          doc.paypalTransactionId,
          doc.payoutId,
          doc.createdAt
        )
    );
  }
}
