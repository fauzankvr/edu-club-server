import mongoose, { Model } from "mongoose";
import { IOrderRepository } from "../../application/interface/IOrderRepository";
import { IOrder } from "../database/models/OrderModel";
import CourseModel from "../database/models/CourseModel";

export class OrderRepository implements IOrderRepository {
  constructor(
    private _orderModel: Model<IOrder>,
    private _payoutModel: Model<any>
  ) {}

  async getOrderById(paypalOrderId: string): Promise<any> {
    return await this._orderModel.findOne({ paypalOrderId });
  }

  async getOrdersByUserId(userId: string): Promise<IOrder[]> {
    return await this._orderModel.aggregate([
      { $match: { userId: userId } },
      {
        $addFields: {
          courseObjectId: { $toObjectId: "$courseId" }, // Convert to ObjectId
        },
      },
      {
        $lookup: {
          from: "courses", // Make sure this matches the actual collection name
          localField: "courseObjectId",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      {
        $unwind: {
          path: "$courseDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }

  async findPaidCourses(id: string): Promise<any> {
    const courses = await this._orderModel.aggregate([
      {
        $match: {
          userId: id.trim(),
          status: "PAID",
        },
      },
      {
        $lookup: {
          from: "courses",
          let: { courseIdString: "$courseId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$courseIdString", { $toString: "$_id" }],
                },
              },
            },
          ],
          as: "courseDetails",
        },
      },
      {
        $unwind: {
          path: "$courseDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          orderDetails: "$$ROOT",
          courseDetails: 1,
        },
      },
    ]);
    return courses;
  }

  async getTotalRevenue(instructorId: string): Promise<number> {
    const result = await this._orderModel.aggregate([
      {
        $match: {
          status: "PAID",
          courseId: { $in: await this.getInstructorCourseIds(instructorId) },
        },
      },
      { $group: { _id: null, total: { $sum: "$priceUSD" } } },
    ]);
    return result[0]?.total || 0;
  }

  async getTotalEnrollments(instructorId: string): Promise<number> {
    return this._orderModel.countDocuments({
      status: "PAID",
      courseId: { $in: await this.getInstructorCourseIds(instructorId) },
    });
  }

  async getMonthlyRevenue(
    instructorId: string,
    filter?: {
      type: "weekly" | "monthly" | "yearly" | "custom";
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ name: string; uv: number }[]> {
    const matchStage: any = {
      status: "PAID",
      courseId: { $in: await this.getInstructorCourseIds(instructorId) },
    };

    if (filter) {
      if (filter.type === "custom" && filter.startDate && filter.endDate) {
        matchStage.createdAt = { $gte: filter.startDate, $lte: filter.endDate };
      } else if (filter.type === "weekly") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        matchStage.createdAt = { $gte: oneWeekAgo };
      } else if (filter.type === "yearly") {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        matchStage.createdAt = { $gte: oneYearAgo };
      }
    }

    const result = await this._orderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id:
            filter?.type === "weekly"
              ? { $dayOfWeek: "$createdAt" }
              : { $month: "$createdAt" },
          total: { $sum: "$priceUSD" },
        },
      },
      {
        $project: {
          name: {
            $cond: {
              if: { $eq: [filter?.type, "weekly"] },
              then: {
                $arrayElemAt: [
                  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                  { $subtract: ["$_id", 1] },
                ],
              },
              else: {
                $arrayElemAt: [
                  [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                  { $subtract: ["$_id", 1] },
                ],
              },
            },
          },
          uv: "$total",
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Transform to include all periods
    const allPeriods =
      filter?.type === "weekly"
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        : [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
    const revenueMap = new Map(result.map((item) => [item.name, item.uv]));
    return allPeriods.map((period) => ({
      name: period,
      uv: revenueMap.get(period) || 0,
    }));
  }

  async getPayoutSummary(
    instructorId: string
  ): Promise<{ totalPayout: number; pendingPayout: number }> {
    const result = await this._payoutModel.aggregate([
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
    return summary;
  }

  async getPaidOrderDetails(
    instructorId: string,
    filter?: {
      type: "weekly" | "monthly" | "yearly" | "custom";
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<any[]> {
    const matchStage: any = {
      status: "PAID",
      courseId: { $in: await this.getInstructorCourseIds(instructorId) },
    };

    if (filter) {
      if (filter.type === "custom" && filter.startDate && filter.endDate) {
        matchStage.createdAt = { $gte: filter.startDate, $lte: filter.endDate };
      } else if (filter.type === "weekly") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        matchStage.createdAt = { $gte: oneWeekAgo };
      } else if (filter.type === "yearly") {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        matchStage.createdAt = { $gte: oneYearAgo };
      }
    }

    const orders = await this._orderModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "courses",
          let: { courseIdString: "$courseId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$courseIdString", { $toString: "$_id" }],
                },
              },
            },
            {
              $project: {
                title: 1,
                courseImageId: 1,
              },
            },
          ],
          as: "courseDetails",
        },
      },
      {
        $unwind: {
          path: "$courseDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "students",
          let: { userIdString: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$userIdString", { $toString: "$_id" }],
                },
              },
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
              },
            },
          ],
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          courseName: "$courseDetails.title",
          courseImage: "$courseDetails.courseImageId",
          studentName: {
            $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"],
          },
          price: "$priceUSD",
          date: "$createdAt",
        },
      },
      { $sort: { date: -1 } }, // Sort by date descending
    ]);

    return orders;
  }

  private async getInstructorCourseIds(
    instructorId: string
  ): Promise<string[]> {
    const courses = await CourseModel.find({
      instructor: instructorId,
    }).select("_id");
    return courses.map((course) => course._id.toString());
  }
}
